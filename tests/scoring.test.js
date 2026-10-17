// Автотесты подсчёта очков и базы вопросов. Запуск: node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../js/scoring.js");
const DATA = require("../js/data/questions.js");

test("parsePrice: обычные числа и разделители", () => {
  const cases = {
    "1500": 1500, "1 500": 1500, "1,500": 1500, "$1,500": 1500, "1500.50": 1500.5,
    "1500,50": 1500.5, "1,299.99": 1299.99, "1.299,99": 1299.99, "1.500.000": 1500000,
    "1.5k": 1500, "1,5к": 1500, "2 тыс": 2000, "1.2m": 1200000, "1,2 млн": 1200000,
    "  899.99 ": 899.99, "115$": 115, "1 099": 1099, "0.5": 0.5, "usd 40": 40
  };
  for (const [input, expected] of Object.entries(cases)) {
    const r = S.parsePrice(input);
    assert.equal(r.ok, true, `ожидали ok для "${input}"`);
    assert.equal(r.value, expected, `"${input}" → ${expected}`);
  }
});

test("parsePrice: пустой, неправильный, отрицательный, ноль, огромный", () => {
  assert.equal(S.parsePrice("").error, "empty");
  assert.equal(S.parsePrice("   ").error, "empty");
  assert.equal(S.parsePrice(null).error, "empty");
  assert.equal(S.parsePrice(undefined).error, "empty");
  assert.equal(S.parsePrice("$").error, "empty");
  assert.equal(S.parsePrice("abc").error, "invalid");
  assert.equal(S.parsePrice("12abc").error, "invalid");
  assert.equal(S.parsePrice("1e5").error, "invalid");
  assert.equal(S.parsePrice("Infinity").error, "invalid");
  assert.equal(S.parsePrice("NaN").error, "invalid");
  assert.equal(S.parsePrice("1,2,3").error, "invalid");
  assert.equal(S.parsePrice("-100").error, "negative");
  assert.equal(S.parsePrice("−100").error, "negative");
  assert.equal(S.parsePrice("0").error, "zero");
  assert.equal(S.parsePrice("0.00").error, "zero");
  assert.equal(S.parsePrice("0.001").error, "zero"); // округляется до центов → 0
  assert.equal(S.parsePrice("99999999999").error, "too_big");
  for (const code of ["empty", "invalid", "negative", "zero", "too_big"]) {
    const sample = { empty: "", invalid: "x", negative: "-1", zero: "0", too_big: "9999999999" }[code];
    assert.ok(S.parsePrice(sample).message.length > 0, `сообщение для ${code}`);
  }
});

test("scoreGuess: точный ответ и ±2% = 1000", () => {
  assert.equal(S.scoreGuess(1099, 1099).points, 1000);
  assert.equal(S.scoreGuess(1115, 1099).points, 1000);
  assert.equal(S.scoreGuess(1080, 1099).points, 1000);
});

test("scoreGuess: чем дальше, тем меньше очков; 2.5× и больше = 0", () => {
  const a = S.scoreGuess(110, 100).points;
  const b = S.scoreGuess(150, 100).points;
  const c = S.scoreGuess(200, 100).points;
  const d = S.scoreGuess(250, 100).points;
  assert.ok(a > b && b > c && c > d, `${a} > ${b} > ${c} > ${d}`);
  assert.equal(d, 0);
  assert.equal(S.scoreGuess(1, 227800).points, 0);
});

test("scoreGuess: формула не изменилась (контрольные значения)", () => {
  assert.equal(S.scoreGuess(110, 100).points, 896);
  assert.equal(S.scoreGuess(125, 100).points, 756);
  assert.equal(S.scoreGuess(150, 100).points, 557);
  assert.equal(S.scoreGuess(200, 100).points, 244);
});

test("scoreGuess: перелёт и недолёт в одно число раз равны", () => {
  assert.equal(S.scoreGuess(200, 100).points, S.scoreGuess(50, 100).points);
});

