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

    async finishRound(id, total, at) {
      const res = await db.prepare("UPDATE rounds SET status = 'finished', total = ?, finished_at = ? WHERE id = ? AND status = 'active'")
        .bind(total, at, id).run();
      return (res.meta?.changes || 0) === 1;
    },

    async recordResult({ userId, name, total, at }) {
      const before = await db.prepare("SELECT best FROM players WHERE user_id = ?").bind(userId).first();
      const prevBest = Number(before?.best || 0);
      await db.prepare(
        `INSERT INTO players (user_id, name, best, best_at, rounds, updated_at) VALUES (?, ?, ?, ?, 1, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           name = excluded.name,
           rounds = players.rounds + 1,
           best_at = CASE WHEN excluded.best > players.best THEN excluded.best_at ELSE players.best_at END,
           best = MAX(players.best, excluded.best),
           updated_at = excluded.updated_at`
      ).bind(userId, name, total, at, at).run();
      return { best: Math.max(prevBest, total), newBest: total > prevBest };
    },

    async topPlayers(limit) {
      const { results } = await db.prepare("SELECT user_id, name, best, best_at FROM players WHERE best > 0 ORDER BY best DESC, best_at ASC LIMIT ?").bind(limit).all();
      return (results || []).map((r) => ({ userId: Number(r.user_id), name: r.name, best: Number(r.best), bestAt: Number(r.best_at) }));
    },

    async getPlayer(userId) {
      const r = await db.prepare("SELECT user_id, name, best, best_at FROM players WHERE user_id = ?").bind(userId).first();
      return r ? { userId: Number(r.user_id), name: r.name, best: Number(r.best), bestAt: Number(r.best_at) } : null;
    },

    async positionOf(p) {
      const r = await db.prepare("SELECT COUNT(*) AS n FROM players WHERE best > ? OR (best = ? AND best_at < ?)").bind(p.best, p.best, p.bestAt).first();
      return Number(r?.n || 0) + 1;
    }
  };
}
