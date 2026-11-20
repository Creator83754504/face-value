/*
 * Учебный бэктестер: проверка простых правил на синтетических исторических данных.
 * Сигнал определяется по закрытию свечи, вход — по открытию следующей (нет «заглядывания в будущее»).
 * Размер позиции — от риска (по умолчанию 1% капитала), учитываются комиссия и проскальзывание.
 */
(function (g) {
  "use strict";
  var CA = g.CA || (g.CA = {});
  if (typeof require === "function") { if (!CA.indicators) require("./indicators.js"); if (!CA.risk) require("./risk.js"); }

  var ENTRIES = {
    "ma-cross": { title: "Пересечение скользящих средних", params: { fast: 10, slow: 30 } },
    "rsi-revert": { title: "RSI выходит из перепроданности", params: { period: 14, level: 30 } },
    "breakout": { title: "Пробой максимума N свечей", params: { lookback: 20 } },
    "pullback-ema": { title: "Откат к EMA в тренде", params: { ema: 20, trend: 50 } }
  };

  function signals(candles, rule) {
    var IND = CA.indicators, cl = candles.map(function (c) { return c.c; }), p = rule.params || ENTRIES[rule.entry].params, sig = new Array(candles.length).fill(false), i;
    if (rule.entry === "ma-cross") {
      var f = IND.ema(cl, p.fast), s = IND.ema(cl, p.slow);
      for (i = 1; i < cl.length; i++) if (f[i - 1] != null && s[i - 1] != null && f[i - 1] <= s[i - 1] && f[i] > s[i]) sig[i] = true;
    } else if (rule.entry === "rsi-revert") {
      var r = IND.rsi(cl, p.period);
      for (i = 1; i < cl.length; i++) if (r[i - 1] != null && r[i - 1] < p.level && r[i] >= p.level) sig[i] = true;
    } else if (rule.entry === "breakout") {
      for (i = p.lookback; i < cl.length; i++) {
        var hi = -Infinity;
        for (var j = i - p.lookback; j < i; j++) hi = Math.max(hi, candles[j].h);
        if (cl[i] > hi && cl[i - 1] <= hi) sig[i] = true;
      }
    } else if (rule.entry === "pullback-ema") {
      var e = IND.ema(cl, p.ema), t = IND.sma(cl, p.trend);
      for (i = 1; i < cl.length; i++) if (e[i] && t[i] && e[i] > t[i] && candles[i].l <= e[i] && cl[i] > e[i] && cl[i] > candles[i].o) sig[i] = true;
    }
    return sig;
  }

  /*
   * rule = { entry, params, trendFilter (bool: только выше SMA 100), stopAtr (множитель ATR), rr (цель в R), riskPct, maxBars }
   */
  function run(candles, rule, opts) {
    opts = opts || {};
    var IND = CA.indicators, fee = opts.fee == null ? 0.001 : opts.fee, slip = opts.slippage == null ? 0.0005 : opts.slippage;
    var from = opts.from || 0, to = opts.to == null ? candles.length : opts.to;
    var cl = candles.map(function (c) { return c.c; });
    var sig = signals(candles, rule), atr = IND.atr(candles, 14), trend = IND.sma(cl, 100);
    var eq = opts.balance || 10000, start = eq, trades = [], curve = [], pos = null;
    var riskPct = rule.riskPct || 1, stopAtr = rule.stopAtr || 2, rr = rule.rr || 2, maxBars = rule.maxBars || 60;
    for (var i = Math.max(from, 1); i < to; i++) {
      var c = candles[i];
      if (pos) {
        var exit = null, reason = null;
        if (c.l <= pos.sl) { exit = Math.min(c.o, pos.sl) * (1 - slip); reason = "stop"; }
        else if (c.h >= pos.tp) { exit = Math.max(c.o, pos.tp); reason = "take"; }
        else if (i - pos.i >= maxBars) { exit = c.c * (1 - slip); reason = "time"; }
        if (exit != null) {
          var value = pos.qty * exit, pnl = value * (1 - fee) - pos.cost;
          eq += pnl;
          trades.push({ openI: pos.i, closeI: i, entry: pos.entry, exit: exit, sl: pos.sl, tp: pos.tp, pnl: pnl, r: pnl / pos.risk, reason: reason });
          pos = null;
        }
      }
      if (!pos && i + 1 < to && sig[i] && atr[i]) {
        if (rule.trendFilter && !(trend[i] && cl[i] > trend[i])) { curve.push(eq); continue; }
        var n = candles[i + 1], entry = n.o * (1 + slip), sl = entry - atr[i] * stopAtr, tp = entry + (entry - sl) * rr;
        var riskAmt = eq * riskPct / 100, qty = riskAmt / (entry - sl + fee * (entry + sl));
        var cost = qty * entry * (1 + fee);
        if (cost > eq) { qty = eq / (entry * (1 + fee)); cost = eq; }
        pos = { i: i + 1, entry: entry, sl: sl, tp: tp, qty: qty, cost: cost, risk: riskAmt };
      }
      var open = pos && pos.i <= i ? pos.qty * c.c * (1 - fee) - pos.cost : 0;
      curve.push(eq + open);
    }
    var wins = trades.filter(function (t) { return t.pnl > 0; });
    var gw = wins.reduce(function (s, t) { return s + t.pnl; }, 0), gl = -trades.filter(function (t) { return t.pnl <= 0; }).reduce(function (s, t) { return s + t.pnl; }, 0);
    return {
      trades: trades, curve: curve,
      stats: {
        trades: trades.length, winRate: trades.length ? wins.length / trades.length * 100 : 0,
        netPct: (eq - start) / start * 100, profitFactor: gl > 0 ? gw / gl : (gw > 0 ? Infinity : 0),
        avgR: trades.length ? trades.reduce(function (s, t) { return s + t.r; }, 0) / trades.length : 0,
        maxDD: CA.risk.maxDrawdown([start].concat(curve)).pct, final: eq
      }
    };
  }

  var api = { ENTRIES: ENTRIES, signals: signals, run: run };
  CA.backtest = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
