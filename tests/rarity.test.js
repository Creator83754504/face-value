// Автотесты системы редкости: настройки, розыгрыш, запасной выбор, отсутствие повторов, статистика.
const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../js/scoring.js");
const RARITY = require("../js/rarity-config.js");
const DATA = require("../js/data/questions.js");

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Синтетические товары для проверки запасного выбора
function makeItems(counts) {
  const out = [];
  const cats = ["tech", "fashion", "accessories", "beauty", "gaming", "home", "food", "everyday"];
  Object.entries(counts).forEach(([rarity, n]) => {
    for (let i = 0; i < n; i++) {
      out.push({ id: `${rarity}-${i}`, category: cats[(out.length) % cats.length], price: 10 + out.length * 37, rarity });
    }
  });
  return out;
}

test("настройки: заданные вероятности 90 / 7 / 2,5 / 0,5 %, сумма = 100%", () => {
  assert.deepEqual(RARITY.ORDER, ["COMMON", "RARE", "EPIC", "LEGENDARY"]);
  assert.equal(RARITY.WEIGHTS.COMMON, 0.90);
  assert.equal(RARITY.WEIGHTS.RARE, 0.07);
  assert.equal(RARITY.WEIGHTS.EPIC, 0.025);
  assert.equal(RARITY.WEIGHTS.LEGENDARY, 0.005);
  assert.equal(S.validateRarityConfig(RARITY), true);
  assert.equal(S.RARITY, RARITY, "игра использует именно центральные настройки");
});

test("настройки: неправильные отклоняются", () => {
  const base = JSON.parse(JSON.stringify(RARITY));
  assert.throws(() => S.validateRarityConfig({ ...base, WEIGHTS: { ...base.WEIGHTS, COMMON: 0.95 } }), /сумма/);
  assert.throws(() => S.validateRarityConfig({ ...base, WEIGHTS: { ...base.WEIGHTS, RARE: -0.07, COMMON: 1.04 } }), /неверный/);
  assert.throws(() => S.validateRarityConfig({ ...base, WEIGHTS: { ...base.WEIGHTS, MYTHIC: 0 } }), /ORDER/);
  assert.throws(() => S.validateRarityConfig(null));
});

test("розыгрыш: границы интервалов точно соответствуют шансам", () => {
  const at = (x) => S.rollRarity(() => x, RARITY);
  assert.equal(at(0), "COMMON");
  assert.equal(at(0.8999999), "COMMON");
  assert.equal(at(0.9), "RARE");
  assert.equal(at(0.9699999), "RARE");
  assert.equal(at(0.97), "EPIC");
  assert.equal(at(0.9949999), "EPIC");
  assert.equal(at(0.995), "LEGENDARY");
  assert.equal(at(0.9999999), "LEGENDARY");
});

test("розыгрыш: смена настроек меняет поведение без правки логики", () => {
  const cfg = { ...RARITY, WEIGHTS: { COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 1 } };
  const items = makeItems({ COMMON: 10, LEGENDARY: 10 });
  const r = S.pickRoundDetailed(items, 5, [], mulberry32(1), 2, cfg);
  assert.ok(r.questions.every((q) => q.rarity === "LEGENDARY"));
});

test("запасной выбор: нет нужной редкости → берём более частую, повторов нет", () => {
  const items = makeItems({ COMMON: 20, RARE: 1 }); // EPIC и LEGENDARY отсутствуют
  const random = mulberry32(42);
  for (let i = 0; i < 2000; i++) {
    const r = S.pickRoundDetailed(items, 5, [], random);
    assert.equal(new Set(r.questions.map((q) => q.id)).size, 5);
    r.rolls.forEach((x) => {
      if (x.rolled === "LEGENDARY" || x.rolled === "EPIC") assert.ok(x.used === "RARE" || x.used === "COMMON", JSON.stringify(x));
      if (x.rolled === "COMMON") assert.equal(x.used, "COMMON");
    });
  }
  assert.deepEqual(S.fallbackOrder("EPIC", RARITY), ["EPIC", "RARE", "COMMON", "LEGENDARY"]);
  assert.deepEqual(S.fallbackOrder("COMMON", RARITY), ["COMMON", "RARE", "EPIC", "LEGENDARY"]);
});

