// Автотесты расширенной базы: новые объекты, дубли, обязательные поля, неизменность старых товаров.
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const DATA = require("../js/data/questions.js");
const S = require("../js/scoring.js");
const RARITY = require("../js/rarity-config.js");

const OLD = require("./fixtures/old-items-2026-10-11.json").items;
const OLD_IDS = new Set(Object.keys(OLD));
const NEW = DATA.QUESTIONS.filter((q) => !OLD_IDS.has(q.id));
const PRICE_TYPES = ["new_msrp", "used_market", "auction", "private_sale", "listing_ask", "estimate", "unit_cost", "construction_cost"];

// Старым товарам намеренно поменяли только редкость — вот этим (обоснование в отчёте):
const OLD_RARITY_CHANGED = {
  "rolex-daytona-steel": "EPIC", "rolex-submariner-gold": "RARE", "rolex-submariner-steel": "RARE",
  "rolex-oyster-perpetual-41": "RARE", "omega-speedmaster": "RARE", "omega-seamaster-bond": "RARE",
  "tiffany-t-narrow-ring": "COMMON", "iphone-duo": "RARE", "sandisk-8tb-ps5": "RARE",
  "la-mer-creme": "COMMON", "dyson-v15-detect": "COMMON", "arcteryx-beta-jacket": "COMMON",
  "apple-watch-ultra-4": "COMMON", "macbook-pro-14": "COMMON", "mac-studio": "COMMON",
  "airpods-max-2": "COMMON", "dji-mini-4-pro": "COMMON", "ps5-pro": "COMMON",
  "sony-inzone-m10s": "COMMON", "tissot-prx-40": "COMMON"
};

// Пары, которые проверены вручную и признаны РАЗНЫМИ объектами (похожие названия, но другая версия)
const REVIEWED_NOT_DUPES = new Set([
  "car-corvette-z06-2027|car-corvette-zr1-2027",
  "pt-unitree-g1|pt-unitree-h1", "pt-unitree-g1|pt-unitree-r1", "pt-unitree-h1|pt-unitree-r1"
]);

function tokens(s) {
  const STOP = new Set("the a of and de la le du des s no ref edition version new model car lot".split(" "));
  return new Set((s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().match(/[a-zа-яё0-9]+/g) || [])
    .filter((t) => t.length > 1 && !STOP.has(t)));
}
const keyOf = (q) => tokens([q.brand, q.model, q.title, ...(q.aliases || [])].join(" "));
const norm = (s) => [...tokens(s)].sort().join(" ");

test("база: не меньше 200 новых уникальных объектов сверх прежних 100", () => {
  assert.equal(OLD_IDS.size, 100);
  OLD_IDS.forEach((id) => assert.ok(DATA.QUESTIONS.some((q) => q.id === id), `старый товар ${id} удалён`));
  assert.ok(NEW.length >= 200, `новых объектов: ${NEW.length}`);
  console.log("новых объектов:", NEW.length, "из них в игре (с фото):", NEW.filter((q) => q.status === "verified").length);
});

test("база: старые товары не изменились (кроме задокументированной редкости)", () => {
  for (const q of DATA.QUESTIONS.filter((x) => OLD_IDS.has(x.id))) {
    const { rarity, ...rest } = q;
    const h = crypto.createHash("sha256").update(JSON.stringify(rest)).digest("hex").slice(0, 16);
    assert.equal(h, OLD[q.id], `${q.id} изменился`);
    if (OLD_RARITY_CHANGED[q.id]) assert.equal(rarity, OLD_RARITY_CHANGED[q.id], `${q.id}: редкость`);
  }
});

test("база: id уникальны, нет точных дублей названий во всей базе", () => {
  const ids = new Set();
  const names = new Map();
  for (const q of DATA.QUESTIONS) {
    assert.ok(!ids.has(q.id), `повтор id ${q.id}`);
    ids.add(q.id);
    for (const n of new Set([norm(q.title), norm(q.brand + " " + q.model)])) {
      assert.ok(!names.has(n) || names.get(n) === q.id, `одинаковое название: ${q.id} и ${names.get(n)} («${n}»)`);
      names.set(n, q.id);
    }
  }
});

