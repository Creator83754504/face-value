/*
 * Индикаторы технического анализа. Чистые функции: на входе массив чисел или свечей,
 * на выходе массив той же длины (null там, где данных для расчёта ещё не хватает).
 */
(function (g) {
  "use strict";
  var CA = g.CA || (g.CA = {});

  function closes(c) { return c.map(function (x) { return typeof x === "number" ? x : x.c; }); }

  function sma(values, period) {
    var out = new Array(values.length).fill(null), sum = 0;
    for (var i = 0; i < values.length; i++) {
      sum += values[i];
      if (i >= period) sum -= values[i - period];
      if (i >= period - 1) out[i] = sum / period;
    }
    return out;
  }

  // EMA стартует от SMA первых period значений (классический способ)
  function ema(values, period) {
    var out = new Array(values.length).fill(null);
    if (values.length < period) return out;
    var k = 2 / (period + 1), sum = 0;
    for (var i = 0; i < period; i++) sum += values[i];
    var prev = sum / period;
    out[period - 1] = prev;
    for (var j = period; j < values.length; j++) { prev = values[j] * k + prev * (1 - k); out[j] = prev; }
    return out;
  }

  // RSI по Уайлдеру
  function rsi(values, period) {
    period = period || 14;
    var out = new Array(values.length).fill(null);
    if (values.length <= period) return out;
    var gain = 0, loss = 0;
    for (var i = 1; i <= period; i++) {
      var d = values[i] - values[i - 1];
      if (d >= 0) gain += d; else loss -= d;
    }
    var ag = gain / period, al = loss / period;
    out[period] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
    for (var j = period + 1; j < values.length; j++) {
      var dd = values[j] - values[j - 1];
      ag = (ag * (period - 1) + Math.max(dd, 0)) / period;
      al = (al * (period - 1) + Math.max(-dd, 0)) / period;
      out[j] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
    }
    return out;
  }

  function macd(values, fast, slow, signal) {
    fast = fast || 12; slow = slow || 26; signal = signal || 9;
    var ef = ema(values, fast), es = ema(values, slow);
    var line = values.map(function (_, i) { return ef[i] !== null && es[i] !== null ? ef[i] - es[i] : null; });
    var start = line.findIndex(function (v) { return v !== null; });
    var sig = new Array(values.length).fill(null);
    if (start >= 0) {
      var e = ema(line.slice(start), signal);
      for (var i = 0; i < e.length; i++) sig[start + i] = e[i];
    }
    var hist = line.map(function (v, i) { return v !== null && sig[i] !== null ? v - sig[i] : null; });
    return { macd: line, signal: sig, hist: hist };
  }

  function bollinger(values, period, mult) {
    period = period || 20; mult = mult || 2;
    var mid = sma(values, period), up = [], lo = [];
    for (var i = 0; i < values.length; i++) {
      if (mid[i] === null) { up.push(null); lo.push(null); continue; }
      var s = 0;
      for (var j = i - period + 1; j <= i; j++) s += Math.pow(values[j] - mid[i], 2);
      var sd = Math.sqrt(s / period);
      up.push(mid[i] + mult * sd); lo.push(mid[i] - mult * sd);
    }
    return { mid: mid, upper: up, lower: lo };
  }

  // Средний истинный диапазон — мера «обычного» размаха свечи
  function atr(candles, period) {
    period = period || 14;
    var tr = candles.map(function (c, i) {
      if (i === 0) return c.h - c.l;
      var pc = candles[i - 1].c;
      return Math.max(c.h - c.l, Math.abs(c.h - pc), Math.abs(c.l - pc));
    });
    var out = new Array(candles.length).fill(null);
    if (candles.length < period) return out;
    var s = 0;
    for (var i = 0; i < period; i++) s += tr[i];
    var prev = s / period; out[period - 1] = prev;
    for (var j = period; j < candles.length; j++) { prev = (prev * (period - 1) + tr[j]) / period; out[j] = prev; }
    return out;
  }

  var api = { closes: closes, sma: sma, ema: ema, rsi: rsi, macd: macd, bollinger: bollinger, atr: atr };
  CA.indicators = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
