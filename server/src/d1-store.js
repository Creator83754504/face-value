/* Хранилище раундов и рейтинга в Cloudflare D1 (SQLite). */

function rowToRound(r) {
  if (!r) return null;
  return {
    id: r.id,
    userId: Number(r.user_id),
    questionIds: JSON.parse(r.question_ids),
    answers: JSON.parse(r.answers),
    answersCount: Number(r.answers_count),
    total: Number(r.total),
    status: r.status,
    createdAt: Number(r.created_at),
    finishedAt: r.finished_at == null ? null : Number(r.finished_at)
  };
}

export function createD1Store(db) {
  return {
    async countRoundsSince(userId, since) {
      const r = await db.prepare("SELECT COUNT(*) AS n FROM rounds WHERE user_id = ? AND created_at >= ?").bind(userId, since).first();
      return Number(r?.n || 0);
    },

    async recentQuestionIds(userId, roundsBack) {
      const { results } = await db.prepare("SELECT question_ids FROM rounds WHERE user_id = ? ORDER BY created_at DESC LIMIT ?").bind(userId, roundsBack).all();
      return (results || []).flatMap((r) => JSON.parse(r.question_ids));
    },

    async createRound(round) {
      await db.prepare("INSERT INTO rounds (id, user_id, question_ids, created_at) VALUES (?, ?, ?, ?)")
        .bind(round.id, round.userId, JSON.stringify(round.questionIds), round.createdAt).run();
    },

    async getRound(id) {
      return rowToRound(await db.prepare("SELECT * FROM rounds WHERE id = ?").bind(id).first());
    },

    /** Сохраняет ответ, только если с момента чтения никто не успел ответить (защита от двойной отправки). */
    async saveAnswer(id, expectedCount, answers, total) {
      const res = await db.prepare(
        "UPDATE rounds SET answers = ?, answers_count = answers_count + 1, total = ? WHERE id = ? AND answers_count = ? AND status = 'active'"
      ).bind(JSON.stringify(answers), total, id, expectedCount).run();
      return (res.meta?.changes || 0) === 1;
    },

    async topPlayers(limit) {
      const { results } = await db.prepare("SELECT user_id, name, best, best_at FROM players WHERE best > 0 ORDER BY best DESC, best_at ASC LIMIT ?").bind(limit).all();
      return (results || []).map((r) => ({ userId: Number(r.user_id), name: r.name, best: Number(r.best), bestAt: Number(r.best_at) }));
    },

    async getPlayer(userId) {
      const r = await db.prepare("SELECT user_id, name, best, best_at FROM players WHERE user_id = ?").bind(userId).first();
      return r ? { userId: Number(r.user_id), name: r.name, best: Number(r.best), bestAt: Number(r.best_at) } : null;
    },

    /**
     * Завершение раунда ОДНОЙ транзакцией (D1 batch: либо выполняются все команды, либо ни одна):
     *   1) раунд active → finished (только если он ещё active — защита от повторного завершения);
     *   2) результат игрока (лучший счёт, число раундов) — ТОЛЬКО если шаг 1 действительно изменил раунд
     *      (changes() = 1), иначе повторная отправка засчитала бы раунд дважды;
     *   3) награды — только если раунд этого игрока завершён; OR IGNORE не даёт выдать награду дважды.
     * Если база упадёт на любом шаге, откатится всё: раунд останется active, и его можно завершить
     * ещё раз — без потери награды и без двойного начисления очков.
     */
    async finishRoundAtomic({ roundId, userId, name, total, at, rewards = [] }) {
      const before = await db.prepare("SELECT best FROM players WHERE user_id = ?").bind(userId).first();
      const prevBest = Number(before?.best || 0);
      const statements = [
        db.prepare("UPDATE rounds SET status = 'finished', total = ?, finished_at = ? WHERE id = ? AND user_id = ? AND status = 'active'")
          .bind(total, at, roundId, userId),
        db.prepare(
          `INSERT INTO players (user_id, name, best, best_at, rounds, updated_at)
           SELECT ?, ?, ?, ?, 1, ? WHERE changes() = 1
           ON CONFLICT(user_id) DO UPDATE SET
             name = excluded.name,
             rounds = players.rounds + 1,
             best_at = CASE WHEN excluded.best > players.best THEN excluded.best_at ELSE players.best_at END,
             best = MAX(players.best, excluded.best),
             updated_at = excluded.updated_at`
        ).bind(userId, name, total, at, at),
        ...rewards.map((r) => db.prepare(
          `INSERT OR IGNORE INTO player_rewards (user_id, reward_id, question_id, round_id, points, earned_at)
           SELECT ?, ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM rounds WHERE id = ? AND user_id = ? AND status = 'finished')`
        ).bind(userId, r.rewardId, r.questionId, roundId, r.points, at, roundId, userId))
      ];
      const results = await db.batch(statements);
      const changed = (i) => Number(results[i]?.meta?.changes || 0) === 1;
      if (!changed(0)) return { finished: false };
      return {
        finished: true,
        best: Math.max(prevBest, total),
        newBest: total > prevBest,
        rewards: rewards.filter((_, i) => changed(2 + i)).map((r) => r.rewardId)
      };
    },

    /** Награды, полученные игроком в конкретном раунде (для повторного ответа на завершение). */
    async rewardsOfRound(userId, roundId) {
      const { results } = await db.prepare("SELECT reward_id FROM player_rewards WHERE user_id = ? AND round_id = ? ORDER BY reward_id")
        .bind(userId, roundId).all();
      return (results || []).map((r) => r.reward_id);
    },

    /** Награды нескольких игроков: [{ userId, rewardId, earnedAt }], новые — первыми. */
    async rewardsOf(userIds) {
      if (!userIds.length) return [];
      const ids = userIds.slice(0, 100);
      const { results } = await db.prepare(
        `SELECT user_id, reward_id, earned_at FROM player_rewards WHERE user_id IN (${ids.map(() => "?").join(",")}) ORDER BY earned_at DESC`
      ).bind(...ids).all();
      return (results || []).map((r) => ({ userId: Number(r.user_id), rewardId: r.reward_id, earnedAt: Number(r.earned_at) }));
    },

    /** Выбранное оформление игроков: [{ userId, prefix, banner }]. Нет строки — игрок ничего не выбирал. */
    async selectionsOf(userIds) {
      if (!userIds.length) return [];
      const ids = userIds.slice(0, 100);
      const { results } = await db.prepare(
        `SELECT user_id, prefix, banner FROM player_cosmetics WHERE user_id IN (${ids.map(() => "?").join(",")})`
      ).bind(...ids).all();
      return (results || []).map((r) => ({ userId: Number(r.user_id), prefix: r.prefix ?? null, banner: r.banner ?? null }));
    },

    /** Сохраняет выбор оформления (проверка владения — в game.js, до вызова). */
    async setSelection(userId, prefix, banner, at) {
      await db.prepare(
        `INSERT INTO player_cosmetics (user_id, prefix, banner, updated_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET prefix = excluded.prefix, banner = excluded.banner, updated_at = excluded.updated_at`
      ).bind(userId, prefix, banner, at).run();
    },

    async positionOf(p) {
      const r = await db.prepare("SELECT COUNT(*) AS n FROM players WHERE best > ? OR (best = ? AND best_at < ?)").bind(p.best, p.best, p.bestAt).first();
      return Number(r?.n || 0) + 1;
    }
  };
}
