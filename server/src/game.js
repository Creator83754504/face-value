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

import rewardsModule from "../../js/rewards-config.js";

export const ROUND_SIZE = 5;
export const ROUND_TTL_MS = 30 * 60 * 1000;      // раунд действителен 30 минут
export const MAX_ROUNDS_PER_HOUR = 60;
export const MAX_GUESS = 1e9;

export class GameError extends Error {
  constructor(message, status, code) { super(message); this.status = status; this.code = code; }
}

/** Для каждого игрока — самая новая награда каждого вида: { prefix, banner } (только id наград). */
export function cosmeticsByUser(rows, rewardsConfig = rewardsModule) {
  const out = new Map();
  for (const r of rows) {
    const def = rewardsConfig.REWARDS[r.rewardId];
    if (!def) continue; // неизвестная (например, удалённая) награда не показывается
    const c = out.get(r.userId) || {};
    if (!c[def.kind]) c[def.kind] = r.rewardId; // rows отсортированы: новые первыми
    out.set(r.userId, c);
  }
  return out;
}

/**
 * Что показывать в рейтинге: выбор игрока (если он что-то выбирал), иначе самая новая награда каждого вида.
 * Выбор учитывается, только если такая награда у игрока ДЕЙСТВИТЕЛЬНО есть и подходит по виду.
 */
export function effectiveCosmetics(rewardRows, selectionRows, rewardsConfig = rewardsModule) {
  const auto = cosmeticsByUser(rewardRows, rewardsConfig);
  const owned = new Map();
  for (const r of rewardRows) {
    if (!owned.has(r.userId)) owned.set(r.userId, new Set());
    owned.get(r.userId).add(r.rewardId);
  }
  const out = new Map();
  for (const [userId, c] of auto) out.set(userId, { prefix: c.prefix || null, banner: c.banner || null });
  for (const sel of selectionRows) {
    const has = owned.get(sel.userId) || new Set();
    const ok = (id, kind) => (id && has.has(id) && rewardsConfig.REWARDS[id] && rewardsConfig.REWARDS[id].kind === kind ? id : null);
    out.set(sel.userId, { prefix: ok(sel.prefix, "prefix"), banner: ok(sel.banner, "banner") });
  }
  return out;
}

