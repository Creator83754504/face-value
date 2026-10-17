// Награды за точные ответы: выдача только сервером, пороги, без повторов, хранение, вывод в рейтинг.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { createGame, cosmeticsByUser } from "../src/game.js";
import { createD1Store } from "../src/d1-store.js";
import { createMemoryStore } from "./memory-store.js";
import { d1 } from "./sqlite-d1.js";
import { handle } from "../src/index.js";
import { signInitData } from "../src/telegram-auth.js";

const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite");
const scoring = require("../../js/scoring.js");
const { QUESTIONS } = require("../../js/data/questions.js");
const RW = require("../../js/rewards-config.js");

const EPIC_Q = "rolex-daytona-steel";
const LEG_Q = "car-mercedes-300-slr-uhlenhaut";
const SCHEMA = readFileSync(new URL("../schema.sql", import.meta.url), "utf8");
const MIGRATION = readFileSync(new URL("../migrations/0001_player_rewards.sql", import.meta.url), "utf8");

// В тестовом каталоге ровно 5 вопросов, значит оба «наградных» вопроса точно попадут в раунд
const q = (id) => QUESTIONS.find((x) => x.id === id);
const POOL = [EPIC_Q, LEG_Q, "iphone-18-pro", "airtag", "ps5-pro"].map(q);
const price = (id) => q(id).price;

/** Цена-догадка, за которую сервер начислит ровно `target` очков (после округления до центов, как на сервере). */
function guessFor(id, target) {
  const p = price(id);
  for (let r = 1.0; r < 2.6; r *= 1.00001) {
    const g = Math.round(p * r * 100) / 100;
    if (scoring.scoreGuess(g, p).points === target) return g;
  }
  throw new Error(`нет догадки на ${target} очков для ${id}`);
}

function sqliteGame(file = ":memory:") {
  const db = new DatabaseSync(file);
  db.exec(SCHEMA);
  let t = 1_700_000_000_000;
  const fault = { on: null }; // (sql, index) => true — «уронить» базу на этой команде транзакции
  const store = createD1Store(d1(db, { failOn: (sql, i) => !!(fault.on && fault.on(sql, i)) }));
  return { db, fault, store, game: createGame({ store, scoring, questions: POOL, now: () => (t += 1000) }) };
}

const A = { id: 101, firstName: "Анна", lastName: "" };
const B = { id: 202, firstName: "Борис", lastName: "" };

/** Играет раунд: points — сколько очков нужно за каждый вопрос (по id), остальные — точно. */
async function play(game, user, points = {}, { finish = true } = {}) {
  const r = await game.startRound(user);
  const got = [];
  for (let i = 0; i < r.questionIds.length; i++) {
    const id = r.questionIds[i];
    const g = points[id] !== undefined ? guessFor(id, points[id]) : price(id);
    got.push((await game.answer(user, { roundId: r.roundId, index: i, guess: g })).points);
  }
  const fin = finish ? await game.finishRound(user, { roundId: r.roundId }) : null;
  return { r, got, fin };
}

test("пороги: 900 и 950 очков соответствуют точности ответа (формула очков не менялась)", () => {
  const pts = (pct) => scoring.scoreGuess(1000 * (1 + pct / 100), 1000).points;
  assert.equal(RW.REWARDS.cosmograph.minPoints, 900);
  assert.equal(RW.REWARDS["uhlenhaut-night"].minPoints, 950);
  assert.ok(pts(9.6) >= 900 && pts(9.7) < 900, "EPIC: перелёт до ≈ +9,65 %");
  assert.ok(pts(-8.7) >= 900 && pts(-8.9) < 900, "EPIC: недолёт до ≈ −8,8 %");
  assert.ok(pts(4.7) >= 950 && pts(4.8) < 950, "LEGENDARY: перелёт до ≈ +4,73 %");
  assert.ok(pts(-4.5) >= 950 && pts(-4.6) < 950, "LEGENDARY: недолёт до ≈ −4,52 %");
  assert.equal(RW.REWARDS.cosmograph.questionId, EPIC_Q);
  assert.equal(RW.REWARDS["uhlenhaut-night"].questionId, LEG_Q);
  assert.equal(q(EPIC_Q).rarity, "EPIC");
  assert.equal(q(LEG_Q).rarity, "LEGENDARY");
});