test("scoreGuess: детерминированность и границы", () => {
  for (let i = 0; i < 1000; i++) {
    const actual = 1 + Math.random() * 50000;
    const guess = 0.01 + Math.random() * 100000;
    const r1 = S.scoreGuess(guess, actual);
    const r2 = S.scoreGuess(guess, actual);
    assert.deepEqual(r1, r2);
    assert.ok(Number.isInteger(r1.points) && r1.points >= 0 && r1.points <= 1000);
  }
  assert.throws(() => S.scoreGuess(0, 100));
  assert.throws(() => S.scoreGuess(-5, 100));
  assert.throws(() => S.scoreGuess(NaN, 100));
  assert.throws(() => S.scoreGuess(100, 0));
});

test("scoreGuess: разница и процент", () => {
  const r = S.scoreGuess(1200, 1000);
  assert.equal(r.diff, 200);
  assert.equal(r.diffPercent, 20);
  assert.equal(S.scoreGuess(900, 1000).diffPercent, -10);
});

test("roundTotal: сумма не превышает максимум и игнорирует мусор", () => {
  assert.equal(S.roundTotal([1000, 1000, 1000, 1000, 1000], 5), 5000);
  assert.equal(S.roundTotal([5000, 5000, 5000, 5000, 5000], 5), 5000);
  assert.equal(S.roundTotal([1000, 1000, 1000, 1000, 1000, 1000], 5), 5000);
  assert.equal(S.roundTotal([-500, NaN, "abc", 300, Infinity], 5), 300);
  assert.equal(S.roundTotal([], 5), 0);
});

test("isGoodAnswer и accuracyPercent", () => {
  assert.equal(S.isGoodAnswer(750), true);
  assert.equal(S.isGoodAnswer(749), false);
  assert.equal(S.accuracyPercent(100, 100), 100);
  assert.equal(S.accuracyPercent(110, 100), 90);
  assert.equal(S.accuracyPercent(80, 100), 80);
  assert.equal(S.accuracyPercent(500, 100), 0);
  assert.equal(S.accuracyPercent(0, 100), 0);
});

test("pickRound: 5 разных вопросов; ≤2 из категории и ≤2 одного уровня цен — почти всегда", () => {
  // С системой редкости эти правила стали «мягкими»: редкость важнее. Если, например,
  // выпал EPIC, а все эпические товары дорогие, допускается третий дорогой товар.
  const qs = DATA.QUESTIONS.filter((q) => q.status === "verified"); // как в игре: только объекты с фото
  let seed = 12345;
  const random = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  let catViol = 0, tierViol = 0;
  const ROUNDS = 3000;
  for (let i = 0; i < ROUNDS; i++) {
    const round = S.pickRound(qs, 5, [], random);
    assert.equal(round.length, 5);
    assert.equal(new Set(round.map((q) => q.id)).size, 5, "без повторов");
    const perCat = {}, perTier = {};
    round.forEach((q) => {
      perCat[q.category] = (perCat[q.category] || 0) + 1;
      const t = S.priceTier(q.price);
      perTier[t] = (perTier[t] || 0) + 1;
    });
    if (Object.values(perCat).some((n) => n > 2)) catViol++;
    if (Object.values(perTier).some((n) => n > 2)) tierViol++;
  }
  assert.ok(catViol / ROUNDS < 0.01, `категорий нарушено в ${catViol} раундах`);
  assert.ok(tierViol / ROUNDS < 0.05, `уровней цен нарушено в ${tierViol} раундах`);
});

test("pickRound: соседние раунды не повторяются", () => {
  const qs = DATA.QUESTIONS;
  let seen = [];
  for (let r = 0; r < 10; r++) {
    const round = S.pickRound(qs, 5, seen);
    round.forEach((q) => assert.ok(!seen.includes(q.id), `повтор ${q.id} в раунде ${r + 1}`));
    seen = seen.concat(round.map((q) => q.id));
  }
});

test("formatMoney", () => {
  assert.equal(S.formatMoney(1099, "USD"), "$1,099");
  assert.equal(S.formatMoney(899.99, "USD"), "$899.99");
  assert.equal(S.formatMoney(227800, "USD"), "$227,800");
});

