// Проверка SQL-хранилища (d1-store.js) на настоящем SQLite.
// Cloudflare D1 — это SQLite, поэтому здесь используется встроенный в Node модуль node:sqlite
// с тонкой обёрткой, повторяющей API D1 (prepare / bind / first / all / run).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createD1Store } from "../src/d1-store.js";
import { createGame } from "../src/game.js";

const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite");
const scoring = require("../../js/scoring.js");
const { QUESTIONS } = require("../../js/data/questions.js");

function d1(db) {
  return {
    prepare(sql) {
      const st = db.prepare(sql);
      let args = [];
      const api = {
        bind(...a) { args = a; return api; },
        async first() { return st.get(...args) ?? null; },
        async all() { return { results: st.all(...args) }; },
        async run() { const r = st.run(...args); return { meta: { changes: Number(r.changes) } }; }
      };
      return api;
    }
  };
}

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

async function play(game, user, factor) {
  const r = await game.startRound(user);
  for (let i = 0; i < 5; i++) await game.answer(user, { roundId: r.roundId, index: i, guess: priceOf(r.questionIds[i]) * factor });
  return { r, fin: await game.finishRound(user, { roundId: r.roundId }) };
}

test("SQLite: полный раунд, рекорд и рейтинг", async () => {
  const { game, db } = setup();
  const first = await play(game, A, 1.25);
  assert.equal(first.fin.newBest, true);
  const worse = await play(game, A, 3);
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

test("SQLite: двойной ответ и повторное завершение отклоняются", async () => {
  const { game } = setup();
  const r = await game.startRound(A);
  const res = await Promise.allSettled([
    game.answer(A, { roundId: r.roundId, index: 0, guess: 10 }),
    game.answer(A, { roundId: r.roundId, index: 0, guess: 10 })
  ]);
  assert.equal(res.filter((x) => x.status === "fulfilled").length, 1);
  for (let i = 1; i < 5; i++) await game.answer(A, { roundId: r.roundId, index: i, guess: 10 });
  await game.finishRound(A, { roundId: r.roundId });
  await assert.rejects(game.finishRound(A, { roundId: r.roundId }), { code: "round_finished" });
});

test("SQLite: следующий раунд не повторяет вопросы предыдущего", async () => {
  const { game } = setup();
  const a = await game.startRound(A);
  const b = await game.startRound(A);
  assert.equal(a.questionIds.filter((id) => b.questionIds.includes(id)).length, 0);
});