test("EPIC и LEGENDARY выдаются при нужной точности (ровно на пороге тоже)", async () => {
  const { game, db } = sqliteGame();
  const { got, fin } = await play(game, A, { [EPIC_Q]: 900, [LEG_Q]: 950 });
  assert.ok(got.includes(900) && got.includes(950));
  assert.deepEqual(fin.rewards.sort(), ["cosmograph", "uhlenhaut-night"]);
  const rows = db.prepare("SELECT reward_id, question_id, points FROM player_rewards WHERE user_id = ? ORDER BY reward_id").all(A.id);
  assert.deepEqual(rows.map((x) => ({ ...x })), [
    { reward_id: "cosmograph", question_id: EPIC_Q, points: 900 },
    { reward_id: "uhlenhaut-night", question_id: LEG_Q, points: 950 }
  ]);
});

test("ниже порога наград нет: 899 за EPIC, 949 за LEGENDARY", async () => {
  const { game, db } = sqliteGame();
  const { fin } = await play(game, A, { [EPIC_Q]: 899, [LEG_Q]: 949 });
  assert.equal(fin.rewards, undefined, "в ответе нет поля rewards — формат как раньше");
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM player_rewards").get().n, 0);
  const lb = await game.leaderboard(A);
  assert.equal(lb.top[0].cosmetics, undefined, "игрок без наград выглядит как раньше");
});

test("незавершённый раунд наград не даёт, даже при точных ответах", async () => {
  const { game, db } = sqliteGame();
  await play(game, A, {}, { finish: false });
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM player_rewards").get().n, 0);
});

test("повторное завершение раунда и повторный успех не дублируют награду", async () => {
  const { game, db } = sqliteGame();
  const first = await play(game, A);
  assert.deepEqual(first.fin.rewards.sort(), ["cosmograph", "uhlenhaut-night"]);
  const repeat = await game.finishRound(A, { roundId: first.r.roundId });
  assert.deepEqual(repeat, { ...first.fin, repeated: true }, "повтор возвращает те же награды этого раунда, не выдавая их заново");
  const again = await play(game, A);
  assert.equal(again.fin.rewards, undefined, "уже полученные награды повторно не выдаются");
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM player_rewards WHERE user_id = ?").get(A.id).n, 2);
  const row = db.prepare("SELECT round_id FROM player_rewards WHERE reward_id = 'cosmograph'").get();
  assert.equal(row.round_id, first.r.roundId, "запись не перезаписана вторым раундом");
});

test("параллельное двойное завершение одного раунда — одна выдача, оба ответа с одним итогом", async () => {
  const store = createMemoryStore();
  let t = 1;
  const game = createGame({ store, scoring, questions: POOL, now: () => (t += 1000) });
  const r = await game.startRound(A);
  for (let i = 0; i < 5; i++) await game.answer(A, { roundId: r.roundId, index: i, guess: price(r.questionIds[i]) });
  const res = await Promise.allSettled([game.finishRound(A, { roundId: r.roundId }), game.finishRound(A, { roundId: r.roundId })]);
  assert.equal(res.filter((x) => x.status === "fulfilled").length, 2);
  const [a, b] = res.map((x) => x.value);
  assert.equal([a, b].filter((x) => x.repeated).length, 1, "один запрос записал, второй получил сохранённый итог");
  assert.equal(a.total, b.total);
  assert.deepEqual(a.rewards.sort(), b.rewards.sort());
  assert.equal(store.rewards.length, 2);
  assert.equal(store.players.get(A.id).rounds, 1);
});

