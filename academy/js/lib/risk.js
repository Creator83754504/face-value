/* Риск-менеджмент: размер позиции, результат сделки, R:R, ликвидация, просадка. Чистые функции. */
(function (g) {
  "use strict";
  var CA = g.CA || (g.CA = {});

  function num(x) { return typeof x === "number" && isFinite(x); }

  /*
   * Размер позиции от риска: сколько монет купить, чтобы при срабатывании стопа
   * потерять не больше riskPct % депозита (с учётом комиссий на вход и выход).
   */
  function positionSize(o) {
    var balance = o.balance, riskPct = o.riskPct, entry = o.entry, stop = o.stop, fee = (o.feePct || 0) / 100;
    if (![balance, riskPct, entry, stop].every(num) || balance <= 0 || entry <= 0 || stop <= 0 || riskPct <= 0) return { ok: false, error: "Заполните все поля положительными числами" };
    if (entry === stop) return { ok: false, error: "Стоп не может совпадать с ценой входа" };
    var side = o.side || (stop < entry ? "long" : "short");
    if (side === "long" && stop > entry) return { ok: false, error: "Для покупки (long) стоп должен быть ниже цены входа" };
    if (side === "short" && stop < entry) return { ok: false, error: "Для продажи (short) стоп должен быть выше цены входа" };
    var riskAmount = balance * riskPct / 100;
    var lossPerUnit = Math.abs(entry - stop) + fee * (entry + stop);
    var qty = riskAmount / lossPerUnit;
    var notional = qty * entry;
    return {
      ok: true, side: side, riskAmount: riskAmount, stopDistance: Math.abs(entry - stop),
      stopPct: Math.abs(entry - stop) / entry * 100, qty: qty, notional: notional,
      notionalPct: notional / balance * 100, leverageNeeded: notional / balance,
      feesAtStop: fee * qty * (entry + stop)
    };
  }

  function tradeResult(o) {
    var fee = (o.feePct || 0) / 100, side = o.side || "long";
    if (![o.entry, o.exit, o.qty].every(num) || o.entry <= 0 || o.exit <= 0 || o.qty <= 0) return { ok: false, error: "Заполните все поля положительными числами" };
    var gross = side === "long" ? (o.exit - o.entry) * o.qty : (o.entry - o.exit) * o.qty;
    var fees = fee * o.qty * (o.entry + o.exit);
    var net = gross - fees;
    var cost = o.entry * o.qty;
    return { ok: true, gross: gross, fees: fees, net: net, pct: net / cost * 100, cost: cost };
  }

  function riskReward(entry, stop, target) {
    if (![entry, stop, target].every(num)) return null;
    var risk = Math.abs(entry - stop), reward = Math.abs(target - entry);
    if (risk === 0) return null;
    var validLong = stop < entry && target > entry, validShort = stop > entry && target < entry;
    return { risk: risk, reward: reward, ratio: reward / risk, valid: validLong || validShort, side: validLong ? "long" : validShort ? "short" : null };
  }

  // При каком проценте прибыльных сделок система выходит в ноль (без учёта комиссий)
  function breakevenWinRate(rr) { return 1 / (1 + rr) * 100; }

  // Математическое ожидание сделки в R: winRate·RR − (1−winRate)·1
  function expectancyR(winRatePct, rr) { var w = winRatePct / 100; return w * rr - (1 - w); }

  // Упрощённая цена ликвидации для изолированной маржи (mmr — поддерживающая маржа, доля)
  function liquidationPrice(o) {
    var mmr = o.mmr == null ? 0.005 : o.mmr;
    if (!num(o.entry) || !num(o.leverage) || o.leverage < 1) return null;
    if (o.side === "short") return o.entry * (1 + 1 / o.leverage - mmr);
    return o.entry * (1 - 1 / o.leverage + mmr);
  }

  // Сколько процентов нужно заработать, чтобы отыграть просадку ddPct
  function recoveryNeeded(ddPct) { if (ddPct >= 100) return Infinity; return (1 / (1 - ddPct / 100) - 1) * 100; }

  // Максимальная просадка ряда значений капитала: от пика до последующего минимума
  function maxDrawdown(series) {
    var peak = -Infinity, peakI = 0, best = { pct: 0, abs: 0, peak: 0, trough: 0 };
    for (var i = 0; i < series.length; i++) {
      var v = series[i];
      if (v > peak) { peak = v; peakI = i; }
      var dd = peak > 0 ? (peak - v) / peak * 100 : 0;
      if (dd > best.pct) best = { pct: dd, abs: peak - v, peak: peakI, trough: i };
    }
    return best;
  }

  var api = { positionSize: positionSize, tradeResult: tradeResult, riskReward: riskReward, breakevenWinRate: breakevenWinRate,
    expectancyR: expectancyR, liquidationPrice: liquidationPrice, recoveryNeeded: recoveryNeeded, maxDrawdown: maxDrawdown };
  CA.risk = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