export function createGame({ store, scoring, questions, now = () => Date.now(), random = Math.random, uuid = () => crypto.randomUUID(), rewardsConfig = rewardsModule }) {
  const byId = new Map(questions.map((q) => [q.id, q]));

  function displayName(user) {
    const n = [user.firstName, user.lastName ? user.lastName[0] + "." : ""].filter(Boolean).join(" ").trim();
    return (n || "Игрок").replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 32);
  }

  /** Уже сохранённый итог завершённого раунда — только чтение, без записи. */
  async function storedResult(user, round) {
    const p = await store.getPlayer(user.id);
    const rewards = await store.rewardsOfRound(user.id, round.id);
    const res = {
      total: round.total,
      best: p ? p.best : round.total,
      // рекорд поставил именно этот раунд, если лучший счёт и его время совпадают с итогом раунда
      // (total > 0: первый раунд с нулём рекордом не считается — как и при первом завершении)
      newBest: !!p && round.total > 0 && p.best === round.total && p.bestAt === round.finishedAt,
      repeated: true
    };
    if (rewards.length) res.rewards = rewards; // награды, полученные в ЭТОМ раунде (уже сохранённые)
    return res;
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
      if (now() - round.createdAt > ROUND_TTL_MS) throw new GameError("Время раунда истекло", 410, "round_expired");
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

    /**
     * Завершение раунда. Повторный запрос безопасен (идемпотентен): если раунд уже завершён —
     * например, запись прошла, а ответ до игры не дошёл, — возвращается уже сохранённый результат
     * с пометкой repeated: true. Ничего не пишется, очки и награды повторно не начисляются.
     */
    async finishRound(user, { roundId }) {
      const round = await loadOwnRound(user, roundId);
      if (round.status === "finished") return storedResult(user, round);
      if (round.status !== "active") throw new GameError("Раунд уже завершён", 409, "round_finished");
      if (round.answersCount !== round.questionIds.length) throw new GameError("Есть неотвеченные вопросы", 409, "not_complete");
      const total = scoring.roundTotal(round.answers.map((a) => a.points), ROUND_SIZE);
      const t = now();
      // Награды считаются по очкам, которые сервер сохранил при ответах; клиент их не присылает.
      const earned = rewardsConfig.earnedFor(round.questionIds, round.answers);
      // Завершение раунда, результат в рейтинге и награды — одной транзакцией (см. d1-store.js).
      const fin = await store.finishRoundAtomic({ roundId: round.id, userId: user.id, name: displayName(user), total, at: t, rewards: earned });
      if (!fin.finished) {
        // Раунд успел завершить параллельный запрос (например, повтор после потерянного ответа)
        const now2 = await loadOwnRound(user, roundId);
        if (now2.status === "finished") return storedResult(user, now2);
        throw new GameError("Раунд уже завершён", 409, "round_finished");
      }
      const res = { total, best: fin.best, newBest: fin.newBest };
      if (fin.rewards.length) res.rewards = fin.rewards; // поле есть, только если выдана НОВАЯ награда — старый формат ответа не меняется
      return res;
    },

    /**
     * Профиль: какие награды у игрока есть (по данным сервера) и что сейчас показывается в рейтинге.
     * custom = true, если игрок сам выбирал оформление; иначе показывается самая новая награда.
     */
    async profile(user) {
      const rows = await store.rewardsOf([user.id]);
      const sel = await store.selectionsOf([user.id]);
      const c = effectiveCosmetics(rows, sel, rewardsConfig).get(user.id) || { prefix: null, banner: null };
      return {
        rewards: rows.filter((r) => rewardsConfig.REWARDS[r.rewardId]).map((r) => ({ id: r.rewardId, earnedAt: r.earnedAt })),
        selected: { prefix: c.prefix || null, banner: c.banner || null },
        custom: sel.length > 0
      };
    },

    /**
     * Выбор оформления. Принимаются только награды, которые есть у игрока и подходят по виду;
     * null — снять оформление этого вида. Чужую или невыданную награду назначить нельзя.
     */
    async setCosmetics(user, body) {
      const pick = (v, kind) => {
        if (v === null) return null;
        if (typeof v !== "string" || !rewardsConfig.REWARDS[v] || rewardsConfig.REWARDS[v].kind !== kind) {
          throw new GameError("Неверное оформление", 400, "bad_cosmetic");
        }
        return v;
      };
      if (!body || typeof body !== "object" || !("prefix" in body) || !("banner" in body)) {
        throw new GameError("Нужно указать prefix и banner (id или null)", 400, "bad_cosmetic");
      }
      const prefix = pick(body.prefix, "prefix");
      const banner = pick(body.banner, "banner");
      const owned = new Set((await store.rewardsOf([user.id])).map((r) => r.rewardId));
      for (const id of [prefix, banner]) {
        if (id && !owned.has(id)) throw new GameError("Эта награда ещё не получена", 403, "not_owned");
      }
      await store.setSelection(user.id, prefix, banner, now());
      return this.profile(user);
    },

    async leaderboard(user, limit = 50) {
      const top = await store.topPlayers(limit);
      const ids = top.map((p) => p.userId);
      const cosmetics = effectiveCosmetics(await store.rewardsOf(ids), await store.selectionsOf(ids), rewardsConfig);
      let me = null;
      if (user) {
        const p = await store.getPlayer(user.id);
        if (p && p.best > 0) me = { best: p.best, position: await store.positionOf(p) };
      }
      return {
        top: top.map((p) => {
          const row = { name: p.name, best: p.best, isMe: !!user && p.userId === user.id };
          const c = cosmetics.get(p.userId);
          if (c && (c.prefix || c.banner)) row.cosmetics = { prefix: c.prefix, banner: c.banner };
          return row;
        }),
        me
      };
    }
  };
}