test("награды сохраняются после перезапуска сервера (файл базы открыт заново)", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "fv-rewards-"));
  const file = path.join(dir, "fv.sqlite");
  try {
    const s1 = sqliteGame(file);
    await play(s1.game, A, { [LEG_Q]: 500 }); // только EPIC
    s1.db.close();
    const s2 = sqliteGame(file); // «перезапуск»: новая база-объект, новый game, тот же файл
    const lb = await s2.game.leaderboard(A);
    assert.deepEqual(lb.top[0].cosmetics, { prefix: "cosmograph", banner: null });
    await play(s2.game, A); // теперь и LEGENDARY
    const lb2 = await s2.game.leaderboard(A);
    assert.deepEqual(lb2.top[0].cosmetics, { prefix: "cosmograph", banner: "uhlenhaut-night" });
    s2.db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("рейтинг: игроки без наград — прежний формат, с наградами — поле cosmetics", async () => {
  const { game } = sqliteGame();
  await play(game, A);                                  // обе награды, 5000 очков
  await play(game, B, { [EPIC_Q]: 100, [LEG_Q]: 100 }); // без наград
  const lb = await game.leaderboard(B);
  assert.deepEqual(lb.top[0], { name: "Анна", best: 5000, isMe: false, cosmetics: { prefix: "cosmograph", banner: "uhlenhaut-night" } });
  assert.deepEqual(Object.keys(lb.top[1]).sort(), ["best", "isMe", "name"], "строка без наград не изменилась");
  assert.equal(lb.top[1].isMe, true);
});

test("cosmeticsByUser: самая новая награда каждого вида, неизвестные id игнорируются", () => {
  const cfg = { REWARDS: { a: { kind: "prefix" }, b: { kind: "prefix" }, c: { kind: "banner" } } };
  const m = cosmeticsByUser([
    { userId: 1, rewardId: "b", earnedAt: 30 },
    { userId: 1, rewardId: "deleted", earnedAt: 20 },
    { userId: 1, rewardId: "a", earnedAt: 10 },
    { userId: 2, rewardId: "c", earnedAt: 5 }
  ], cfg);
  assert.deepEqual(m.get(1), { prefix: "b" });
  assert.deepEqual(m.get(2), { banner: "c" });
});

test("HTTP: клиент не может прислать награду сам — лишние поля игнорируются", async () => {
  const TOKEN = "123456:TEST_TOKEN_FOR_REWARDS";
  const store = createMemoryStore();
  const env = { BOT_TOKEN: TOKEN, ALLOWED_ORIGIN: "*" };
  const initData = await signInitData({ query_id: "AAE", user: JSON.stringify({ id: 303, first_name: "Вера" }), auth_date: String(Math.floor(Date.now() / 1000)) }, TOKEN);
  const call = async (method, p, body) => {
    const res = await handle(new Request("https://x" + p, { method, headers: { Authorization: "tma " + initData }, body: body ? JSON.stringify(body) : undefined }), env, { store, questions: POOL });
    return { status: res.status, data: await res.json() };
  };
  const start = await call("POST", "/api/round/start");
  for (let i = 0; i < 5; i++) {
    // очень неточные ответы + попытка «подсунуть» награду
    await call("POST", "/api/round/answer", { roundId: start.data.roundId, index: i, guess: price(start.data.questionIds[i]) * 2, rewards: ["uhlenhaut-night"] });
  }
  const fin = await call("POST", "/api/round/finish", { roundId: start.data.roundId, rewards: ["uhlenhaut-night", "cosmograph"], cosmetics: { banner: "uhlenhaut-night" } });
  assert.equal(fin.status, 200);
  assert.equal(fin.data.rewards, undefined);
  assert.equal(store.rewards.length, 0);
  const lb = await call("GET", "/api/leaderboard");
  assert.equal(lb.data.top[0].cosmetics, undefined);
});

test("миграция 0001: добавляет таблицу наград, не трогая players и rounds; повторный запуск безопасен", () => {
  const db = new DatabaseSync(":memory:");
  const oldSchema = SCHEMA.split("-- Косметические награды")[0]; // схема до наград
  db.exec(oldSchema);
  db.prepare("INSERT INTO players (user_id, name, best, best_at, rounds, updated_at) VALUES (1, 'Старый игрок', 4321, 10, 7, 10)").run();
  db.prepare("INSERT INTO rounds (id, user_id, question_ids, created_at) VALUES ('r1', 1, '[]', 5)").run();
  db.exec(MIGRATION);
  db.exec(MIGRATION);
  assert.deepEqual({ ...db.prepare("SELECT name, best, rounds FROM players").get() }, { name: "Старый игрок", best: 4321, rounds: 7 });
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM rounds").get().n, 1);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM player_rewards").get().n, 0);
});

// ───────────── Надёжность: сбой базы во время завершения раунда ─────────────

/** Играет раунд до конца ответов (без завершения), все ответы точные → обе награды заслужены. */
async function answerAll(game, user) {
  const r = await game.startRound(user);
  for (let i = 0; i < 5; i++) await game.answer(user, { roundId: r.roundId, index: i, guess: price(r.questionIds[i]) });
  return r;
}
const snapshot = (db, roundId) => ({
  round: { ...db.prepare("SELECT status, answers_count, total, answers FROM rounds WHERE id = ?").get(roundId) },
  players: db.prepare("SELECT user_id, best, rounds FROM players").all().map((x) => ({ ...x })),
  rewards: db.prepare("SELECT reward_id FROM player_rewards ORDER BY reward_id").all().map((x) => x.reward_id)
});

