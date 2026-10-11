// Автотесты личной статистики и локального движка раунда.
const test = require("node:test");
const assert = require("node:assert/strict");
const STATS = require("../js/stats.js");
const ENGINE = require("../js/engine.js");
const S = require("../js/scoring.js");
const DATA = require("../js/data/questions.js");

function memoryStorage(initial) {
  const m = new Map(Object.entries(initial || {}));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    dump: () => Object.fromEntries(m)
  };
}

test("stats: пустое хранилище → нули", () => {
  const s = STATS.makeStore(memoryStorage()).load();
  assert.deepEqual(s, STATS.emptyStats());
});

test("stats: нет localStorage вообще → работает без ошибок", () => {
  const store = STATS.makeStore(null);
  assert.deepEqual(store.load(), STATS.emptyStats());
  const r = store.addRound([{ points: 500, accuracy: 60 }]);
  assert.equal(r.total, 500);
  assert.deepEqual(store.loadSeen(), []);
});

test("stats: повреждённые данные не ломают игру", () => {
  for (const bad of ["{oops", "null", "[]", '"str"', "42", '{"rounds":"abc","bestRound":-5}', '{"bestRound":999999,"answers":1,"totalPoints":999999}']) {
    const store = STATS.makeStore(memoryStorage({ [STATS.KEY]: bad }));
    const s = store.load();
    assert.ok(s.rounds >= 0 && s.bestRound >= 0 && s.bestRound <= 5000, bad);
    assert.ok(s.totalPoints <= s.answers * 1000, bad);
  }
  const store = STATS.makeStore(memoryStorage({ [STATS.SEEN_KEY]: '{"not":"array"}' }));
  assert.deepEqual(store.loadSeen(), []);
});

test("stats: хранилище, которое бросает исключения", () => {
  const throwing = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("quota"); }, removeItem() { throw new Error("x"); } };
  const store = STATS.makeStore(throwing);
  assert.deepEqual(store.load(), STATS.emptyStats());
  assert.doesNotThrow(() => store.addRound([{ points: 900, accuracy: 90 }]));
  assert.doesNotThrow(() => store.reset());
});

test("stats: подсчёт раундов, рекорда, точности, удачных ответов", () => {
  const store = STATS.makeStore(memoryStorage());
  const r1 = store.addRound([1000, 800, 500, 0, 760].map((p) => ({ points: p, accuracy: p / 10 })));
  assert.equal(r1.total, 3060);
  assert.equal(r1.isRecord, true);
  const r2 = store.addRound([100, 100, 100, 100, 100].map((p) => ({ points: p, accuracy: 10 })));
  assert.equal(r2.isRecord, false);
  const s = store.load();
  assert.equal(s.rounds, 2);
  assert.equal(s.answers, 10);
  assert.equal(s.totalPoints, 3560);
  assert.equal(s.bestRound, 3060);
  assert.equal(s.goodAnswers, 3);    // 1000, 800, 760
  assert.equal(s.perfectAnswers, 1); // 1000
  assert.equal(STATS.averageAccuracy(s), Math.round((100 + 80 + 50 + 0 + 76 + 50) / 10));
});

test("stats: нельзя накрутить очки слишком большими значениями", () => {
  const store = STATS.makeStore(memoryStorage());
  const r = store.addRound([{ points: 99999, accuracy: 999 }, { points: 1e9, accuracy: -5 }]);
  assert.equal(r.total, 2000);
  const s = store.load();
  assert.equal(s.bestRound, 2000);
  assert.ok(s.accuracySum <= s.answers * 100);
});

test("engine: полный локальный раунд", async () => {
  const store = STATS.makeStore(memoryStorage());
  const eng = ENGINE.LocalEngine({ scoring: S, questions: DATA.QUESTIONS, store, roundSize: 5 });
  const { questions } = await eng.start();
  assert.equal(questions.length, 5);
  let total = 0;
  for (let i = 0; i < 5; i++) {
    const res = await eng.answer(i, questions[i].price);
    assert.equal(res.points, 1000);
    total = res.total;
  }
  assert.equal(total, 5000);
  const fin = await eng.finish();
  assert.equal(fin.total, 5000);
  assert.equal(store.loadSeen().length, 5);
});

test("engine: нельзя ответить дважды, пропустить вопрос или завершить раньше", async () => {
  const store = STATS.makeStore(memoryStorage());
  const eng = ENGINE.LocalEngine({ scoring: S, questions: DATA.QUESTIONS, store, roundSize: 5 });
  const { questions } = await eng.start();
  await assert.rejects(eng.answer(1, 100), /номер/);
  await eng.answer(0, questions[0].price);
  await assert.rejects(eng.answer(0, 100), /номер/);
  await assert.rejects(eng.answer(1, 0), /Некорректный/);
  await assert.rejects(eng.answer(1, -10), /Некорректный/);
  await assert.rejects(eng.finish(), /неотвеченные/);
});

test("engine: следующий раунд не повторяет вопросы предыдущего", async () => {
  const store = STATS.makeStore(memoryStorage());
  const play = async () => {
    const eng = ENGINE.LocalEngine({ scoring: S, questions: DATA.QUESTIONS, store, roundSize: 5 });
    const { questions } = await eng.start();
    for (let i = 0; i < 5; i++) await eng.answer(i, 10);
    await eng.finish();
    return questions.map((q) => q.id);
  };
  const a = await play();
  const b = await play();
  assert.equal(a.filter((id) => b.includes(id)).length, 0);
});
