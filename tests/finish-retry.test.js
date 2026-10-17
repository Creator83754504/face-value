// Завершение рейтингового раунда в игре: ограниченный повтор при неизвестном результате.
const test = require("node:test");
const assert = require("node:assert/strict");
const ENGINE = require("../js/engine.js");
const S = require("../js/scoring.js");
const DATA = require("../js/data/questions.js");

const QS = DATA.QUESTIONS.filter((q) => q.status === "verified").slice(0, 5);
const netErr = () => Object.assign(new Error("Нет соединения с сервером"), { status: 0, code: "network" });
const httpErr = (status, code) => Object.assign(new Error("HTTP " + status), { status, code });

/** Поддельный API: finishRound отвечает по сценарию — по одному элементу на попытку. */
function fakeApi(finishScript) {
  const calls = { finish: 0 };
  return {
    calls,
    startRound: async () => ({ roundId: "11111111-1111-1111-1111-111111111111", questionIds: QS.map((q) => q.id) }),
    answer: async (id, index, guess) => ({ price: QS[index].price, points: 1000, total: 1000 * (index + 1), note: "" }),
    finishRound: async () => {
      const step = finishScript[Math.min(calls.finish, finishScript.length - 1)];
      calls.finish++;
      if (step instanceof Error) throw step;
      return step;
    }
  };
}
async function playRound(api, sleeps) {
  const eng = ENGINE.RemoteEngine({ scoring: S, api, questions: QS, sleep: async (ms) => { sleeps.push(ms); } });
  await eng.start();
  for (let i = 0; i < 5; i++) await eng.answer(i, QS[i].price);
  return eng.finish();
}
const SAVED = { total: 5000, best: 5000, newBest: true };

test("ответ сразу — одна попытка, без пауз", async () => {
  const api = fakeApi([SAVED]); const sleeps = [];
  const fin = await playRound(api, sleeps);
  assert.equal(api.calls.finish, 1);
  assert.deepEqual(sleeps, []);
  assert.deepEqual(fin.server, SAVED);
  assert.equal(fin.ranked, true);
});

test("запись прошла, ответ потерян (сеть) → повтор получает сохранённый итог; игра показывает успех", async () => {
  const api = fakeApi([netErr(), { ...SAVED, repeated: true, rewards: ["cosmograph"] }]); const sleeps = [];
  const fin = await playRound(api, sleeps);
  assert.equal(api.calls.finish, 2);
  assert.deepEqual(sleeps, [800]);
  assert.equal(fin.attempts, 2);
  assert.equal(fin.server.repeated, true);
  assert.equal(fin.total, 5000);
  assert.equal(fin.error, undefined, "ошибки нет — значит, игра не скажет «результат не сохранён»");
});

test("ошибка сервера 500 (например, потерян ответ базы) → повтор", async () => {
  const api = fakeApi([httpErr(500, "internal"), { ...SAVED, repeated: true }]); const sleeps = [];
  const fin = await playRound(api, sleeps);
  assert.equal(api.calls.finish, 2);
  assert.equal(fin.server.repeated, true);
});

test("сервер недоступен всё время → 3 попытки, затем ошибка с пометкой «результат неизвестен»", async () => {
  const api = fakeApi([netErr()]); const sleeps = [];
  await assert.rejects(playRound(api, sleeps), (err) => err.uncertain === true && err.attempts === 3);
  assert.equal(api.calls.finish, 3, "повтор ограничен");
  assert.deepEqual(sleeps, [800, 2000]);
});

test("сервер точно отказал (4xx) → без повторов, пометки «неизвестно» нет", async () => {
  for (const [status, code] of [[409, "not_complete"], [401, "bad_hash"], [404, "round_not_found"]]) {
    const api = fakeApi([httpErr(status, code), SAVED]); const sleeps = [];
    await assert.rejects(playRound(api, sleeps), (err) => err.uncertain === false && err.attempts === 1);
    assert.equal(api.calls.finish, 1, code);
    assert.deepEqual(sleeps, [], code);
  }
});

test("isUncertain: какие ошибки считаются «результат неизвестен»", () => {
  assert.equal(ENGINE.isUncertain(netErr()), true);
  assert.equal(ENGINE.isUncertain(httpErr(500, "internal")), true);
  assert.equal(ENGINE.isUncertain(httpErr(503, "no_database")), true);
  assert.equal(ENGINE.isUncertain(httpErr(409, "round_finished")), false);
  assert.equal(ENGINE.isUncertain(httpErr(401, "bad_hash")), false);
});
