// Настройки наград: привязка к реальным вопросам, пороги, правило «заслужено или нет».
const test = require("node:test");
const assert = require("node:assert/strict");
const RW = require("../js/rewards-config.js");
const DATA = require("../js/data/questions.js");
const S = require("../js/scoring.js");
const fs = require("node:fs");
const path = require("node:path");

test("каждая награда привязана к активному вопросу нужной редкости", () => {
  const kinds = { EPIC: "prefix", LEGENDARY: "banner" };
  for (const [id, r] of Object.entries(RW.REWARDS)) {
    const q = DATA.QUESTIONS.find((x) => x.id === r.questionId);
    assert.ok(q, `${id}: вопрос ${r.questionId} не найден`);
    assert.equal(q.status, "verified", `${id}: вопрос не участвует в игре`);
    assert.equal(q.rarity, r.tier, `${id}: редкость вопроса`);
    assert.equal(r.kind, kinds[r.tier], `${id}: вид награды`);
    assert.ok(Number.isInteger(r.minPoints) && r.minPoints > 0 && r.minPoints <= S.MAX_POINTS, `${id}: порог`);
    assert.ok(r.label && r.title, `${id}: подписи`);
  }
});

// Согласованный список: 14 EPIC-префиксов и 6 LEGENDARY-баннеров — награда → вопрос → подпись
const AGREED = {
  "cosmograph": ["rolex-daytona-steel", "Космограф", "◔"],
  "perpetual-calendar": ["jw-patek-1518-steel", "Вечный календарь", "✠"],
  "golden-adele": ["art-klimt-adele-bloch-bauer-i", "Золотая Адель", "◎"],
  "montparnasse": ["art-modigliani-nu-couche-2018", "Монпарнас", "◐"],
  "auvers-1890": ["art-van-gogh-dr-gachet", "Овер, 1890", "❦"],
  "berlinetta-lm": ["car-ferrari-250-lm-5893", "Berlinetta LM", "▸"],
  "nart-spider": ["car-ferrari-275-gtb4-nart-spider", "Спайдер NART", "▸"],
  "british-green": ["car-aston-martin-dbr1-1", "Британский зелёный", "▸"],
  "sixth-title": ["tr-ferrari-f2003-ga-schumacher", "Шестой титул", "❧"],
  "monaco-2001": ["tr-ferrari-f2001-schumacher-monaco", "Монако 2001", "◇"],
  "king-of-monaco": ["tr-mclaren-mp4-8a-senna", "Король Монако", "◇"],
  "easy-rider": ["tr-easy-rider-captain-america", "Беспечный ездок", "★"],
  "flying-wing": ["tr-b-2-spirit", "Летающее крыло", "▲"],
  "submarine-esprit": ["tr-lotus-esprit-wet-nellie", "Подводный Esprit", "≈"],
  "uhlenhaut-night": ["car-mercedes-300-slr-uhlenhaut", "Ночной тест в Штутгарте"],
  "w196-wind-tunnel": ["car-mercedes-w196r-stromlinienwagen", "Аэродинамическая труба"],
  "gto-tuscan-sunset": ["car-ferrari-250-gto-3413gt", "Тосканский закат"],
  "vincent-dawn-record": ["tr-vincent-black-lightning-1951", "Рекорд на рассвете"],
  "w04-racing-line": ["tr-mercedes-w04-hamilton", "Гоночная траектория"],
  "salvator-sfumato": ["art-salvator-mundi", "Сфумато"]
};

test("полный набор: 14 EPIC-префиксов и 6 LEGENDARY-баннеров, каждый на своём вопросе", () => {
  assert.deepEqual(Object.keys(RW.REWARDS).sort(), Object.keys(AGREED).sort());
  const list = Object.entries(RW.REWARDS);
  assert.equal(list.filter(([, r]) => r.tier === "EPIC" && r.kind === "prefix" && r.minPoints === 900).length, 14);
  assert.equal(list.filter(([, r]) => r.tier === "LEGENDARY" && r.kind === "banner" && r.minPoints === 950).length, 6);
  for (const [id, [qid, label, glyph]] of Object.entries(AGREED)) {
    assert.equal(RW.REWARDS[id].questionId, qid, id);
    assert.equal(RW.REWARDS[id].label, label, id);
    if (glyph) assert.equal(RW.REWARDS[id].glyph, glyph, id);
  }
  assert.equal(new Set(list.map(([, r]) => r.questionId)).size, 20, "у каждого вопроса — одна награда");
});

