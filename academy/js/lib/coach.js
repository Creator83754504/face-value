/*
 * «Тренер» симулятора: разбирает закрытую сделку и указывает на возможные ошибки.
 * Важно: оценивается процесс принятия решения, а не только результат. Прибыльная сделка
 * может быть плохим решением, убыточная — хорошим.
 */
(function (g) {
  "use strict";
  var CA = g.CA || (g.CA = {});
  if (typeof require === "function") { if (!CA.indicators) require("./indicators.js"); }

  function pct(a, b) { return (a - b) / b * 100; }

  /*
   * trade — закрытая сделка из движка; ctx = { candles (история актива), allClosed (все закрытые сделки) }
   */
  function review(trade, ctx) {
    var out = [], c = ctx.candles, i = trade.openI;
    var hist = c.slice(Math.max(0, i - 60), i + 1);
    var closes = hist.map(function (x) { return x.c; });
    var IND = CA.indicators;
    var eqOpen = trade.equityAtOpen || trade.cost;

    // 1. Стоп-лосс
    if (!trade.hadStop) {
      out.push({ kind: "bad", title: "Сделка без Stop Loss", text: "Вы не задали заранее, где признаёте ошибку. Без стопа один неудачный вход может обнулить результат десятков сделок. Определите точку выхода до входа в позицию." });
    } else {
      var riskPct = trade.qty * Math.abs(trade.entry - (trade.initialSl || trade.sl || trade.entry)) / eqOpen * 100;
      if (trade.initialSl != null || trade.sl != null) {
        if (riskPct > 2.05) out.push({ kind: "warn", title: "Риск " + riskPct.toFixed(1) + "% от капитала", text: "Распространённое правило — рисковать не более 1–2% капитала в одной сделке. При риске " + riskPct.toFixed(1) + "% серия из нескольких убытков подряд даёт глубокую просадку." });
        else out.push({ kind: "good", title: "Риск под контролем: " + riskPct.toFixed(1) + "% капитала", text: "Стоп был задан, и потенциальный убыток укладывался в разумный лимит." });
      }
    }

    // 2. Размер позиции без стопа
    var share = trade.cost / eqOpen * 100;
    if (!trade.hadStop && share > 50) out.push({ kind: "bad", title: "Почти весь депозит в одной позиции", text: "В позицию ушло " + share.toFixed(0) + "% капитала без стопа. Это не управление риском, а ставка." });

    // 3. R:R
    var sl0 = trade.initialSl != null ? trade.initialSl : trade.sl, tp0 = trade.initialTp != null ? trade.initialTp : trade.tp;
    if (sl0 != null && tp0 != null) {
      var rr = (tp0 - trade.entry) / (trade.entry - sl0);
      if (rr < 1) out.push({ kind: "warn", title: "Соотношение прибыль/риск " + rr.toFixed(2), text: "Потенциальная прибыль меньше риска. Чтобы быть в плюсе при таком R:R, нужно ошибаться очень редко — с учётом комиссий доля прибыльных сделок должна быть выше " + (100 / (1 + rr)).toFixed(0) + "%." });
      else if (rr >= 2) out.push({ kind: "good", title: "R:R " + rr.toFixed(1) + " : 1", text: "Потенциальная прибыль минимум вдвое больше риска — даже при 40% прибыльных сделок система может оставаться безубыточной (без учёта комиссий)." });
    }

    // 4. FOMO: вход после резкого роста
    if (hist.length > 8) {
      var atr = IND.atr(hist, 14), a = atr[atr.length - 1];
      var run = trade.entry - hist[hist.length - 6].c;
      if (a && run > a * 4) out.push({ kind: "warn", title: "Вход после резкого роста (риск FOMO)", text: "За 5 свечей до входа цена выросла на " + pct(trade.entry, hist[hist.length - 6].c).toFixed(1) + "% — это более 4 средних диапазонов свечи (ATR). Покупка «вдогонку» часто происходит из страха упустить движение: стоп получается далеко, а откат вероятен." });
    }

    // 5. Против тренда
    if (closes.length >= 50) {
      var s50 = IND.sma(closes, 50), last = s50[s50.length - 1], prev = s50[s50.length - 11];
      if (last && prev && closes[closes.length - 1] < last && last < prev) out.push({ kind: "warn", title: "Покупка против нисходящего тренда", text: "Цена была ниже 50-периодной средней, а средняя снижалась. Покупать в нисходящем тренде можно, но это более рискованная идея: нужен чёткий сценарий и короткий стоп." });
      if (last && prev && closes[closes.length - 1] > last && last > prev) out.push({ kind: "good", title: "Вход по направлению тренда", text: "Цена выше растущей 50-периодной средней — покупка совпадала с текущим направлением рынка." });
    }

    // 6. RSI
    if (closes.length > 20) {
      var r = IND.rsi(closes, 14), rv = r[r.length - 1];
      if (rv > 75) out.push({ kind: "info", title: "RSI при входе: " + rv.toFixed(0), text: "Высокий RSI сам по себе не сигнал к продаже, но покупка на таком уровне означает, что цена уже сильно ушла вверх за короткое время. Стоит заранее понимать, где вы ошиблись." });
    }

    // 7. Месть рынку: новая сделка сразу после убыточной
    var prevTrades = (ctx.allClosed || []).filter(function (t) { return t.id !== trade.id && t.closeI <= trade.openI; });
    var lastLoss = prevTrades.filter(function (t) { return t.pnl < 0; }).sort(function (x, y) { return y.closeI - x.closeI; })[0];
    if (lastLoss && trade.openI - lastLoss.closeI <= 2) out.push({ kind: "warn", title: "Вход сразу после убытка", text: "Сделка открыта через " + (trade.openI - lastLoss.closeI) + " св. после убыточной. Желание быстро «отыграться» — одна из главных причин серий убытков. Сделайте паузу и проверьте, есть ли сетап по вашему плану." });

    // 8. Овертрейдинг
    var recent = prevTrades.filter(function (t) { return trade.openI - t.openI <= 20; });
    if (recent.length >= 5) out.push({ kind: "warn", title: "Слишком частые сделки", text: "За последние 20 свечей у вас уже " + recent.length + " сделок. Частая торговля увеличивает комиссии и число импульсивных решений." });

    // 9. Комиссии
    var fees = trade.feeIn + trade.feeOut;
    if (trade.pnl > 0 && fees > trade.pnl * 0.5) out.push({ kind: "info", title: "Комиссии съели заметную часть прибыли", text: "Комиссии (" + fees.toFixed(2) + " USDT) составили более половины чистой прибыли. На коротких движениях издержки особенно заметны." });

    // 10. Выход
    if (trade.reason === "manual" && trade.pnl < 0 && sl0 != null && trade.exit > sl0) out.push({ kind: "info", title: "Ручной выход до стопа", text: "Вы закрыли убыточную сделку раньше стопа. Это нормально, если изменились условия по вашему плану. Если же решение было эмоциональным — запишите это в журнал." });
    if (trade.reason === "manual" && trade.pnl > 0 && tp0 != null && trade.exit < tp0 && (trade.closeI - trade.openI) <= 2) out.push({ kind: "info", title: "Быстрая фиксация прибыли", text: "Прибыль зафиксирована почти сразу, задолго до цели. Если так закрывать прибыльные сделки, а убыточные держать до стопа, средний убыток станет больше средней прибыли." });

    // Итог: результат ≠ качество решения
    var bad = out.filter(function (x) { return x.kind === "bad"; }).length, warn = out.filter(function (x) { return x.kind === "warn"; }).length;
    var verdict;
    if (trade.pnl > 0 && (bad || warn)) verdict = "Сделка прибыльная, но в решении были риски. Прибыль в этот раз — не доказательство правильности подхода: повторяйте только то, что соответствует вашему плану.";
    else if (trade.pnl <= 0 && !bad && !warn) verdict = "Сделка убыточная, но решение выглядит дисциплинированным. Убытки — нормальная часть торговли: важно, чтобы они были ограничены заранее.";
    else if (trade.pnl > 0) verdict = "Сделка прибыльная и выполнена дисциплинированно. Помните: одна сделка ничего не доказывает — оценивайте серию из десятков сделок.";
    else verdict = "Сделка убыточная, и в решении были ошибки. Разберите их в журнале — это самый ценный материал для обучения.";
    return { items: out, verdict: verdict, score: Math.max(0, 100 - bad * 35 - warn * 15) };
  }

  var api = { review: review };
  CA.coach = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
