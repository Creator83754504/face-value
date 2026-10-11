/* Хранилище в памяти — повторяет поведение d1-store.js. Только для тестов. */
export function createMemoryStore() {
  const rounds = new Map();
  const players = new Map();
  const clone = (x) => JSON.parse(JSON.stringify(x));
  return {
    rounds, players,
    async countRoundsSince(userId, since) {
      return [...rounds.values()].filter((r) => r.userId === userId && r.createdAt >= since).length;
    },
    async recentQuestionIds(userId, n) {
      return [...rounds.values()].filter((r) => r.userId === userId).sort((a, b) => b.createdAt - a.createdAt).slice(0, n).flatMap((r) => r.questionIds);
    },
    async createRound(r) {
      rounds.set(r.id, { ...clone(r), answers: [], answersCount: 0, total: 0, status: "active", finishedAt: null });
    },
    async getRound(id) { return rounds.has(id) ? clone(rounds.get(id)) : null; },
    async saveAnswer(id, expected, answers, total) {
      const r = rounds.get(id);
      if (!r || r.answersCount !== expected || r.status !== "active") return false;
      r.answers = clone(answers); r.answersCount += 1; r.total = total;
      return true;
    },
    async finishRound(id, total, at) {
      const r = rounds.get(id);
      if (!r || r.status !== "active") return false;
      r.status = "finished"; r.total = total; r.finishedAt = at;
      return true;
    },
    async recordResult({ userId, name, total, at }) {
      const p = players.get(userId) || { userId, name, best: 0, bestAt: null, rounds: 0 };
      const prev = p.best;
      p.name = name; p.rounds += 1;
      if (total > p.best) { p.best = total; p.bestAt = at; }
      players.set(userId, p);
      return { best: p.best, newBest: total > prev };
    },
    async topPlayers(limit) {
      return [...players.values()].filter((p) => p.best > 0).sort((a, b) => b.best - a.best || a.bestAt - b.bestAt).slice(0, limit).map(clone);
    },
    async getPlayer(id) { return players.has(id) ? clone(players.get(id)) : null; },
    async positionOf(p) {
      return [...players.values()].filter((x) => x.best > p.best || (x.best === p.best && x.bestAt < p.bestAt)).length + 1;
    }
  };
}