test("старая схема (до исправления): сбой между завершением раунда и записью награды терял награду", async () => {
  // Воспроизводим прежний порядок отдельными командами: раунд → результат → награда (здесь «падает»)
  const { db, game } = sqliteGame();
  const r = await answerAll(game, A);
  const D = d1(db);
  await D.prepare("UPDATE rounds SET status = 'finished', total = 5000, finished_at = 1 WHERE id = ? AND status = 'active'").bind(r.roundId).run();
  await D.prepare("INSERT INTO players (user_id, name, best, best_at, rounds, updated_at) VALUES (?, 'Анна', 5000, 1, 1, 1)").bind(A.id).run();
  // ← здесь сбой базы: INSERT в player_rewards не выполнился
  const repeat = await game.finishRound(A, { roundId: r.roundId });
  assert.equal(repeat.repeated, true);
  assert.equal(repeat.rewards, undefined);
  assert.deepEqual(snapshot(db, r.roundId).rewards, [], "награда потеряна: раунд уже завершён, повтор только читает итог"); 
});

for (const [label, pick] of [
  ["на завершении раунда", (sql, i) => i === 0],
  ["на записи результата игрока", (sql, i) => i === 1],
  ["на записи первой награды", (sql, i) => i === 2],
  ["на записи второй награды", (sql, i) => i === 3]
]) {
  test(`сбой ${label}: откатывается всё, повторное завершение выдаёт награды и не удваивает очки`, async () => {
    const { db, game, fault } = sqliteGame();
    const r = await answerAll(game, A);
    const before = snapshot(db, r.roundId);
    fault.on = pick;
    await assert.rejects(game.finishRound(A, { roundId: r.roundId }), /Сбой базы/);
    fault.on = null;
    assert.deepEqual(snapshot(db, r.roundId), before, "после сбоя база ровно такая же, как до попытки");
    assert.equal(before.round.status, "active");

    const fin = await game.finishRound(A, { roundId: r.roundId });
    assert.equal(fin.total, 5000);
    assert.deepEqual(fin.rewards.sort(), ["cosmograph", "uhlenhaut-night"]);
    const after = snapshot(db, r.roundId);
    assert.equal(after.round.status, "finished");
    assert.equal(after.round.answers, before.round.answers, "ответы и очки за вопросы не пересчитывались");
    assert.equal(after.round.answers_count, 5);
    assert.deepEqual(after.players, [{ user_id: A.id, best: 5000, rounds: 1 }], "раунд засчитан ровно один раз");
    assert.deepEqual(after.rewards, ["cosmograph", "uhlenhaut-night"]);
    const repeat = await game.finishRound(A, { roundId: r.roundId });
    assert.deepEqual(repeat, { ...fin, repeated: true });
    assert.deepEqual(snapshot(db, r.roundId), after, "повтор ничего не записал");
  });
}

test("SQLite: два завершения одного раунда подряд (гонка) — засчитано и награждено один раз", async () => {
  const { db, game, store } = sqliteGame();
  const r = await answerAll(game, A);
  const args = { roundId: r.roundId, userId: A.id, name: "Анна", total: 5000, at: 5, rewards: RW.earnedFor(r.questionIds, (await store.getRound(r.roundId)).answers) };
  // Оба запроса уже прочитали раунд как active и отправили транзакции
  const first = await store.finishRoundAtomic(args);
  const second = await store.finishRoundAtomic({ ...args, at: 5 }); // даже с той же меткой времени
  assert.equal(first.finished, true);
  assert.equal(second.finished, false);
  assert.deepEqual(db.prepare("SELECT rounds, best FROM players").all().map((x) => ({ ...x })), [{ rounds: 1, best: 5000 }]);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM player_rewards").get().n, 2);
});

test("SQLite: чужой раунд нельзя завершить транзакцией от имени другого игрока", async () => {
  const { db, game, store } = sqliteGame();
  const r = await answerAll(game, A);
  const res = await store.finishRoundAtomic({ roundId: r.roundId, userId: B.id, name: "Борис", total: 5000, at: 5, rewards: [{ rewardId: "cosmograph", questionId: EPIC_Q, points: 1000 }] });
  assert.equal(res.finished, false);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM players").get().n, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM player_rewards").get().n, 0);
  assert.equal(snapshot(db, r.roundId).round.status, "active");
});