test("у каждой награды есть оформление: SVG-символ префикса, сцена баннера и стили", () => {
  global.window = { FV_REWARDS_CONFIG: RW };
  delete require.cache[require.resolve("../js/rewards.js")];
  require("../js/rewards.js");
  const UI = global.window.FV_REWARDS;
  const css = fs.readFileSync(path.join(__dirname, "../css/rewards.css"), "utf8");
  for (const [id, r] of Object.entries(RW.REWARDS)) {
    assert.ok(css.includes(`[data-reward="${id}"]`), `${id}: нет стилей в css/rewards.css`);
    if (r.kind === "prefix") {
      assert.ok(UI.GLYPHS[r.glyph], `${id}: нет SVG для символа ${r.glyph}`);
    } else {
      assert.equal(typeof UI.SCENES[id], "function", `${id}: нет сцены`);
      const svg = UI.SCENES[id](1);
      assert.match(svg, /^<svg[^>]+viewBox="0 0 600 56"/, `${id}: размер сцены`);
      assert.ok(!/https?:\/\/(?!www\.w3\.org)/.test(svg), `${id}: внешние ссылки в сцене`);
      assert.ok(!/<image|<text/.test(svg), `${id}: картинки или текст поверх сцены`);
      const ms = [...css.matchAll(new RegExp(`\\[data-reward="${id}"\\][^{]*\\{[^}]*animation:\\s*[\\w-]+\\s+([\\d.]+)s`, "g"))].map((m) => Number(m[1]));
      assert.ok(ms.length > 0, `${id}: нет анимации`);
      assert.ok(Math.max(...ms) >= 7 && Math.max(...ms) <= 9, `${id}: петля ${Math.max(...ms)} с (нужно 7–9)`);
    }
  }
  delete global.window;
});

test("earnedFor: награда только за свой вопрос и только от порога", () => {
  const ids = ["airtag", "rolex-daytona-steel", "car-mercedes-300-slr-uhlenhaut"];
  const pts = (a, b, c) => [{ points: a }, { points: b }, { points: c }];
  assert.deepEqual(RW.earnedFor(ids, pts(1000, 900, 950)).map((x) => x.rewardId).sort(), ["cosmograph", "uhlenhaut-night"]);
  assert.deepEqual(RW.earnedFor(ids, pts(1000, 899, 949)), []);
  assert.deepEqual(RW.earnedFor(ids, pts(1000, 1000, 949)).map((x) => x.rewardId), ["cosmograph"]);
  assert.deepEqual(RW.earnedFor(["airtag"], [{ points: 1000 }]), [], "точный ответ на другой вопрос наград не даёт");
  assert.deepEqual(RW.earnedFor(ids, [{ points: 1000 }]), [], "нет ответа — нет награды");
  assert.deepEqual(RW.earnedFor(ids, [{}, { points: "1000" }, { points: null }]), [], "мусор вместо очков игнорируется");
});

test("формула очков не менялась: контрольные значения вокруг порогов", () => {
  const p = (pct) => S.scoreGuess(1000 * (1 + pct / 100), 1000).points;
  assert.equal(p(0), 1000);
  assert.equal(p(2), 1000);
  assert.equal(p(4.5), 952);
  assert.equal(p(5), 947);
  assert.equal(p(9), 906);
  assert.equal(p(10), 896);
  assert.equal(p(-5), 944);
  assert.equal(p(-10), 885);
});

test("каждый активный LEGENDARY-вопрос привязан к своему баннеру, и у него есть тема оформления вопроса", () => {
  global.window = { FV_REWARDS_CONFIG: RW };
  delete require.cache[require.resolve("../js/rewards.js")];
  require("../js/rewards.js");
  const UI = global.window.FV_REWARDS;
  const css = fs.readFileSync(path.join(__dirname, "../css/rewards.css"), "utf8");
  const active = DATA.QUESTIONS.filter((q) => q.status === "verified" && q.rarity === "LEGENDARY");
  const missing = active.filter((q) => !UI.bannerForQuestion(q.id)).map((q) => q.id);
  assert.deepEqual(missing, [], "активные LEGENDARY-вопросы без баннера");
  for (const q of active) {
    const b = UI.bannerForQuestion(q.id);
    assert.equal(RW.REWARDS[b].questionId, q.id);
    assert.ok(css.includes(`.question-body[data-legend="${b}"]`), `${b}: нет темы для вопроса`);
  }
  assert.equal(UI.bannerForQuestion("rolex-daytona-steel"), null, "у EPIC-вопроса нет баннера");
  assert.equal(UI.bannerForQuestion("iphone-18-pro"), null);
  // Неактивные (без фото) LEGENDARY-вопросы наград не имеют — в игру они не попадают
  const inactive = DATA.QUESTIONS.filter((q) => q.status !== "verified" && q.rarity === "LEGENDARY");
  assert.ok(inactive.every((q) => !UI.bannerForQuestion(q.id)));
  delete global.window;
});
