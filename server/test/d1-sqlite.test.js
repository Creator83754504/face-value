// Проверка SQL-хранилища (d1-store.js) на настоящем SQLite.
// Cloudflare D1 — это SQLite, поэтому здесь используется встроенный в Node модуль node:sqlite
// с тонкой обёрткой, повторяющей API D1 (prepare / bind / first / all / run).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createD1Store } from "../src/d1-store.js";
import { createGame, MAX_GUESS } from "../src/game.js";
import { d1 } from "./sqlite-d1.js"; // обёртка D1 вынесена в общий файл (добавлен batch для транзакций)

const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite");
const scoring = require("../../js/scoring.js");
const { QUESTIONS } = require("../../js/data/questions.js");

function setup() {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
  let t = 1_700_000_000_000;
  const game = createGame({ store: createD1Store(d1(db)), scoring, questions: QUESTIONS, now: () => (t += 1000) });
  return { db, game };
}
const priceOf = (id) => QUESTIONS.find((q) => q.id === id).price;
const A = { id: 101, firstName: "Анна", lastName: "" };
const B = { id: 202, firstName: "Борис", lastName: "" };

/**
 * Догадка, ошибающаяся «в factor раз». Раньше тест брал цену × factor, и для вопросов дороже
 * ~$333 млн при factor = 3 догадка превышала лимит ввода $1 млрд (MAX_GUESS) → bad_guess,
 * тест падал в зависимости от того, какие вопросы выпали. Теперь ошибаемся ВНИЗ: цена / factor.
 * Это всегда ≤ цены, а значит ≤ лимита, при любой цене из каталога. Очки те же:
 * формула штрафует перелёт и недолёт в одно и то же число раз одинаково (|ln(догадка/цена)|).
 */
const guessOff = (price, factor) => price / factor;

async function play(game, user, factor) {
  const r = await game.startRound(user);
  for (let i = 0; i < 5; i++) await game.answer(user, { roundId: r.roundId, index: i, guess: guessOff(priceOf(r.questionIds[i]), factor) });
  return { r, fin: await game.finishRound(user, { roundId: r.roundId }) };
}

test("тестовые догадки укладываются в лимит ввода для ЛЮБОГО вопроса и дают те же очки, что перелёт", () => {
  for (const q of QUESTIONS) {
    for (const f of [1, 1.25, 3]) {
      const g = Math.round(guessOff(q.price, f) * 100) / 100; // сервер округляет догадку до центов
      assert.ok(g > 0 && g <= MAX_GUESS, `${q.id} ×${f}: догадка ${g}`);
      assert.equal(scoring.scoreGuess(guessOff(q.price, f), q.price).points, scoring.scoreGuess(q.price * f, q.price).points, `${q.id} ×${f}`);
    }
  }
});

test("SQLite: полный раунд, рекорд и рейтинг", async () => {
  const { game, db } = setup();
  const first = await play(game, A, 1.25);   // ошибка в 1,25 раза — около 750 очков за вопрос
  assert.equal(first.fin.newBest, true);
  assert.ok(first.fin.total > 0 && first.fin.total < 5000, `первый раунд: ${first.fin.total}`);
  const worse = await play(game, A, 3);      // ошибка в 3 раза — 0 очков, рекорд не меняется
  assert.ok(worse.fin.total < first.fin.total, `второй раунд хуже: ${worse.fin.total}`);
  assert.equal(worse.fin.newBest, false);
  assert.equal(worse.fin.best, first.fin.total);
  await play(game, B, 1);
  const row = db.prepare("SELECT best, rounds FROM players WHERE user_id = ?").get(A.id);
  assert.equal(row.best, first.fin.total);
  assert.equal(row.rounds, 2);
  const lb = await game.leaderboard(A);
  assert.equal(lb.top[0].best, 5000);
  assert.deepEqual(lb.me, { best: first.fin.total, position: 2 });
});

test("SQLite: двойной ответ отклоняется, повторное завершение возвращает сохранённый итог", async () => {
  const { game, db } = setup();
  const r = await game.startRound(A);
  const res = await Promise.allSettled([
    game.answer(A, { roundId: r.roundId, index: 0, guess: 10 }),
    game.answer(A, { roundId: r.roundId, index: 0, guess: 10 })
  ]);
  assert.equal(res.filter((x) => x.status === "fulfilled").length, 1);
  for (let i = 1; i < 5; i++) await game.answer(A, { roundId: r.roundId, index: i, guess: 10 });
  const fin = await game.finishRound(A, { roundId: r.roundId });
  // Повторное завершение больше не ошибка: возвращается сохранённый итог, ничего не пишется
  const again = await game.finishRound(A, { roundId: r.roundId });
  assert.deepEqual(again, { ...fin, repeated: true });
  assert.equal(db.prepare("SELECT rounds FROM players WHERE user_id = ?").get(A.id).rounds, 1, "раунд засчитан один раз");
});

test("SQLite: следующий раунд не повторяет вопросы предыдущего", async () => {
  const { game } = setup();
  const a = await game.startRound(A);
  const b = await game.startRound(A);
  assert.equal(a.questionIds.filter((id) => b.questionIds.includes(id)).length, 0);
});