test("хранилище в памяти ведёт себя так же: сбой на любом шаге откатывает всё", async () => {
  for (const step of ["round", "player", "reward"]) {
    const store = createMemoryStore();
    let t = 1;
    const game = createGame({ store, scoring, questions: POOL, now: () => (t += 1000) });
    const r = await answerAll(game, A);
    store.failAt = step;
    await assert.rejects(game.finishRound(A, { roundId: r.roundId }), /Сбой базы/);
    store.failAt = null;
    assert.equal((await store.getRound(r.roundId)).status, "active", step);
    assert.equal(store.players.size, 0, step);
    assert.equal(store.rewards.length, 0, step);
    const fin = await game.finishRound(A, { roundId: r.roundId });
    assert.deepEqual(fin.rewards.sort(), ["cosmograph", "uhlenhaut-night"], step);
    assert.equal(store.players.get(A.id).rounds, 1, step);
  }
});

// ───────────── Неопределённый результат: запись прошла, ответ потерян ─────────────

test("запись успешна, ответ потерян: повторный запрос возвращает сохранённый итог без повторного начисления", async () => {
  const db = new DatabaseSync(":memory:");
  db.exec(SCHEMA);
  let lose = 0; // сколько ответов базы «потерять» на пакетах завершения
  let t = 1_700_000_000_000;
  const store = createD1Store(d1(db, { loseAck: (st) => st[0].sql.startsWith("UPDATE rounds SET status = 'finished'") && lose-- > 0 }));
  const game = createGame({ store, scoring, questions: POOL, now: () => (t += 1000) });
  const r = await answerAll(game, A);

  lose = 1;
  await assert.rejects(game.finishRound(A, { roundId: r.roundId }), /Ответ базы потерян/);
  const saved = snapshot(db, r.roundId);
  assert.equal(saved.round.status, "finished", "запись на самом деле прошла");
  assert.deepEqual(saved.players, [{ user_id: A.id, best: 5000, rounds: 1 }]);
  assert.deepEqual(saved.rewards, ["cosmograph", "uhlenhaut-night"]);

  const retry = await game.finishRound(A, { roundId: r.roundId });
  assert.deepEqual(retry, { total: 5000, best: 5000, newBest: true, repeated: true, rewards: ["cosmograph", "uhlenhaut-night"] });
  assert.deepEqual(snapshot(db, r.roundId), saved, "повтор ничего не записал: очки и награды не начислены второй раз");
  const retry2 = await game.finishRound(A, { roundId: r.roundId });
  assert.deepEqual(retry2, retry, "сколько ни повторяй — тот же итог");
});

test("HTTP: первый ответ на завершение потерян (500), повтор — 200 с тем же итогом; рейтинг и награды по одному разу", async () => {
  const TOKEN = "123456:TEST_TOKEN_LOST_ACK";
  const db = new DatabaseSync(":memory:");
  db.exec(SCHEMA);
  let lose = 0;
  const env = { BOT_TOKEN: TOKEN, ALLOWED_ORIGIN: "*", DB: d1(db, { loseAck: (st) => st[0].sql.startsWith("UPDATE rounds SET status = 'finished'") && lose-- > 0 }) };
  const initData = await signInitData({ query_id: "AAE", user: JSON.stringify({ id: 404, first_name: "Ника" }), auth_date: String(Math.floor(Date.now() / 1000)) }, TOKEN);
  const call = async (method, p, body) => {
    const res = await handle(new Request("https://x" + p, { method, headers: { Authorization: "tma " + initData }, body: body ? JSON.stringify(body) : undefined }), env, { questions: POOL });
    return { status: res.status, data: await res.json() };
  };
  const start = await call("POST", "/api/round/start");
  for (let i = 0; i < 5; i++) await call("POST", "/api/round/answer", { roundId: start.data.roundId, index: i, guess: price(start.data.questionIds[i]) });
  lose = 1;
  const first = await call("POST", "/api/round/finish", { roundId: start.data.roundId });
  assert.equal(first.status, 500, "игра не получила ответа об успехе");
  const second = await call("POST", "/api/round/finish", { roundId: start.data.roundId });
  assert.equal(second.status, 200);
  assert.deepEqual(second.data, { total: 5000, best: 5000, newBest: true, repeated: true, rewards: ["cosmograph", "uhlenhaut-night"] });
  assert.deepEqual(db.prepare("SELECT best, rounds FROM players").all().map((x) => ({ ...x })), [{ best: 5000, rounds: 1 }]);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM player_rewards").get().n, 2);
  const lb = await call("GET", "/api/leaderboard");
  assert.deepEqual(lb.data.top[0].cosmetics, { prefix: "cosmograph", banner: "uhlenhaut-night" });
});

