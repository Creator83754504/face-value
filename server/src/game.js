/*
 * Логика рейтинговых раундов. Не зависит от конкретной базы данных:
 * получает объект store (см. d1-store.js и memory-store в тестах).
 *
 * Защита от подделки:
 *  • вопросы раунда выбирает сервер, клиент получает только их id;
 *  • цену вопроса сервер сообщает только ПОСЛЕ ответа на него;
 *  • очки считает сервер по той же формуле, что и игра (js/scoring.js);
 *  • ответы принимаются строго по порядку и только один раз (оптимистичная блокировка);
 *  • раунд принадлежит конкретному пользователю Telegram и живёт ограниченное время;
 *  • завершить раунд можно один раз — повторная отправка не меняет рейтинг;
 *  • ограничение на число раундов в час.
 */

export const ROUND_SIZE = 5;
export const ROUND_TTL_MS = 30 * 60 * 1000;      // раунд действителен 30 минут
export const MAX_ROUNDS_PER_HOUR = 60;
export const MAX_GUESS = 1e9;

export class GameError extends Error {
  constructor(message, status, code) { super(message); this.status = status; this.code = code; }
}

export function createGame({ store, scoring, questions, now = () => Date.now(), random = Math.random, uuid = () => crypto.randomUUID() }) {
  const byId = new Map(questions.map((q) => [q.id, q]));

  function displayName(user) {
    const n = [user.firstName, user.lastName ? user.lastName[0] + "." : ""].filter(Boolean).join(" ").trim();
    return (n || "Игрок").replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 32);
  }

  async function loadOwnRound(user, roundId) {
    if (typeof roundId !== "string" || !/^[0-9a-f-]{36}$/i.test(roundId)) throw new GameError("Неверный раунд", 400, "bad_round");
    const round = await store.getRound(roundId);
    if (!round || round.userId !== user.id) throw new GameError("Раунд не найден", 404, "round_not_found");
    return round;
  }

  return {
    async startRound(user) {
      const t = now();
      const recent = await store.countRoundsSince(user.id, t - 60 * 60 * 1000);
      if (recent >= MAX_ROUNDS_PER_HOUR) throw new GameError("Слишком много раундов. Отдохни немного.", 429, "rate_limited");
      const seen = await store.recentQuestionIds(user.id, 6); // вопросы последних раундов — не повторяем
      const picked = scoring.pickRound(questions, ROUND_SIZE, seen, random);
      const round = { id: uuid(), userId: user.id, questionIds: picked.map((q) => q.id), createdAt: t };
      await store.createRound(round);
      return { roundId: round.id, questionIds: round.questionIds, expiresAt: t + ROUND_TTL_MS };
    },

    async answer(user, { roundId, index, guess }) {
      const round = await loadOwnRound(user, roundId);
      if (round.status !== "active") throw new GameError("Раунд уже завершён", 409, "round_finished");
      if (now() - round.createdAt > ROUND_TTL_MS) {
  await store.expireRound(round.id, now());
  throw new GameError("Время раунда истекло", 410, "round_expired");
}
      if (!Number.isInteger(index) || index !== round.answersCount || index >= round.questionIds.length) {
        throw new GameError("Неверный номер вопроса", 409, "bad_index");
      }
      if (typeof guess !== "number" || !Number.isFinite(guess) || guess <= 0 || guess > MAX_GUESS) {
        throw new GameError("Некорректная цена", 400, "bad_guess");
      }
      const q = byId.get(round.questionIds[index]);
      if (!q) throw new GameError("Вопрос не найден", 500, "question_missing");
      const g = Math.round(guess * 100) / 100;
      const points = scoring.scoreGuess(g, q.price).points;
      const answers = round.answers.concat([{ guess: g, points }]);
      const total = scoring.roundTotal(answers.map((a) => a.points), ROUND_SIZE);
      const ok = await store.saveAnswer(round.id, round.answersCount, answers, total);
      if (!ok) throw new GameError("Ответ уже принят", 409, "duplicate_answer");
      return { index, price: q.price, points, total, note: q.note || "" };
    },

    async finishRound(user, { roundId }) {
      const round = await loadOwnRound(user, roundId);
      if (round.status !== "active") throw new GameError("Раунд уже завершён", 409, "round_finished");
      if (round.answersCount !== round.questionIds.length) throw new GameError("Есть неотвеченные вопросы", 409, "not_complete");
      const total = scoring.roundTotal(round.answers.map((a) => a.points), ROUND_SIZE);
      const t = now();
      const ok = await store.finishRound(round.id, total, t);
      if (!ok) throw new GameError("Раунд уже завершён", 409, "round_finished");
      const result = await store.recordResult({ userId: user.id, name: displayName(user), total, at: t });
      return { total, best: result.best, newBest: result.newBest };
    },

    async leaderboard(user, limit = 50) {
      const top = await store.topPlayers(limit);
      let me = null;
      if (user) {
        const p = await store.getPlayer(user.id);
        if (p && p.best > 0) me = { best: p.best, position: await store.positionOf(p) };
      }
      return {
        top: top.map((p) => ({ name: p.name, best: p.best, isMe: !!user && p.userId === user.id })),
        me
      };
    }
  };
}