test("база: ≥100 вопросов, у каждого бренд, модель, цена, валюта, регион, источник, дата; фото — у всех, кто участвует в игре", () => {
  const qs = DATA.QUESTIONS;
  assert.ok(qs.length >= 100, `вопросов: ${qs.length}`);
  const ids = new Set();
  const titles = new Set();
  for (const q of qs) {
    assert.ok(!ids.has(q.id), `повтор id ${q.id}`);
    ids.add(q.id);
    const key = (q.title + "|" + q.subtitle).toLowerCase();
    assert.ok(!titles.has(key), `повтор товара ${q.title}`);
    titles.add(key);
    assert.ok(DATA.CATEGORIES[q.category], `${q.id}: неизвестная категория`);
    assert.ok(q.brand && q.model && q.title && q.subtitle, `${q.id}: название/бренд/модель`);
    // Верхняя граница — лимит ввода игрока (MAX_INPUT) и сервера (MAX_GUESS): 1 млрд
    assert.ok(typeof q.price === "number" && q.price > 0 && q.price <= 1e9 && S.parsePrice(String(q.price)).ok, `${q.id}: цена`);
    assert.equal(q.currency, "USD", `${q.id}: валюта`);
    assert.ok(DATA.REGIONS[q.region], `${q.id}: регион`);
    // "needs-image" — цена проверена, но точного фото пока нет: в игре не участвует (ни в клиенте, ни на сервере)
    assert.ok(q.status === "verified" || q.status === "needs-image", `${q.id}: статус ${q.status}`);
    assert.match(q.source.url, /^https:\/\//, `${q.id}: ссылка на источник`);
    assert.match(q.checkedAt, /^\d{4}-\d{2}-\d{2}$/, `${q.id}: дата`);
    if (q.status === "verified") assert.match(q.image.remote, /^https:\/\//, `${q.id}: фото`);
    else assert.equal(q.image, null, `${q.id}: у объекта без фото не должно быть случайной картинки`);
  }
});

test("база: все категории представлены, есть дешёвые, средние и дорогие товары", () => {
  const cats = new Set(DATA.QUESTIONS.map((q) => q.category));
  assert.equal(cats.size, Object.keys(DATA.CATEGORIES).length);
  Object.keys(DATA.CATEGORIES).forEach((c) => assert.ok(cats.has(c), c));
  const tiers = { low: 0, mid: 0, high: 0 };
  DATA.QUESTIONS.forEach((q) => tiers[S.priceTier(q.price)]++);
  assert.ok(tiers.low >= 10 && tiers.mid >= 10 && tiers.high >= 10, JSON.stringify(tiers));
});

test("база: пояснения не раскрывают цены других вопросов", () => {
  const prices = new Map(DATA.QUESTIONS.map((q) => [q.id, S.formatMoney(q.price, "USD")]));
  for (const q of DATA.QUESTIONS) {
    if (!q.note) continue;
    for (const other of DATA.QUESTIONS) {
      if (other.id === q.id) continue;
      const p = prices.get(other.id);
      const plain = p.replace(/,/g, "");
      // "$400 млн" — это не цена товара за $400: сумма с «млн/млрд/тыс/k/m» после неё не считается совпадением
      const re = new RegExp("(" + [p, plain].map((x) => x.replace(/[$.]/g, "\\$&")).join("|") + ")(?!\\d|[.,]\\d|\\s?(млн|млрд|тыс)|\\s?[km]\\b)");
      assert.ok(!re.test(q.note), `${q.id}: в пояснении цена ${other.id} (${p})`);
    }
  }
});

test("база: товары без фото вынесены в PENDING и не участвуют в игре", () => {
  const ids = new Set(DATA.QUESTIONS.map((q) => q.id));
  for (const p of DATA.PENDING) {
    assert.ok(p.id && p.reason, "у отложенного товара есть причина");
    assert.ok(!ids.has(p.id), `${p.id} не должен быть в игре`);
  }
});
