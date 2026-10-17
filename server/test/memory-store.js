/* Хранилище в памяти — повторяет поведение d1-store.js. Только для тестов. */
export function createMemoryStore() {
  const rounds = new Map();
  const players = new Map();
  const rewards = [];
  const clone = (x) => JSON.parse(JSON.stringify(x));
  return {
    rounds, players, rewards,
    selections: new Map(),
    async selectionsOf(userIds) {
      return userIds.filter((id) => this.selections.has(id)).map((id) => ({ userId: id, ...clone(this.selections.get(id)) }));
    },
    async setSelection(userId, prefix, banner, at) {
      this.selections.set(userId, { prefix, banner, updatedAt: at });
    },
    async rewardsOfRound(userId, roundId) {
      return rewards.filter((x) => x.userId === userId && x.roundId === roundId).map((x) => x.rewardId).sort();
    },
    async rewardsOf(userIds) {
      return rewards.filter((x) => userIds.includes(x.userId)).sort((a, b) => b.earnedAt - a.earnedAt)
        .map((x) => ({ userId: x.userId, rewardId: x.rewardId, earnedAt: x.earnedAt }));
    },
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
    /**
     * Повторяет транзакцию d1-store.finishRoundAtomic: всё или ничего.
     * failAt — для тестов сбоя: "round" | "player" | "reward" — бросить ошибку на этом шаге.
     */
    failAt: null,
    async finishRoundAtomic({ roundId, userId, name, total, at, rewards: list = [] }) {
      const snapshot = { rounds: clone([...rounds]), players: clone([...players]), rewards: clone(rewards) };
      const fail = (step) => { if (this.failAt === step) throw new Error("Сбой базы (тест): " + step); };
      try {
        const r = rounds.get(roundId);
        fail("round");
        if (!r || r.userId !== userId || r.status !== "active") return { finished: false };
        r.status = "finished"; r.total = total; r.finishedAt = at;
        fail("player");
        const p = players.get(userId) || { userId, name, best: 0, bestAt: null, rounds: 0 };
        const prev = p.best;
        p.name = name; p.rounds += 1;
        if (total > p.best) { p.best = total; p.bestAt = at; }
        players.set(userId, p);
        const granted = [];
        for (const x of list) {
          fail("reward");
          if (rewards.some((y) => y.userId === userId && y.rewardId === x.rewardId)) continue;
          rewards.push({ userId, rewardId: x.rewardId, questionId: x.questionId, roundId, points: x.points, earnedAt: at });
          granted.push(x.rewardId);
        }
        return { finished: true, best: p.best, newBest: total > prev, rewards: granted };
      } catch (err) {
        // откат «транзакции»
        rounds.clear(); snapshot.rounds.forEach(([k, v]) => rounds.set(k, v));
        players.clear(); snapshot.players.forEach(([k, v]) => players.set(k, v));
        rewards.length = 0; rewards.push(...snapshot.rewards);
        throw err;
      }
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