test("повтор завершения: чужой раунд недоступен, итог не раскрывается", async () => {
  const { game } = sqliteGame();
  const r = await answerAll(game, A);
  await game.finishRound(A, { roundId: r.roundId });
  await assert.rejects(game.finishRound(B, { roundId: r.roundId }), { code: "round_not_found" });
});

test("повтор завершения через долгое время (раунд «просрочен») всё равно возвращает сохранённый итог", async () => {
  const store = createMemoryStore();
  let t = 1_000;
  const game = createGame({ store, scoring, questions: POOL, now: () => t });
  const r = await answerAll(game, A);
  const fin = await game.finishRound(A, { roundId: r.roundId });
  t += 2 * 60 * 60 * 1000;
  assert.deepEqual(await game.finishRound(A, { roundId: r.roundId }), { ...fin, repeated: true });
  assert.equal(store.players.get(A.id).rounds, 1);
});

test("повтор после более позднего рекорда: newBest = false, best — текущий лучший", async () => {
  const { game } = sqliteGame();
  const weak = await play(game, A, { [EPIC_Q]: 500, [LEG_Q]: 500 });
  const strong = await play(game, A);
  assert.ok(strong.fin.total > weak.fin.total);
  const repeat = await game.finishRound(A, { roundId: weak.r.roundId });
  assert.deepEqual(repeat, { total: weak.fin.total, best: strong.fin.total, newBest: false, repeated: true });
});

test("игра + сервер целиком: ответ базы потерян → игра сама повторяет запрос и показывает засчитанный итог", async () => {
  const ENGINE = require("../../js/engine.js");
  const TOKEN = "123456:TEST_TOKEN_E2E_RETRY";
  const db = new DatabaseSync(":memory:");
  db.exec(SCHEMA);
  let lose = 1; // потерять ответ базы на первом завершении
  const env = { BOT_TOKEN: TOKEN, ALLOWED_ORIGIN: "*", DB: d1(db, { loseAck: (st) => st[0].sql.startsWith("UPDATE rounds SET status = 'finished'") && lose-- > 0 }) };
  const initData = await signInitData({ query_id: "AAE", user: JSON.stringify({ id: 505, first_name: "Лиза" }), auth_date: String(Math.floor(Date.now() / 1000)) }, TOKEN);
  const statuses = [];
  // Тот же контракт, что у js/api.js: ошибка HTTP → объект со status и code
  const request = async (method, p, body) => {
    const res = await handle(new Request("https://x" + p, { method, headers: { Authorization: "tma " + initData }, body: body ? JSON.stringify(body) : undefined }), env, { questions: POOL });
    const data = await res.json();
    if (p === "/api/round/finish") statuses.push(res.status);
    if (!res.ok) throw Object.assign(new Error(data.error), { status: res.status, code: data.code || "http" });
    return data;
  };
  const api = {
    startRound: () => request("POST", "/api/round/start"),
    answer: (roundId, index, guess) => request("POST", "/api/round/answer", { roundId, index, guess }),
    finishRound: (roundId) => request("POST", "/api/round/finish", { roundId })
  };
  const sleeps = [];
  const eng = ENGINE.RemoteEngine({ scoring, api, questions: POOL, sleep: async (ms) => { sleeps.push(ms); } });
  const { questions } = await eng.start();
  for (let i = 0; i < 5; i++) await eng.answer(i, questions[i].price);
  const fin = await eng.finish();
  assert.deepEqual(statuses, [500, 200], "первый ответ потерян, повтор успешен");
  assert.deepEqual(sleeps, [800]);
  assert.equal(fin.ranked, true);
  assert.deepEqual(fin.server, { total: 5000, best: 5000, newBest: true, repeated: true, rewards: ["cosmograph", "uhlenhaut-night"] });
  assert.deepEqual(db.prepare("SELECT best, rounds FROM players").all().map((x) => ({ ...x })), [{ best: 5000, rounds: 1 }], "очки засчитаны один раз");
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM player_rewards").get().n, 2, "награды выданы один раз");
});

// ───────────── Все 20 наград ─────────────

