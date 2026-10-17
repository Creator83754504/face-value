// Тесты сервера рейтинга: проверка подписи Telegram, раунды, защита от подделки, HTTP-уровень.
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { verifyInitData, signInitData } from "../src/telegram-auth.js";
import { createGame, ROUND_TTL_MS, MAX_ROUNDS_PER_HOUR } from "../src/game.js";
import { handle } from "../src/index.js";
import { createMemoryStore } from "./memory-store.js";

const require = createRequire(import.meta.url);
const scoring = require("../../js/scoring.js");
const { QUESTIONS } = require("../../js/data/questions.js");

const TOKEN = "123456:TEST-TOKEN";
const nowSec = () => Math.floor(Date.now() / 1000);
const userJson = (id, name = "Анна") => JSON.stringify({ id, first_name: name, last_name: "Иванова", username: "anna" });

async function initDataFor(id, opts = {}) {
  return signInitData({ query_id: "AAE", user: userJson(id, opts.name), auth_date: String(opts.authDate ?? nowSec()) }, opts.token || TOKEN);
}

// ───── Подпись Telegram ─────
test("initData: корректная подпись принимается", async () => {
  const data = await initDataFor(42);
  const user = await verifyInitData(data, TOKEN);
  assert.equal(user.id, 42);
  assert.equal(user.firstName, "Анна");
});

test("initData: подделка user_id, чужой токен, без hash — отклоняются", async () => {
  const data = await initDataFor(42);
  const tampered = data.replace(encodeURIComponent('"id":42'), encodeURIComponent('"id":1'));
  assert.notEqual(tampered, data);
  await assert.rejects(verifyInitData(tampered, TOKEN), { code: "bad_hash" });
  await assert.rejects(verifyInitData(await initDataFor(42, { token: "999:OTHER" }), TOKEN), { code: "bad_hash" });
  await assert.rejects(verifyInitData(data.replace(/&?hash=[0-9a-f]+/, ""), TOKEN), { code: "bad_hash" });
  await assert.rejects(verifyInitData("", TOKEN), { code: "no_init_data" });
  await assert.rejects(verifyInitData(data, ""), { code: "server_misconfigured" });
});

test("initData: устаревшая сессия отклоняется", async () => {
  const old = await initDataFor(42, { authDate: nowSec() - 2 * 86400 });
  await assert.rejects(verifyInitData(old, TOKEN, { maxAgeSec: 86400 }), { code: "expired" });
});

// ───── Логика раунда ─────
function makeGame(extra = {}) {
  const store = createMemoryStore();
  let t = 1_700_000_000_000;
  const clock = { now: () => t, advance: (ms) => { t += ms; } };
  const game = createGame({ store, scoring, questions: QUESTIONS, now: clock.now, ...extra });
  return { store, game, clock };
}
const U1 = { id: 1, firstName: "Анна", lastName: "Иванова" };
const U2 = { id: 2, firstName: "Борис", lastName: "" };
const priceOf = (id) => QUESTIONS.find((q) => q.id === id).price;

test("раунд: сервер выбирает 5 вопросов и считает очки сам", async () => {
  const { game } = makeGame();
  const r = await game.startRound(U1);
  assert.equal(r.questionIds.length, 5);
  let total = 0;
  for (let i = 0; i < 5; i++) {
    const a = await game.answer(U1, { roundId: r.roundId, index: i, guess: priceOf(r.questionIds[i]) });
    assert.equal(a.points, 1000);
    assert.equal(a.price, priceOf(r.questionIds[i]));
    total = a.total;
  }
  assert.equal(total, 5000);
  const fin = await game.finishRound(U1, { roundId: r.roundId });
  // Если в раунд попал вопрос с наградой, сервер добавит rewards — это отдельная проверка (rewards.test.js)
  const { rewards: r1, ...fin1 } = fin;
  assert.deepEqual(fin1, { total: 5000, best: 5000, newBest: true });
  assert.ok(r1 === undefined || (Array.isArray(r1) && r1.length > 0), "rewards есть только если выданы награды");
});

test("раунд: нельзя ответить дважды, пропустить вопрос или прислать мусор", async () => {
  const { game } = makeGame();
  const r = await game.startRound(U1);
  await assert.rejects(game.answer(U1, { roundId: r.roundId, index: 1, guess: 100 }), { code: "bad_index" });
  await game.answer(U1, { roundId: r.roundId, index: 0, guess: 100 });
  await assert.rejects(game.answer(U1, { roundId: r.roundId, index: 0, guess: 100 }), { code: "bad_index" });
  for (const guess of [0, -5, NaN, Infinity, "500", null, 2e9]) {
    await assert.rejects(game.answer(U1, { roundId: r.roundId, index: 1, guess }), { code: "bad_guess" }, String(guess));
  }
  await assert.rejects(game.finishRound(U1, { roundId: r.roundId }), { code: "not_complete" });
});

test("раунд: параллельная двойная отправка засчитывается один раз", async () => {
  const { game, store } = makeGame();
  const r = await game.startRound(U1);
  const results = await Promise.allSettled([
    game.answer(U1, { roundId: r.roundId, index: 0, guess: 10 }),
    game.answer(U1, { roundId: r.roundId, index: 0, guess: 10 })
  ]);
  assert.equal(results.filter((x) => x.status === "fulfilled").length, 1);
  assert.equal(store.rounds.get(r.roundId).answersCount, 1);
});

