/*
 * Общая часть заданий: построение графика по описанию, рамка задания, генераторы расчётных задач.
 * Задание — функция (spec, api) → HTMLElement. api.pass() отмечает задание выполненным.
 */
(function (g) {
  "use strict";
  var CA = g.CA;
  var h = CA.dom.h;

  var OVERLAYS = {
    sma20: { fn: "sma", p: 20, color: "#f0b429", label: "SMA20" },
    sma50: { fn: "sma", p: 50, color: "#b388ff", label: "SMA50" },
    sma200: { fn: "sma", p: 200, color: "#e6e9ed", label: "SMA200" },
    ema9: { fn: "ema", p: 9, color: "#4dd0e1", label: "EMA9" },
    ema20: { fn: "ema", p: 20, color: "#3d8bff", label: "EMA20" },
    ema21: { fn: "ema", p: 21, color: "#3d8bff", label: "EMA21" },
    ema50: { fn: "ema", p: 50, color: "#ff8a65", label: "EMA50" }
  };

  function newSeed() { return Math.floor(Math.random() * 1e9); }

  function data(spec, seed) {
    seed = seed == null ? (spec.seed == null ? 1 : spec.seed) : seed;
    if (spec.walk) {
      var c = CA.market.randomWalk({ n: spec.walk, seed: "w" + seed, start: spec.price || 100, vol: spec.vol, tf: spec.tf });
      return { candles: c, meta: { synthetic: true, seed: seed } };
    }
    return CA.market.scenario(spec.scenario || "uptrend", seed, { price: spec.price || 100, tf: spec.tf, vol: spec.vol });
  }

  function overlays(names, candles) {
    var cl = candles.map(function (c) { return c.c; }), ov = [], bands = [];
    (names || []).forEach(function (n) {
      if (n === "bb") { var b = CA.indicators.bollinger(cl, 20, 2); bands.push({ upper: b.upper, lower: b.lower, mid: b.mid, color: "#5d6f8a", midColor: "#8b939e" }); return; }
      var d = OVERLAYS[n]; if (!d) return;
      ov.push({ values: CA.indicators[d.fn](cl, d.p), color: d.color, label: d.label });
    });
    return { overlays: ov, bands: bands };
  }

  // Подписи HH/HL/LH/LL к точкам разворота
  function pivotMarkers(meta, candles) {
    var piv = (meta.pivots || []).slice(1, -1), out = [], lastH = null, lastL = null;
    piv.forEach(function (p) {
      var c = candles[p.i]; if (!c) return;
      var isHigh = Math.abs(c.h - p.p) < Math.abs(c.l - p.p);
      var label;
      if (isHigh) { label = lastH == null ? "H" : p.p > lastH ? "HH" : "LH"; lastH = p.p; }
      else { label = lastL == null ? "L" : p.p > lastL ? "HL" : "LL"; lastL = p.p; }
      out.push({ i: p.i, price: p.p, kind: "dot", text: label, textBelow: !isHigh, color: isHigh ? "#26a69a" : "#ef5350" });
    });
    return out;
  }

  function metaLevels(meta) {
    return (meta.levels || []).map(function (l) {
      return { price: l.price, color: l.type === "support" ? "#26a69a" : "#ef5350", label: l.type === "support" ? "Поддержка" : "Сопротивление" };
    });
  }

  function mount(el, spec, extra) {
    var d = data(spec, extra && extra.seed);
    var ov = overlays(spec.overlays, d.candles);
    var opts = Object.assign({
      candles: d.candles, height: spec.height || 300, panes: spec.panes || ["volume"], overlays: ov.overlays, bands: ov.bands,
      levels: spec.levels === "meta" ? metaLevels(d.meta) : (spec.levels || []),
      markers: spec.pivots ? pivotMarkers(d.meta, d.candles) : [], tf: spec.tf || 60,
      title: spec.title || "SYN/USDT", dataLabel: CA.market.DATA_LABEL, pan: spec.pan !== false, visible: spec.visible
    }, extra || {});
    if (spec.cut === "meta" && d.meta.cut) opts.limit = d.meta.cut;
    if (spec.cut === "breakout" && d.meta.breakoutIndex) opts.limit = d.meta.breakoutIndex - 2;
    if (spec.cut === "falsebreak" && d.meta.falseBreakIndex) opts.limit = d.meta.falseBreakIndex + 1;
    if (typeof spec.cut === "number") opts.limit = spec.cut;
    if (spec.vlines === "breakout" && d.meta.breakoutIndex) opts.vlines = [{ i: d.meta.breakoutIndex, label: "пробой" }];
    if (spec.vlines === "falsebreak" && d.meta.falseBreakIndex) opts.vlines = [{ i: d.meta.falseBreakIndex, label: "ложный пробой" }];
    var chart = CA.Chart(el, opts);
    return { chart: chart, data: d, opts: opts };
  }

  CA.chartSpec = { data: data, overlays: overlays, mount: mount, pivotMarkers: pivotMarkers, metaLevels: metaLevels, newSeed: newSeed, OVERLAYS: OVERLAYS };

  // ───── Разбор числа из поля ввода ─────
  function parseNum(s) {
    if (typeof s === "number") return s;
    s = String(s || "").replace(/\s/g, "").replace(/[%$]|usdt/gi, "").replace(",", ".");
    if (!/^-?\d*\.?\d+$/.test(s)) return NaN;
    return parseFloat(s);
  }
  CA.parseNum = parseNum;

  // ───── Генераторы расчётных задач ─────
  var fmt = function (n, d) { return CA.dom.fmt(n, d == null ? 2 : d); };
  var GEN = {
    position: function (R) {
      var bal = R.pick([1000, 2000, 5000, 10000, 20000]), risk = R.pick([0.5, 1, 1.5, 2]);
      var entry = R.pick([20, 40, 80, 150, 250, 2500, 30000]), stopPct = R.pick([2, 2.5, 4, 5, 8]);
      var stop = CA.market.round(entry * (1 - stopPct / 100));
      var ans = bal * risk / 100 / (entry - stop);
      return { text: "Депозит <b>" + fmt(bal, 0) + " USDT</b>, риск на сделку <b>" + fmt(risk, 1) + "%</b>. Покупка по <b>" + fmt(entry, 2) + "</b>, стоп — <b>" + fmt(stop, 2) + "</b>. Сколько монет купить? (комиссии не учитывайте)", answer: ans, rel: 0.02, unit: "монет",
        explain: "Риск в деньгах: " + fmt(bal, 0) + " × " + fmt(risk, 1) + "% = " + fmt(bal * risk / 100) + " USDT. Расстояние до стопа: " + fmt(entry - stop) + ". Размер: " + fmt(bal * risk / 100) + " ÷ " + fmt(entry - stop) + " = <b>" + fmt(ans, 4) + "</b> монет (≈ " + fmt(ans * entry) + " USDT)." };
    },
    riskAmount: function (R) {
      var bal = R.pick([800, 1500, 3000, 7000, 12000]), risk = R.pick([0.5, 1, 2]);
      return { text: "Депозит <b>" + fmt(bal, 0) + " USDT</b>. Вы рискуете <b>" + fmt(risk, 1) + "%</b> на сделку. Какой максимальный убыток в USDT допустим в одной сделке?", answer: bal * risk / 100, rel: 0.01, unit: "USDT", explain: fmt(bal, 0) + " × " + fmt(risk, 1) + " / 100 = <b>" + fmt(bal * risk / 100) + " USDT</b>." };
    },
    rr: function (R) {
      var e = R.pick([50, 100, 200, 400]), sp = R.pick([2, 3, 4, 5]), k = R.pick([1.5, 2, 2.5, 3]);
      var sl = e * (1 - sp / 100), tp = e + (e - sl) * k;
      return { text: "Вход <b>" + fmt(e) + "</b>, Stop Loss <b>" + fmt(sl) + "</b>, Take Profit <b>" + fmt(tp) + "</b>. Чему равно соотношение прибыль/риск (R:R)? Введите число, например 2 для 1:2.", answer: k, abs: 0.05, unit: "",
        explain: "Риск = " + fmt(e) + " − " + fmt(sl) + " = " + fmt(e - sl) + ". Потенциал = " + fmt(tp) + " − " + fmt(e) + " = " + fmt(tp - e) + ". R:R = " + fmt(tp - e) + " / " + fmt(e - sl) + " = <b>" + fmt(k, 2) + "</b>." };
    },
    breakeven: function (R) {
      var k = R.pick([1, 1.5, 2, 3, 4]);
      return { text: "Система торгует с R:R = <b>1:" + fmt(k, 1) + "</b>. Какой минимальный процент прибыльных сделок нужен, чтобы выйти в ноль (без комиссий)?", answer: 100 / (1 + k), abs: 1, unit: "%",
        explain: "Безубыточная доля прибыльных сделок = 1 / (1 + R:R) = 1 / " + fmt(1 + k, 1) + " = <b>" + fmt(100 / (1 + k), 1) + "%</b>." };
    },
    fees: function (R) {
      var amt = R.pick([500, 1000, 2000, 5000]), fee = R.pick([0.1, 0.075, 0.2]), gain = R.pick([1, 2, 3, 5]);
      var exitVal = amt * (1 + gain / 100), fees = amt * fee / 100 + exitVal * fee / 100, net = amt * gain / 100 - fees;
      return { text: "Вы купили монеты на <b>" + fmt(amt, 0) + " USDT</b> и продали, когда цена выросла на <b>" + gain + "%</b>. Комиссия биржи <b>" + fee + "%</b> на вход и на выход. Какова чистая прибыль в USDT?", answer: net, abs: 0.05, unit: "USDT",
        explain: "Валовая прибыль: " + fmt(amt * gain / 100) + ". Комиссия входа: " + fmt(amt * fee / 100) + ", выхода: " + fmt(exitVal * fee / 100) + ". Чистая прибыль: <b>" + fmt(net) + " USDT</b>." };
    },
    pnl: function (R) {
      var qty = R.pick([0.5, 2, 5, 10, 25]), e = R.pick([40, 120, 300, 1800]), ch = R.pick([-8, -5, -3, 4, 6, 10]);
      var x = e * (1 + ch / 100);
      return { text: "Куплено <b>" + qty + "</b> монет по <b>" + fmt(e) + "</b>. Продано по <b>" + fmt(x) + "</b>. Каков результат сделки в USDT (без комиссий)? Убыток вводите со знаком минус.", answer: (x - e) * qty, abs: 0.05, unit: "USDT",
        explain: "(" + fmt(x) + " − " + fmt(e) + ") × " + qty + " = <b>" + fmt((x - e) * qty) + " USDT</b>." };
    },
    recovery: function (R) {
      var dd = R.pick([10, 20, 25, 40, 50, 60]);
      var ans = (1 / (1 - dd / 100) - 1) * 100;
      return { text: "Счёт упал на <b>" + dd + "%</b>. На сколько процентов он должен вырасти, чтобы вернуться к исходной сумме?", answer: ans, abs: 0.6, unit: "%",
        explain: "Нужный рост = 1 / (1 − " + dd / 100 + ") − 1 = <b>" + fmt(ans, 1) + "%</b>. Чем глубже просадка, тем непропорционально труднее её отыграть." };
    },
    liquidation: function (R) {
      var e = R.pick([100, 2000, 30000]), lev = R.pick([2, 5, 10, 20, 25]);
      var ans = e * (1 - 1 / lev);
      return { text: "Long с плечом <b>×" + lev + "</b> по цене <b>" + fmt(e, 0) + "</b>, изолированная маржа. Примерно при какой цене позиция будет ликвидирована? (поддерживающую маржу и комиссии не учитывайте)", answer: ans, rel: 0.01, unit: "",
        explain: "При плече ×" + lev + " маржа составляет 1/" + lev + " = " + fmt(100 / lev, 1) + "% от позиции. Падение на эту величину съедает залог: " + fmt(e, 0) + " × (1 − 1/" + lev + ") ≈ <b>" + fmt(ans) + "</b>. На практике ликвидация наступает ещё раньше." };
    },
    marketcap: function (R) {
      var p = R.pick([0.5, 2, 15, 120]), s = R.pick([100, 400, 2000]);
      return { text: "Цена токена <b>" + fmt(p) + " USDT</b>, в обращении <b>" + s + " млн</b> токенов. Какова рыночная капитализация в млн USDT?", answer: p * s, rel: 0.01, unit: "млн",
        explain: fmt(p) + " × " + s + " млн = <b>" + fmt(p * s, 0) + " млн USDT</b>." };
    },
    spread: function (R) {
      var bid = R.pick([99.8, 1999, 0.452, 30010]), k = R.pick([0.001, 0.002, 0.005]);
      var ask = CA.market.round(bid * (1 + k));
      var ans = (ask - bid) / ask * 100;
      return { text: "Лучшая цена покупки в стакане (bid) <b>" + bid + "</b>, лучшая цена продажи (ask) <b>" + ask + "</b>. Чему равен спред в процентах от цены ask?", answer: ans, abs: 0.02, unit: "%",
        explain: "(" + ask + " − " + bid + ") / " + ask + " × 100 = <b>" + fmt(ans, 3) + "%</b>." };
    },
    tradeR: function (R) {
      var e = R.pick([100, 50, 250]), sp = R.pick([2, 4, 5]), sl = e * (1 - sp / 100), mult = R.pick([-1, 1.5, 2.2, 0.5, -0.4]);
      var x = e + (e - sl) * mult;
      return { text: "Вход <b>" + fmt(e) + "</b>, стоп <b>" + fmt(sl) + "</b>. Позиция закрыта по <b>" + fmt(x) + "</b>. Каков результат в R (в единицах риска)?", answer: mult, abs: 0.05, unit: "R",
        explain: "1R = " + fmt(e - sl) + ". Результат: (" + fmt(x) + " − " + fmt(e) + ") / " + fmt(e - sl) + " = <b>" + fmt(mult, 2) + "R</b>." };
    }
  };
  CA.calcGen = GEN;

  // ───── Рамка задания ─────
  var KINDS = {
    "candle-build": "Конструктор свечи", "candle-pick": "Выбери свечу", "trend-id": "Определи тренд", "level-mark": "Разметка уровней",
    "point-pick": "Анализ графика", "risk-zone": "Где риск", "plan": "План сделки", "calc": "Расчёт", "scenario": "Ситуация на рынке",
    "sort": "Порядок действий", "classify": "Классификация", "chart-read": "Чтение индикатора", "journal": "Торговый журнал",
    "plan-form": "Торговый план", "backtest": "Проверка стратегии"
  };

  function renderTask(spec, ctx) {
    ctx = ctx || {};
    var done = !!ctx.passed;
    var status = h("span", { class: "task__status" + (done ? " is-ok" : "") }, done ? "✓ Выполнено" : "Не выполнено");
    var box = h("div", { class: "task" + (done ? " is-done" : ""), id: "task-" + spec.id },
      h("div", { class: "task__head" },
        h("div", null, h("div", { class: "task__kind" }, KINDS[spec.type] || "Задание"), h("h3", { class: "task__title" }, spec.title || "")),
        status));
    var api = {
      pass: function () {
        if (!done) { done = true; box.classList.add("is-done"); status.textContent = "✓ Выполнено"; status.classList.add("is-ok"); if (ctx.onPass) ctx.onPass(spec.id); }
      },
      passed: function () { return done; }
    };
    var impl = CA.tasks[spec.type];
    if (!impl) { box.appendChild(h("p", { class: "muted" }, "Неизвестный тип задания: " + spec.type)); return box; }
    if (spec.prompt) box.appendChild(h("div", { class: "task__prompt", html: spec.prompt }));
    try { box.appendChild(impl(spec, api)); }
    catch (e) { console.error(e); box.appendChild(h("p", { class: "down" }, "Не удалось загрузить задание.")); }
    return box;
  }

  function feedback(el, ok, html) {
    el.className = "task__feedback " + (ok === true ? "is-ok" : ok === false ? "is-bad" : "");
    el.innerHTML = html;
    el.hidden = false;
  }

  CA.renderTask = renderTask;
  CA.taskFeedback = feedback;
  CA.TASK_KINDS = KINDS;
})(typeof globalThis !== "undefined" ? globalThis : this);
