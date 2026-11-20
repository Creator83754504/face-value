// Тесты чистой логики: индикаторы, риск, движок симулятора, бэктест, генератор данных, прогресс.
// Запуск: node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const CA = require("./load.js");
const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps, `${a} ≈ ${b}`);

test("SMA и EMA", () => {
  const s = CA.indicators.sma([1, 2, 3, 4, 5], 3);
  assert.deepEqual(s, [null, null, 2, 3, 4]);
  const e = CA.indicators.ema([1, 2, 3, 4, 5], 3);
  near(e[2], 2); near(e[3], 3); near(e[4], 4);
});

test("RSI: только рост → 100, только падение → 0, в пределах 0..100", () => {
  const up = Array.from({ length: 30 }, (_, i) => 100 + i);
  assert.equal(CA.indicators.rsi(up, 14)[29], 100);
  const down = up.slice().reverse();
  near(CA.indicators.rsi(down, 14)[29], 0);
  const walk = CA.market.randomWalk({ n: 300, seed: 1 }).map((c) => c.c);
  CA.indicators.rsi(walk, 14).filter((v) => v != null).forEach((v) => assert.ok(v >= 0 && v <= 100));
});

test("MACD и Bollinger: согласованность", () => {
  const cl = CA.market.randomWalk({ n: 200, seed: 2 }).map((c) => c.c);
  const m = CA.indicators.macd(cl);
  const i = 150;
  near(m.hist[i], m.macd[i] - m.signal[i]);
  const b = CA.indicators.bollinger(cl, 20, 2);
  assert.ok(b.upper[i] > b.mid[i] && b.mid[i] > b.lower[i]);
  near(b.upper[i] - b.mid[i], b.mid[i] - b.lower[i]);
});

test("Размер позиции и результат сделки", () => {
  const r = CA.risk.positionSize({ balance: 10000, riskPct: 1, entry: 50, stop: 48 });
  near(r.qty, 50); near(r.riskAmount, 100);
  const f = CA.risk.positionSize({ balance: 10000, riskPct: 1, entry: 100, stop: 95, feePct: 0.1 });
  near(f.qty * (100 - 95) + f.feesAtStop, 100, 1e-6);
  assert.equal(CA.risk.positionSize({ balance: 1000, riskPct: 1, entry: 50, stop: 50 }).ok, false);
  assert.equal(CA.risk.positionSize({ balance: 1000, riskPct: 1, entry: 50, stop: 55, side: "long" }).ok, false);
  const t = CA.risk.tradeResult({ entry: 100, exit: 101, qty: 10, feePct: 0.1 });
  near(t.gross, 10); near(t.fees, 2.01); near(t.net, 7.99);
});

test("R:R, безубыточность, восстановление, ликвидация, просадка", () => {
  near(CA.risk.riskReward(100, 96, 112).ratio, 3);
  near(CA.risk.breakevenWinRate(2), 100 / 3);
  near(CA.risk.expectancyR(40, 2), 0.2);
  near(CA.risk.recoveryNeeded(50), 100);
  near(CA.risk.liquidationPrice({ entry: 100, leverage: 10, side: "long", mmr: 0 }), 90);
  near(CA.risk.liquidationPrice({ entry: 100, leverage: 10, side: "short", mmr: 0 }), 110);
  const dd = CA.risk.maxDrawdown([100, 120, 90, 130, 117]);
  near(dd.pct, 25); assert.equal(dd.peak, 1); assert.equal(dd.trough, 2);
});