test("раунд: чужой раунд недоступен, засчитать можно один раз (повтор возвращает сохранённый итог)", async () => {
  const { game, store } = makeGame();
  const r = await game.startRound(U1);
  await assert.rejects(game.answer(U2, { roundId: r.roundId, index: 0, guess: 100 }), { code: "round_not_found" });
  for (let i = 0; i < 5; i++) await game.answer(U1, { roundId: r.roundId, index: i, guess: 50 });
  await assert.rejects(game.finishRound(U2, { roundId: r.roundId }), { code: "round_not_found" });
  const fin = await game.finishRound(U1, { roundId: r.roundId });
  assert.deepEqual(await game.finishRound(U1, { roundId: r.roundId }), { ...fin, repeated: true });
  assert.equal(store.players.get(U1.id).rounds, 1, "раунд засчитан один раз");
  await assert.rejects(game.answer(U1, { roundId: r.roundId, index: 5, guess: 50 }), { code: "round_finished" });
  await assert.rejects(game.answer(U1, { roundId: "not-a-uuid", index: 0, guess: 50 }), { code: "bad_round" });
});

test("раунд: просроченный раунд не принимает ответы", async () => {
  const { game, clock } = makeGame();
  const r = await game.startRound(U1);
  clock.advance(ROUND_TTL_MS + 1);
  await assert.rejects(game.answer(U1, { roundId: r.roundId, index: 0, guess: 100 }), { code: "round_expired" });
});

test("раунд: ограничение числа раундов в час", async () => {
  const { game } = makeGame();
  for (let i = 0; i < MAX_ROUNDS_PER_HOUR; i++) await game.startRound(U1);
  await assert.rejects(game.startRound(U1), { code: "rate_limited" });
});

test("рейтинг: хранится лучший результат, порядок и позиция игрока", async () => {
  const { game } = makeGame();
  async function play(user, factor) {
    const r = await game.startRound(user);
    for (let i = 0; i < 5; i++) await game.answer(user, { roundId: r.roundId, index: i, guess: priceOf(r.questionIds[i]) * factor });
    return game.finishRound(user, { roundId: r.roundId });
  }
  const a1 = await play(U1, 1.1);
  const a2 = await play(U1, 2);       // хуже — лучший результат не меняется
  assert.equal(a2.newBest, false);
  assert.equal(a2.best, a1.total);
  await play(U2, 1);                  // 5000
  const lb = await game.leaderboard(U1);
  assert.deepEqual(lb.top.map((p) => p.name), ["Борис", "Анна И."]);
  assert.equal(lb.top[1].isMe, true);
  assert.deepEqual(lb.me, { best: a1.total, position: 2 });
});

// ───── HTTP ─────
async function call(method, path, { body, auth, store, env } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) headers.Authorization = "tma " + auth;
  const req = new Request("https://api.example.com" + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const res = await handle(req, { BOT_TOKEN: TOKEN, ALLOWED_ORIGIN: "*", ...env }, { store });
  return { status: res.status, data: res.status === 204 ? null : await res.json(), headers: res.headers };
}

test("HTTP: без авторизации — 401, с подделанной подписью — 401", async () => {
  const store = createMemoryStore();
  assert.equal((await call("POST", "/api/round/start", { store })).status, 401);
  const forged = (await initDataFor(7)).replace(/hash=[0-9a-f]+/, "hash=" + "0".repeat(64));
  const r = await call("POST", "/api/round/start", { store, auth: forged });
  assert.equal(r.status, 401);
  assert.equal(r.data.code, "bad_hash");
});

test("HTTP: полный рейтинговый раунд и таблица", async () => {
  const store = createMemoryStore();
  const auth = await initDataFor(77, { name: "Вика" });
  const start = await call("POST", "/api/round/start", { store, auth });
  assert.equal(start.status, 200);
  assert.ok(!("price" in start.data), "цены не отдаются до ответа");
  for (let i = 0; i < 5; i++) {
    const a = await call("POST", "/api/round/answer", { store, auth, body: { roundId: start.data.roundId, index: i, guess: priceOf(start.data.questionIds[i]) } });
    assert.equal(a.status, 200);
    assert.equal(a.data.points, 1000);
  }
  const fin = await call("POST", "/api/round/finish", { store, auth, body: { roundId: start.data.roundId } });
  const { rewards: r2, ...fin2 } = fin.data;
  assert.deepEqual(fin2, { total: 5000, best: 5000, newBest: true });
  const again = await call("POST", "/api/round/finish", { store, auth, body: { roundId: start.data.roundId } });
  assert.equal(again.status, 200);
  assert.deepEqual(again.data, { ...fin.data, repeated: true }, "повтор — тот же итог (и те же награды этого раунда), без новой записи");
  const lb = await call("GET", "/api/leaderboard", { store, auth });
  assert.equal(lb.data.top[0].name, "Вика И.");
  assert.equal(lb.data.top[0].best, 5000);
});

test("HTTP: клиент не может прислать свой счёт", async () => {
  const store = createMemoryStore();
  const auth = await initDataFor(5);
  const start = await call("POST", "/api/round/start", { store, auth });
  for (let i = 0; i < 5; i++) {
    await call("POST", "/api/round/answer", { store, auth, body: { roundId: start.data.roundId, index: i, guess: 1, points: 1000, total: 5000 } });
  }
  const fin = await call("POST", "/api/round/finish", { store, auth, body: { roundId: start.data.roundId, total: 5000 } });
  assert.ok(fin.data.total < 5000, "сервер игнорирует присланные клиентом очки");
});

test("HTTP: CORS и неизвестные пути", async () => {
  const pre = await call("OPTIONS", "/api/round/start");
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get("Access-Control-Allow-Origin"), "*");
  const nf = await call("GET", "/api/nope", { store: createMemoryStore(), auth: await initDataFor(1) });
  assert.equal(nf.status, 404);
  const health = await call("GET", "/api/health");
  assert.equal(health.data.ok, true);
});
