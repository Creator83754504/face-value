// Проверка содержания курса: структура каждого урока, тесты 5–10 вопросов, корректные ответы, ссылки.
const test = require("node:test");
const assert = require("node:assert/strict");
const CA = require("./load.js");
const TASK_TYPES = ["candle-build", "candle-pick", "trend-id", "level-mark", "point-pick", "risk-zone", "plan", "calc", "scenario", "sort", "classify", "chart-read", "journal", "plan-form", "backtest"];
const WIDGETS = ["candle-live", "tf-switch", "orderbook-sim", "calc-position", "calc-liq", "calc-recovery", "expectancy", "indicator-lab", "lab"];
const CALC = ["position", "riskAmount", "rr", "breakeven", "fees", "pnl", "recovery", "liquidation", "marketcap", "spread", "tradeR"];

function blocks(list, where) {
  (list || []).forEach((b) => {
    if (typeof b === "string") return;
    if (b.widget) assert.ok(WIDGETS.includes(b.widget), `${where}: виджет ${b.widget}`);
    if (b.chart && b.chart.scenario) assert.ok(CA.market.scenarioNames.includes(b.chart.scenario), `${where}: сценарий ${b.chart.scenario}`);
    if (b.fig) assert.ok(["candle-anatomy", "candle-patterns", "trend-up", "trend-down", "trend-range", "sr-flip", "false-break", "reversal", "blockchain", "rr", "recovery", "orderbook", "timeframes", "liquidation"].includes(b.fig), `${where}: рисунок ${b.fig}`);
  });
}
function question(q, where) {
  assert.ok(q.q && q.q.length > 10, `${where}: текст вопроса`);
  assert.ok(q.e && q.e.length > 5, `${where}: пояснение`);
  if (q.num) { assert.equal(typeof q.num.answer, "number"); return; }
  assert.ok(Array.isArray(q.a) && q.a.length >= 2, `${where}: варианты`);
  const correct = Array.isArray(q.c) ? q.c : [q.c];
  assert.ok(correct.length >= 1);
  correct.forEach((c) => assert.ok(Number.isInteger(c) && c >= 0 && c < q.a.length, `${where}: индекс ответа`));
  assert.equal(new Set(q.a).size, q.a.length, `${where}: дубли вариантов`);
}

test("8 модулей: 7 модулей уроков + экзамен", () => {
  assert.equal(CA.course.modules.length, 7);
  assert.ok(CA.course.lessons.length >= 30, "уроков: " + CA.course.lessons.length);
  assert.ok(CA.examBank.length >= 30);
});

test("Каждый урок содержит все обязательные части", () => {
  const ids = new Set();
  CA.course.lessons.forEach((L) => {
    const w = L.id + " «" + L.title + "»";
    assert.ok(!ids.has(L.id)); ids.add(L.id);
    assert.ok(L.title && L.goal && L.goal.length > 40, w + ": цель");
    assert.ok(L.minutes > 0, w + ": длительность");
    assert.ok(L.theory.length >= 4, w + ": теория");
    assert.ok(L.analysis && L.analysis.length >= 1, w + ": разбор графиков/примеров");
    assert.ok(L.mistakes.length >= 3, w + ": типичные ошибки");
    assert.ok(L.practice.length >= 1, w + ": практика");
    assert.ok(L.quiz.length >= 5 && L.quiz.length <= 10, w + ": тест 5–10 вопросов, сейчас " + L.quiz.length);
    assert.ok(L.summary.length >= 4, w + ": конспект");
    blocks(L.theory, w); blocks(L.analysis, w);
    L.practice.forEach((t) => {
      assert.ok(TASK_TYPES.includes(t.type), w + ": тип задания " + t.type);
      if (t.type === "calc") (t.gens || [t.gen]).forEach((gname) => assert.ok(CALC.includes(gname), w + ": генератор " + gname));
      if (t.type === "scenario") assert.ok(t.options.some((o) => o.score === 2), w + ": в ситуации есть лучший вариант");
      if (t.type === "classify") t.items.forEach((it) => assert.ok(it[1] < t.categories.length));
      if (t.type === "candle-pick" && t.rounds) t.rounds.forEach((r) => assert.ok(r.correct < r.candles.length));
    });
    L.quiz.forEach((q, i) => question(q, w + " вопрос " + (i + 1)));
  });
});

test("Многовариантные и числовые вопросы есть — не только тесты с одним ответом", () => {
  const all = CA.course.lessons.flatMap((l) => l.quiz);
  assert.ok(all.filter((q) => Array.isArray(q.c)).length >= 10);
  assert.ok(all.filter((q) => q.num).length >= 10);
  const kinds = new Set(CA.course.lessons.flatMap((l) => l.practice.map((t) => t.type)));
  TASK_TYPES.forEach((t) => assert.ok(kinds.has(t), "тип задания используется в курсе: " + t));
});

test("Формулы риска на примерах из уроков", () => {
  assert.equal(Math.round(CA.risk.positionSize({ balance: 4000, riskPct: 1.5, entry: 10, stop: 9 }).riskAmount), 60);
  assert.equal(Math.round(CA.risk.recoveryNeeded(30) * 100) / 100, 42.86);
});

test("Словарь, кейсы, ошибки: ссылки на уроки существуют", () => {
  assert.ok(CA.glossary.length >= 80);
  const terms = new Set();
  CA.glossary.forEach((t) => { assert.ok(!terms.has(t.t), "дубль термина " + t.t); terms.add(t.t); if (t.lesson) assert.ok(CA.course.find(t.lesson), "урок " + t.lesson); });
  CA.typicalMistakes.forEach((m) => assert.ok(CA.course.find(m.lesson)));
  assert.ok(CA.cases.length >= 5);
  CA.cases.forEach((c) => { assert.ok(c.lessons.length >= 3 && c.story.length >= 2); if (c.question) question(c.question, c.id); });
  CA.examBank.forEach((q, i) => { question(q, "экзамен " + i); assert.ok(q.m >= 1 && q.m <= 7); });
});

test("В контенте нет обещаний гарантированной прибыли", () => {
  // Цели и конспекты уроков не должны содержать «гарантий»; во всём курсе — никаких обещаний дохода от первого лица.
  CA.course.lessons.forEach((L) => [L.goal].concat(L.summary).forEach((t) => {
    const m = t.match(/[^.]{0,60}гарантир[^.]{0,60}/i);
    if (m) assert.match(t, /(не |нет |невозможн|ни один|без |обещани|флаг|признак)/i, L.id + ": " + m[0]);
  }));
  const all = JSON.stringify(CA.course.modules) + JSON.stringify(CA.cases) + JSON.stringify(CA.glossary);
  assert.doesNotMatch(all, /(мы гарантируем|гарантируем прибыль|гарантированный доход вам|заработаете гарантированно)/i);
});