test("запасной выбор: уже показанный в раунде редкий товар не повторяется", () => {
  const items = makeItems({ COMMON: 10, LEGENDARY: 1 });
  const cfg = { ...RARITY, WEIGHTS: { COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 1 } };
  const r = S.pickRoundDetailed(items, 5, [], mulberry32(3), 2, cfg);
  assert.equal(new Set(r.questions.map((q) => q.id)).size, 5);
  assert.equal(r.questions.filter((q) => q.rarity === "LEGENDARY").length, 1, "единственный легендарный — только один раз");
  assert.equal(r.rolls.filter((x) => x.used === "COMMON").length, 4);
});

test("запасной выбор не повышает шансы редких: нехватка COMMON уходит вверх только когда больше нечего показать", () => {
  const items = makeItems({ COMMON: 2, RARE: 10 });
  const r = S.pickRoundDetailed(items, 5, [], mulberry32(9));
  assert.equal(r.questions.length, 5);
  assert.ok(r.questions.filter((q) => q.rarity === "COMMON").length <= 2);
});

test("мало товаров: раунд не длиннее базы и без повторов", () => {
  const items = makeItems({ COMMON: 2, EPIC: 1 });
  const r = S.pickRoundDetailed(items, 5, [], mulberry32(5));
  assert.equal(r.questions.length, 3);
  assert.equal(new Set(r.questions.map((q) => q.id)).size, 3);
});

test("база: у каждого товара корректная редкость, все уровни представлены", () => {
  const counts = {};
  DATA.QUESTIONS.forEach((q) => {
    assert.ok(RARITY.ORDER.includes(q.rarity), `${q.id}: rarity = ${q.rarity}`);
    counts[q.rarity] = (counts[q.rarity] || 0) + 1;
  });
  RARITY.ORDER.forEach((r) => assert.ok(counts[r] > 0, `нет товаров редкости ${r}`));
});

test("статистика: 60 000 раундов (300 000 вопросов) соответствуют заданным шансам", () => {
  const random = mulberry32(20261016);
  const QS = DATA.QUESTIONS.filter((q) => q.status === "verified"); // как в игре: только объекты с фото
  const rolled = { COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 };
  const used = { COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 };
  let seen = [];
  const ROUNDS = 60000;
  for (let i = 0; i < ROUNDS; i++) {
    const r = S.pickRoundDetailed(QS, 5, seen, random);
    assert.equal(new Set(r.questions.map((q) => q.id)).size, r.questions.length, "повтор внутри раунда");
    r.rolls.forEach((x) => { rolled[x.rolled]++; used[x.used]++; });
    seen = seen.concat(r.questions.map((q) => q.id));
    if (QS.length - new Set(seen).size < 5) seen = [];
  }
  const N = ROUNDS * 5;
  for (const counts of [rolled, used]) {
    let chi2 = 0;
    const report = {};
    for (const r of RARITY.ORDER) {
      const p = RARITY.WEIGHTS[r];
      const exp = N * p;
      const sd = Math.sqrt(N * p * (1 - p));
      chi2 += (counts[r] - exp) ** 2 / exp;
      report[r] = `${((counts[r] / N) * 100).toFixed(3)}% (ожидалось ${(p * 100).toFixed(1)}%)`;
      assert.ok(Math.abs(counts[r] - exp) < 4 * sd, `${r}: ${counts[r]} vs ${exp} (>4σ)`);
    }
    console.log("распределение:", JSON.stringify(report), "χ² =", chi2.toFixed(3));
    assert.ok(chi2 < 16.266, `хи-квадрат ${chi2} выше порога p=0.001`);
  }
  assert.ok(used.LEGENDARY < used.EPIC && used.EPIC < used.RARE && used.RARE < used.COMMON, "легендарные — самые редкие");
});