test("база: смысловые дубли — все похожие пары проверены вручную", () => {
  const all = DATA.QUESTIONS.map((q) => ({ q, k: keyOf(q) }));
  const suspicious = [];
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i], b = all[j];
      if (OLD_IDS.has(a.q.id) && OLD_IDS.has(b.q.id)) continue;
      const inter = [...a.k].filter((t) => b.k.has(t)).length;
      const jac = inter / (a.k.size + b.k.size - inter);
      if (jac >= 0.5) {
        const pair = [a.q.id, b.q.id].sort().join("|");
        if (!REVIEWED_NOT_DUPES.has(pair)) suspicious.push(`${pair} (${jac.toFixed(2)})`);
      }
    }
  }
  assert.deepEqual(suspicious, [], "непроверенные похожие пары");
});

test("база: у новых объектов все обязательные поля и корректные значения", () => {
  const serverMax = Number(fs.readFileSync(path.join(__dirname, "../server/src/game.js"), "utf8").match(/MAX_GUESS\s*=\s*([0-9e.]+)/)[1]);
  for (const q of NEW) {
    const id = q.id;
    assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${id}: формат id`);
    assert.ok(DATA.CATEGORIES[q.category], `${id}: категория`);
    for (const k of ["brand", "model", "title", "subtitle", "note", "rarityReason"]) assert.ok(q[k] && String(q[k]).trim(), `${id}: ${k}`);
    assert.ok(q.price >= 100 && q.price <= serverMax, `${id}: цена ${q.price} вне диапазона`);
    assert.equal(q.currency, "USD");
    assert.ok(DATA.REGIONS[q.region], `${id}: регион`);
    assert.ok(PRICE_TYPES.includes(q.priceType), `${id}: тип цены ${q.priceType}`);
    assert.match(q.priceDate, /^\d{4}(-\d{2}){0,2}$/, `${id}: дата цены`);
    assert.match(q.source.url, /^https:\/\//, `${id}: источник`);
    assert.ok(q.source.label, `${id}: подпись источника`);
    assert.match(q.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(RARITY.ORDER.includes(q.rarity), `${id}: редкость`);
    if (q.status === "verified") {
      assert.match(q.image.remote, /^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//, `${id}: фото`);
      assert.ok(["exact", "same-model"].includes(q.image.match), `${id}: совпадение фото`);
      assert.ok(q.image.credit, `${id}: автор/лицензия фото`);
    } else {
      assert.equal(q.status, "needs-image");
      assert.equal(q.image, null);
    }
  }
});

test("база: фото не повторяются у разных объектов", () => {
  const seen = new Map();
  for (const q of DATA.QUESTIONS) {
    if (!q.image || !q.image.remote) continue;
    assert.ok(!seen.has(q.image.remote), `одно фото у ${q.id} и ${seen.get(q.image.remote)}`);
    seen.set(q.image.remote, q.id);
  }
});

test("игра: объекты без фото не попадают в раунды сервера, а все уровни редкости доступны", () => {
  // Так же фильтрует сервер (server/src/index.js): status === "verified" && price > 0
  const playable = DATA.QUESTIONS.filter((q) => q.status === "verified" && q.price > 0);
  assert.ok(playable.every((q) => q.image && q.image.remote));
  const counts = {};
  playable.forEach((q) => { counts[q.rarity] = (counts[q.rarity] || 0) + 1; });
  RARITY.ORDER.forEach((r) => assert.ok(counts[r] > 0, `в игре нет объектов редкости ${r}`));
  let a = 0x2f6e2b1;
  const random = () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
  for (let i = 0; i < 2000; i++) {
    const r = S.pickRound(playable, 5, [], random);
    assert.equal(new Set(r.map((q) => q.id)).size, 5);
    assert.ok(r.every((q) => q.status === "verified"));
  }
  console.log("в игре по редкости:", JSON.stringify(counts));
});