test("Движок: покупка, комиссии, стоп, тейк, лимитный ордер", () => {
  const E = CA.engine, st = E.create({ balance: 10000, fee: 0.001, slippage: 0 });
  assert.equal(E.buy(st, { asset: "A", usdt: 5, price: 100, i: 0 }).ok, false, "минимальная сумма");
  assert.equal(E.buy(st, { asset: "A", usdt: 20000, price: 100, i: 0 }).ok, false, "не больше баланса");
  assert.equal(E.buy(st, { asset: "A", usdt: 1000, price: 100, sl: 101, i: 0 }).ok, false, "стоп ниже входа");
  const r = E.buy(st, { asset: "A", usdt: 1000, price: 100, sl: 95, tp: 110, i: 0, equity: 10000 });
  assert.ok(r.ok); near(st.cash, 9000); near(r.trade.qty, 9.99);
  // свеча задевает и стоп, и тейк — консервативно исполняется стоп
  const ev = E.step(st, { A: { o: 100, h: 111, l: 94, c: 100 } }, 1);
  assert.equal(ev[0].type, "stop");
  const t = st.closed[0];
  near(t.exit, 95); assert.ok(t.pnl < 0);
  near(t.pnl, 9.99 * 95 * 0.999 - 1000, 1e-6);
  // гэп ниже стопа — исполнение по открытию
  E.buy(st, { asset: "A", usdt: 1000, price: 100, sl: 95, i: 2 });
  E.step(st, { A: { o: 90, h: 92, l: 88, c: 91 } }, 3);
  near(st.closed[1].exit, 90);
  // лимитный ордер резервирует средства и исполняется при касании
  const cashBefore = st.cash;
  assert.ok(E.placeLimit(st, { asset: "A", usdt: 500, limit: 85, price: 91, i: 4 }).ok);
  near(st.cash, cashBefore - 500);
  E.step(st, { A: { o: 90, h: 91, l: 84, c: 86 } }, 5);
  assert.equal(st.orders.length, 0); assert.equal(st.open.length, 1); near(st.open[0].entry, 85);
  const s = E.stats(st);
  assert.equal(s.trades, 2); assert.equal(s.losses, 2); assert.ok(s.maxDrawdownPct >= 0);
});

test("Тренер: сделка без стопа и с FOMO получает замечания", () => {
  const candles = CA.market.scenario("pump-dump", 1).candles;
  const top = CA.market.scenario("pump-dump", 1).meta.top;
  const st = CA.engine.create();
  CA.engine.buy(st, { asset: "A", usdt: 8000, price: candles[top].c, i: top, equity: 10000 });
  const r = CA.engine.close(st, st.open[0].id, candles[top + 3].c, top + 3, "manual");
  const rv = CA.coach.review(r.trade, { candles, allClosed: st.closed });
  const titles = rv.items.map((x) => x.title).join(" | ");
  assert.match(titles, /без Stop Loss/);
  assert.match(titles, /FOMO/);
  assert.ok(rv.verdict.length > 20);
});

test("Генератор: корректные свечи, детерминированность, уровни сценариев", () => {
  for (const name of CA.market.scenarioNames) {
    for (let seed = 1; seed <= 15; seed++) {
      const a = CA.market.scenario(name, seed, { price: 2500 }), b = CA.market.scenario(name, seed, { price: 2500 });
      assert.deepEqual(a.candles, b.candles, "один seed — один график");
      a.candles.forEach((c) => assert.ok(c.h >= Math.max(c.o, c.c) && c.l <= Math.min(c.o, c.c) && c.l > 0 && c.v > 0, `${name}#${seed}`));
      if (a.meta.levels) {
        const S = a.meta.levels.find((l) => l.type === "support").price, R = a.meta.levels.find((l) => l.type === "resistance").price;
        assert.ok(R > S);
      }
      if (name === "breakout-up") assert.ok(a.candles[a.meta.breakoutIndex].c > a.meta.levels[1].price);
      if (name === "false-breakout-up") { const c = a.candles[a.meta.falseBreakIndex]; assert.ok(c.h > a.meta.levels[1].price && c.c < a.meta.levels[1].price); }
      if (name === "pullback-entry") assert.ok(a.meta.cut < a.candles.length);
    }
  }
  const agg = CA.market.aggregate([{ t: 0, o: 1, h: 3, l: 0.5, c: 2, v: 1 }, { t: 1, o: 2, h: 4, l: 1.5, c: 3, v: 2 }], 2);
  assert.deepEqual(agg[0], { t: 0, o: 1, h: 4, l: 0.5, c: 3, v: 3 });
});