test("все 20 наград: каждая выдаётся сервером за свой вопрос на пороге и не выдаётся на 1 очко ниже", async () => {
  const db = new DatabaseSync(":memory:");
  db.exec(SCHEMA);
  let t = 1_700_000_000_000;
  const store = createD1Store(d1(db));
  const FILL = ["iphone-18-pro", "airtag", "ps5-pro", "lego-titanic"].map(q);
  const entries = Object.entries(RW.REWARDS);
  assert.equal(entries.length, 20);
  for (let n = 0; n < entries.length; n++) {
    const [rewardId, def] = entries[n];
    const game = createGame({ store, scoring, questions: [q(def.questionId), ...FILL], now: () => (t += 1000) });
    const below = { id: 7000 + n, firstName: "Ниже", lastName: "" };
    const at = { id: 8000 + n, firstName: "Ровно", lastName: "" };
    for (const [user, pts] of [[below, def.minPoints - 1], [at, def.minPoints]]) {
      const r = await game.startRound(user);
      for (let i = 0; i < 5; i++) {
        const id = r.questionIds[i];
        await game.answer(user, { roundId: r.roundId, index: i, guess: id === def.questionId ? guessFor(id, pts) : price(id) * 3 });
      }
      const fin = await game.finishRound(user, { roundId: r.roundId });
      if (user === below) assert.equal(fin.rewards, undefined, `${rewardId}: ${pts} очков — награды нет`);
      else assert.deepEqual(fin.rewards, [rewardId], `${rewardId}: ${pts} очков — награда есть`);
    }
  }
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM player_rewards").get().n, 20, "ровно 20 записей, по одной на награду");
  // Рейтинг: у каждого получившего — своя косметика нужного вида
  const game = createGame({ store, scoring, questions: POOL, now: () => (t += 1000) });
  const lb = await game.leaderboard(null, 100);
  const shown = lb.top.filter((r) => r.cosmetics).map((r) => r.cosmetics.prefix || r.cosmetics.banner).sort();
  assert.deepEqual(shown, entries.map(([id]) => id).sort());
  for (const row of lb.top.filter((r) => r.cosmetics)) {
    const id = row.cosmetics.prefix || row.cosmetics.banner;
    assert.equal(row.cosmetics.prefix ? "prefix" : "banner", RW.REWARDS[id].kind, id);
  }
});

// ───────────── Профиль: коллекция и выбор оформления ─────────────

test("профиль: без наград — пусто; после наград — обе видны, по умолчанию показывается самая новая", async () => {
  const { game } = sqliteGame();
  assert.deepEqual(await game.profile(A), { rewards: [], selected: { prefix: null, banner: null }, custom: false });
  await play(game, A);
  const p = await game.profile(A);
  assert.deepEqual(p.rewards.map((r) => r.id).sort(), ["cosmograph", "uhlenhaut-night"]);
  assert.deepEqual(p.selected, { prefix: "cosmograph", banner: "uhlenhaut-night" });
  assert.equal(p.custom, false);
});

test("выбор оформления: можно выбрать полученное и снять; рейтинг показывает именно выбор", async () => {
  const { game } = sqliteGame();
  await play(game, A);
  let p = await game.setCosmetics(A, { prefix: "cosmograph", banner: null });
  assert.deepEqual(p.selected, { prefix: "cosmograph", banner: null });
  assert.equal(p.custom, true);
  let lb = await game.leaderboard(A);
  assert.deepEqual(lb.top[0].cosmetics, { prefix: "cosmograph", banner: null });
  p = await game.setCosmetics(A, { prefix: null, banner: null });
  lb = await game.leaderboard(A);
  assert.equal(lb.top[0].cosmetics, undefined, "всё снято — строка как у игрока без наград");
  assert.deepEqual(p.rewards.map((r) => r.id).sort(), ["cosmograph", "uhlenhaut-night"], "снятие не удаляет награды");
  p = await game.setCosmetics(A, { prefix: null, banner: "uhlenhaut-night" });
  lb = await game.leaderboard(A);
  assert.deepEqual(lb.top[0].cosmetics, { prefix: null, banner: "uhlenhaut-night" });
});

test("выбор оформления: невыданную, чужую, неизвестную награду или не тот вид назначить нельзя", async () => {
  const { game } = sqliteGame();
  await play(game, A, { [LEG_Q]: 500 }); // у A только «Космограф»
  await play(game, B);                    // у B обе
  await assert.rejects(game.setCosmetics(A, { prefix: "cosmograph", banner: "uhlenhaut-night" }), { code: "not_owned", status: 403 });
  await assert.rejects(game.setCosmetics(A, { prefix: "perpetual-calendar", banner: null }), { code: "not_owned" });
  await assert.rejects(game.setCosmetics(A, { prefix: "no-such-reward", banner: null }), { code: "bad_cosmetic", status: 400 });
  await assert.rejects(game.setCosmetics(A, { prefix: "uhlenhaut-night", banner: null }), { code: "bad_cosmetic" }, "баннер вместо префикса");
  await assert.rejects(game.setCosmetics(A, { prefix: "cosmograph" }), { code: "bad_cosmetic" }, "нужно указать оба поля");
  await assert.rejects(game.setCosmetics(A, { prefix: 5, banner: null }), { code: "bad_cosmetic" });
  const pa = await game.profile(A);
  assert.equal(pa.custom, false, "отклонённый запрос ничего не сохранил");
  assert.deepEqual(pa.selected, { prefix: "cosmograph", banner: null });
});

