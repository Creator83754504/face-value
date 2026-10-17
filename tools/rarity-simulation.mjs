#!/usr/bin/env node
/*
 * FACE VALUE — симуляция системы редкости.
 *
 *   node tools/rarity-simulation.mjs                 — 200 000 раундов (1 000 000 вопросов)
 *   node tools/rarity-simulation.mjs --rounds 50000 --seed 7
 *
 * Прогоняет настоящий выбор вопросов (js/scoring.js → pickRoundDetailed) на текущей базе
 * и печатает: сколько раз выпала каждая редкость (разыгранная и фактически показанная),
 * ожидаемые значения, отклонение в сигмах и критерий хи-квадрат.
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const S = require("../js/scoring.js");
const DATA = require("../js/data/questions.js");

/** Детерминированный генератор случайных чисел (mulberry32), чтобы результат можно было повторить. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Критические значения хи-квадрат для p = 0.001 по числу степеней свободы. */
const CHI2_CRIT_001 = { 1: 10.828, 2: 13.816, 3: 16.266, 4: 18.467 };

export function simulate({ rounds = 200000, seed = 20261016, questions = DATA.QUESTIONS.filter((q) => q.status === "verified"), cfg = S.RARITY, withSeen = true } = {}) {
  const random = mulberry32(seed);
  const rolled = Object.fromEntries(cfg.ORDER.map((r) => [r, 0]));
  const used = Object.fromEntries(cfg.ORDER.map((r) => [r, 0]));
  let fallbacks = 0;
  let duplicates = 0;
  let seen = [];
  for (let i = 0; i < rounds; i++) {
    const { questions: qs, rolls } = S.pickRoundDetailed(questions, 5, withSeen ? seen : [], random, 2, cfg);
    if (new Set(qs.map((q) => q.id)).size !== qs.length) duplicates++;
    rolls.forEach((r) => { rolled[r.rolled]++; used[r.used]++; if (r.rolled !== r.used) fallbacks++; });
    if (withSeen) {
      // как в игре: помним показанные вопросы, а когда новых меньше 5 — начинаем круг заново
      seen = seen.concat(qs.map((q) => q.id));
      if (questions.length - new Set(seen).size < 5) seen = [];
    }
  }
  const total = Object.values(rolled).reduce((a, b) => a + b, 0);
  const stats = (counts) => {
    let chi2 = 0;
    const rows = cfg.ORDER.map((r) => {
      const p = cfg.WEIGHTS[r];
      const exp = total * p;
      const sd = Math.sqrt(total * p * (1 - p));
      const obs = counts[r];
      if (exp > 0) chi2 += (obs - exp) ** 2 / exp;
      return { rarity: r, expectedPct: p * 100, observed: obs, observedPct: (obs / total) * 100, expected: exp, sigma: sd > 0 ? (obs - exp) / sd : 0 };
    });
    const df = cfg.ORDER.filter((r) => cfg.WEIGHTS[r] > 0).length - 1;
    return { rows, chi2, df, critical: CHI2_CRIT_001[df], pass: chi2 < CHI2_CRIT_001[df] };
  };
  return { rounds, draws: total, seed, rolled: stats(rolled), used: stats(used), fallbacks, duplicates };
}

function printTable(title, st) {
  console.log(`\n${title}`);
  console.log("Редкость    | Задано  | Факт       | Кол-во    | Ожидалось  | Откл., σ");
  st.rows.forEach((r) => console.log(
    `${r.rarity.padEnd(11)} | ${r.expectedPct.toFixed(2).padStart(6)}% | ${r.observedPct.toFixed(4).padStart(8)}% | ${String(r.observed).padStart(9)} | ${r.expected.toFixed(0).padStart(10)} | ${r.sigma.toFixed(2).padStart(6)}`
  ));
  console.log(`хи-квадрат = ${st.chi2.toFixed(3)} (степеней свободы ${st.df}, порог p=0.001: ${st.critical}) → ${st.pass ? "соответствует" : "НЕ соответствует"}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (name, def) => { const i = process.argv.indexOf(name); return i > -1 ? Number(process.argv[i + 1]) : def; };
  const t0 = Date.now();
  const res = simulate({ rounds: arg("--rounds", 200000), seed: arg("--seed", 20261016) });
  console.log(`Раундов: ${res.rounds}, вопросов: ${res.draws}, seed: ${res.seed}, время: ${((Date.now() - t0) / 1000).toFixed(1)} с`);
  const pools = {};
  DATA.QUESTIONS.filter((q) => q.status === "verified").forEach((q) => { const r = S.rarityOf(q); pools[r] = (pools[r] || 0) + 1; });
  console.log("Товаров в базе по редкости:", JSON.stringify(pools));
  printTable("Разыгранная редкость:", res.rolled);
  printTable("Фактически показанная редкость (после запасного выбора):", res.used);
  console.log(`\nЗапасной выбор сработал: ${res.fallbacks} раз (${((res.fallbacks / res.draws) * 100).toFixed(4)}%). Повторов внутри раунда: ${res.duplicates}.`);
}