test("Бэктест: без заглядывания вперёд и с издержками", () => {
  const d = CA.market.randomWalk({ n: 1500, seed: "bt" });
  const r = CA.backtest.run(d, { entry: "breakout", params: { lookback: 20 } }, { to: 1500 });
  assert.ok(r.trades.length > 5);
  r.trades.forEach((t) => { assert.ok(t.openI > 0 && t.closeI >= t.openI); assert.ok(t.sl < t.entry && t.tp > t.entry); });
  const sig = CA.backtest.signals(d, { entry: "breakout", params: { lookback: 20 } });
  r.trades.forEach((t) => assert.ok(sig[t.openI - 1], "вход на свече после сигнала"));
  const noFee = CA.backtest.run(d, { entry: "breakout", params: { lookback: 20 } }, { fee: 0, slippage: 0 });
  assert.ok(noFee.stats.final >= r.stats.final, "издержки уменьшают результат");
});

test("Прогресс: последовательное открытие уроков, тест ≥ 70%, XP, достижения, повреждённые данные", () => {
  const mem = {}; const storage = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
  const course = CA.course.index();
  const store = CA.progress.createStore({ storage, course });
  const [l1, l2] = course.lessons;
  assert.equal(store.isUnlocked(l1.id), true);
  assert.equal(store.isUnlocked(l2.id), false);
  l1.practice.forEach((t) => store.recordTask(l1.id, t));
  assert.equal(store.isDone(l1.id), false, "без теста урок не завершён");
  assert.equal(store.recordQuiz(l1.id, 3, 6, [{ qid: "x" }]).passed, false);
  assert.equal(store.isDone(l1.id), false, "50% < 70%");
  const r = store.recordQuiz(l1.id, 6, 6, []);
  assert.ok(r.completed);
  assert.equal(store.isUnlocked(l2.id), true);
  assert.ok(store.state.achievements["first-lesson"] && store.state.achievements["perfect-quiz"]);
  assert.ok(store.state.xp >= 100 + 40 + 25 * l1.practice.length);
  // сохранение и восстановление
  const again = CA.progress.createStore({ storage, course });
  assert.equal(again.isDone(l1.id), true);
  assert.equal(again.state.xp, store.state.xp);
  // повреждённые данные
  mem[CA.progress.KEY] = "{не json";
  const broken = CA.progress.createStore({ storage, course });
  assert.equal(broken.state.xp, 0);
  // свободный режим
  broken.setSetting("freeMode", true);
  assert.equal(broken.isUnlocked(course.lessons[10].id), true);
});

test("Прогресс: карточки и серия ежедневных заданий", () => {
  let now = Date.parse("2026-03-10T10:00:00");
  const store = CA.progress.createStore({ storage: { getItem: () => null, setItem() {}, removeItem() {} }, course: CA.course.index(), now: () => now });
  const c = store.reviewCard("Спред", true);
  assert.equal(c.box, 2); assert.equal(store.cardDue("Спред"), false);
  store.reviewCard("Спред", false); assert.equal(store.state.cards["Спред"].box, 1);
  for (const d of ["2026-03-10", "2026-03-11", "2026-03-12"]) {
    now = Date.parse(d + "T10:00:00");
    ["a", "b", "c"].forEach((id) => store.completeDaily(id, 3));
  }
  assert.equal(store.streak(), 3);
  assert.ok(store.state.achievements["streak-3"]);
  now = Date.parse("2026-03-15T10:00:00");
  assert.equal(store.streak(), 0, "серия прерывается после пропуска");
});