test("выбор оформления сохраняется после перезапуска; устаревший выбор не показывается", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "fv-cosm-"));
  const file = path.join(dir, "fv.sqlite");
  try {
    const s1 = sqliteGame(file);
    await play(s1.game, A);
    await s1.game.setCosmetics(A, { prefix: null, banner: "uhlenhaut-night" });
    s1.db.close();
    const s2 = sqliteGame(file);
    assert.deepEqual((await s2.game.profile(A)).selected, { prefix: null, banner: "uhlenhaut-night" });
    assert.deepEqual((await s2.game.leaderboard(A)).top[0].cosmetics, { prefix: null, banner: "uhlenhaut-night" });
    // Запись выбора с наградой, которой у игрока нет (например, вписана вручную в базу), игнорируется
    s2.db.prepare("UPDATE player_cosmetics SET prefix = 'golden-adele' WHERE user_id = ?").run(A.id);
    assert.deepEqual((await s2.game.leaderboard(A)).top[0].cosmetics, { prefix: null, banner: "uhlenhaut-night" });
    s2.db.close();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("HTTP: профиль и выбор только с подписью Telegram; чужую награду не выбрать", async () => {
  const TOKEN = "123456:TEST_TOKEN_PROFILE";
  const db = new DatabaseSync(":memory:");
  db.exec(SCHEMA);
  const env = { BOT_TOKEN: TOKEN, ALLOWED_ORIGIN: "*", DB: d1(db) };
  const auth = async (id) => signInitData({ query_id: "AAE", user: JSON.stringify({ id, first_name: "U" + id }), auth_date: String(Math.floor(Date.now() / 1000)) }, TOKEN);
  const call = async (method, p, body, initData) => {
    const headers = initData ? { Authorization: "tma " + initData } : {};
    const res = await handle(new Request("https://x" + p, { method, headers, body: body ? JSON.stringify(body) : undefined }), env, { questions: POOL });
    return { status: res.status, data: await res.json() };
  };
  assert.equal((await call("GET", "/api/profile")).status, 401);
  assert.equal((await call("POST", "/api/profile/cosmetics", { prefix: "cosmograph", banner: null })).status, 401);
  const a = await auth(1), b = await auth(2);
  const st = await call("POST", "/api/round/start", null, a);
  for (let i = 0; i < 5; i++) await call("POST", "/api/round/answer", { roundId: st.data.roundId, index: i, guess: price(st.data.questionIds[i]) }, a);
  await call("POST", "/api/round/finish", { roundId: st.data.roundId }, a);
  const pa = await call("GET", "/api/profile", null, a);
  assert.deepEqual(pa.data.rewards.map((r) => r.id).sort(), ["cosmograph", "uhlenhaut-night"]);
  const steal = await call("POST", "/api/profile/cosmetics", { prefix: "cosmograph", banner: "uhlenhaut-night" }, b);
  assert.equal(steal.status, 403);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM player_cosmetics").get().n, 0);
  const ok = await call("POST", "/api/profile/cosmetics", { prefix: null, banner: "uhlenhaut-night", rewards: ["golden-adele"] }, a);
  assert.equal(ok.status, 200);
  assert.deepEqual(ok.data.selected, { prefix: null, banner: "uhlenhaut-night" });
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM player_rewards").get().n, 2, "лишние поля не создают наград");
});

test("миграция 0002: добавляет таблицу выбора, не трогая остальные; повторный запуск безопасен", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(SCHEMA.split("-- Выбранное игроком оформление")[0]); // схема до 0002
  db.prepare("INSERT INTO player_rewards VALUES (1, 'cosmograph', 'rolex-daytona-steel', 'r1', 950, 5)").run();
  const M2 = readFileSync(new URL("../migrations/0002_player_cosmetics.sql", import.meta.url), "utf8");
  db.exec(M2); db.exec(M2);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM player_rewards").get().n, 1);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM player_cosmetics").get().n, 0);
});
