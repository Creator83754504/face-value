/* Интерактивные виджеты уроков и раздела «Инструменты» (без оценки). */
(function (g) {
  "use strict";
  var CA = g.CA;
  var h = CA.dom.h, fmt = CA.dom.fmt, fmtP = CA.dom.fmtPrice;
  var W = CA.widgets = {};

  function stat(label, value, cls, sub) {
    return h("div", { class: "stat" }, h("div", { class: "stat__label" }, label), h("div", { class: "stat__value " + (cls || "") }, value), sub ? h("div", { class: "stat__sub" }, sub) : null);
  }
  function numInput(label, value, onInput, opts) {
    opts = opts || {};
    var inp = h("input", { class: "input num", inputmode: "decimal", value: value, "aria-label": label, oninput: onInput });
    return { el: h("label", { class: "field" }, h("span", null, label), inp), input: inp, get: function () { return CA.parseNum(inp.value); } };
  }

  // ───── Как формируется свеча: тики внутри одного часа ─────
  W["candle-live"] = function () {
    var wrap = h("div", { class: "card card--flat" });
    var R, ticks, k, timer = null;
    var svgBox = h("div", { style: { flex: "1 1 260px" } }), info = h("div", { class: "stats stats--compact", style: { flex: "1 1 220px" } });
    function reset() {
      stop(); R = CA.rng.create(CA.chartSpec.newSeed()); ticks = [100]; k = 0;
      var drift = R.range(-0.08, 0.08);
      for (var i = 1; i <= 60; i++) ticks.push(ticks[i - 1] + drift + R.normal() * 0.45);
      draw();
    }
    function draw() {
      var part = ticks.slice(0, k + 1), o = part[0], c = part[part.length - 1], hi = Math.max.apply(null, part), lo = Math.min.apply(null, part);
      var all = ticks, mn = Math.min.apply(null, all) - 0.5, mx = Math.max.apply(null, all) + 0.5;
      var y = function (v) { return 12 + (mx - v) / (mx - mn) * 196; };
      var path = part.map(function (v, i) { return (i ? "L" : "M") + (10 + i * 3.4) + " " + y(v); }).join(" ");
      var body = '<line x1="225" x2="225" y1="0" y2="220" stroke="#262d36"/>' +
        '<path d="' + path + '" fill="none" stroke="#8b939e" stroke-width="1.5"/>' +
        '<circle cx="' + (10 + k * 3.4) + '" cy="' + y(c) + '" r="3.5" fill="#f0b429"/>' +
        '<line x1="10" x2="300" y1="' + y(o) + '" y2="' + y(o) + '" stroke="#3d8bff" stroke-dasharray="3 3"/>' +
        CA.figures.candleAt(265, 30, o, hi, lo, c, y) +
        '<text x="10" y="216" fill="#5d6672" font-size="10">тики внутри часа →</text><text x="265" y="216" fill="#5d6672" font-size="10" text-anchor="middle">свеча</text>';
      svgBox.innerHTML = CA.figures.svg(310, 222, body, "Формирование свечи из сделок");
      info.innerHTML = "";
      [["Open", o], ["High", hi], ["Low", lo], ["Close", c]].forEach(function (p) { info.appendChild(stat(p[0], fmt(p[1], 2))); });
      info.appendChild(stat("Минута", k + " / 60", "", k < 60 ? "свеча ещё формируется" : "свеча закрыта"));
    }
    function stop() { if (timer) clearInterval(timer); timer = null; play.textContent = "▶ Запустить"; }
    var play = h("button", { class: "btn btn--primary btn--sm", onclick: function () {
      if (timer) { stop(); return; }
      if (k >= 60) { k = 0; }
      play.textContent = "❚❚ Пауза";
      timer = setInterval(function () { k++; draw(); if (k >= 60) stop(); }, 90);
    } }, "▶ Запустить");
    wrap.appendChild(h("div", { class: "card__head" }, h("h3", null, "Тренажёр: как рождается свеча"), h("div", { class: "btn-row" }, play, h("button", { class: "btn btn--sm", onclick: reset }, "Новый час"))));
    wrap.appendChild(h("p", { class: "small muted" }, "Слева — цена каждой сделки в течение часа, справа — свеча, которая из них складывается. Open — первая цена, Close — последняя, High и Low — крайние значения за период. Пока час не закончился, свеча может полностью поменять вид."));
    wrap.appendChild(h("div", { style: { display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" } }, svgBox, info));
    reset();
    return wrap;
  };

  // ───── Один рынок — разные таймфреймы ─────
  W["tf-switch"] = function () {
    var wrap = h("div", { class: "card card--flat" }), holder = h("div");
    var base = CA.market.randomWalk({ n: 1536, seed: "tf-demo", start: 100, tf: 15, vol: 0.0035 });
    var tfs = [["15m", 1, 15], ["1h", 4, 60], ["4h", 16, 240], ["1D", 96, 1440]];
    var seg = h("div", { class: "seg" }), chart, caption = h("p", { class: "small muted" });
    function set(k) {
      var t = tfs[k], data = t[1] === 1 ? base.slice(-160) : CA.market.aggregate(base, t[1]).slice(-160);
      Array.from(seg.children).forEach(function (b, i) { b.classList.toggle("is-active", i === k); });
      if (!chart) chart = CA.Chart(holder, { candles: data, tf: t[2], height: 280, title: "SYN/USDT · " + t[0], visible: 120 });
      else chart.update({ candles: data, tf: t[2], title: "SYN/USDT · " + t[0] });
      caption.textContent = "Показано " + data.length + " свечей " + t[0] + " ≈ " + (t[2] * data.length / 1440).toFixed(1) + " суток. " + (k === 0 ? "Видно много шума и мелких колебаний." : k === 3 ? "Видна общая картина, мелкие колебания скрыты внутри свечей." : "");
    }
    tfs.forEach(function (t, i) { seg.appendChild(h("button", { type: "button", onclick: function () { set(i); } }, t[0])); });
    wrap.appendChild(h("div", { class: "card__head" }, h("h3", null, "Один график — четыре таймфрейма"), seg));
    wrap.appendChild(holder); wrap.appendChild(caption);
    setTimeout(function () { set(1); }, 0);
    return wrap;
  };

  // ───── Стакан и проскальзывание ─────
  W["orderbook-sim"] = function () {
    var wrap = h("div", { class: "card card--flat" });
    var asks = [[100.2, 0.8], [100.3, 3.5], [100.4, 1.2], [100.5, 4.8], [100.6, 2.1], [100.8, 6], [101.0, 9]];
    var qty = numInput("Купить по рынку, монет", "5", update);
    var table = h("div"), out = h("div", { class: "stats stats--compact", style: { marginTop: "12px" } });
    function update() {
      var q = qty.get(), left = q, cost = 0, rows = [];
      asks.forEach(function (a) {
        var take = isFinite(left) && left > 0 ? Math.min(left, a[1]) : 0;
        left -= take; cost += take * a[0];
        rows.push("<tr><td class='num down'>" + a[0].toFixed(1) + "</td><td class='num'>" + a[1].toFixed(1) + "</td><td class='num" + (take ? " warn" : "") + "'>" + (take ? take.toFixed(2) : "—") + "</td></tr>");
      });
      table.innerHTML = "<div class='table-wrap'><table class='table'><thead><tr><th class='num'>Цена (ask)</th><th class='num'>Доступно</th><th class='num'>Исполнено</th></tr></thead><tbody>" + rows.join("") + "</tbody></table></div>";
      out.innerHTML = "";
      if (!(q > 0)) { out.appendChild(stat("Средняя цена", "—")); return; }
      if (left > 1e-9) { out.appendChild(stat("Не хватает ликвидности", fmt(left, 2) + " монет", "down")); return; }
      var avg = cost / q, slip = (avg - asks[0][0]) / asks[0][0] * 100;
      out.appendChild(stat("Средняя цена исполнения", fmt(avg, 3)));
      out.appendChild(stat("Лучшая цена", "100,200"));
      out.appendChild(stat("Проскальзывание", fmt(slip, 3) + "%", slip > 0.15 ? "down" : ""));
      out.appendChild(stat("Потрачено", fmt(cost, 2) + " USDT"));
    }
    wrap.appendChild(h("h3", null, "Тренажёр: рыночный ордер «съедает» стакан"));
    wrap.appendChild(h("p", { class: "small muted" }, "Рыночная покупка исполняется по лучшим заявкам продавцов, начиная с самой дешёвой. Если объёма на лучшей цене не хватает, ордер забирает следующие, более дорогие уровни. Учебный стакан, данные условные."));
    wrap.appendChild(h("div", { style: { maxWidth: "260px" } }, qty.el));
    wrap.appendChild(table); wrap.appendChild(out);
    update();
    return wrap;
  };

  // ───── Калькулятор размера позиции и результата сделки ─────
  W["calc-position"] = function (opts) {
    opts = opts || {};
    var wrap = h("div", { class: "card" + (opts.flat === false ? "" : " card--flat") });
    var f = {
      bal: numInput("Депозит, USDT", "10000", update), risk: numInput("Риск на сделку, %", "1", update),
      entry: numInput("Цена входа", "100", update), stop: numInput("Stop Loss", "96", update),
      target: numInput("Take Profit (необязательно)", "112", update), fee: numInput("Комиссия, % за сделку", "0.1", update)
    };
    var out = h("div", { class: "stats stats--compact", style: { marginTop: "14px" } }), warn = h("div");
    var counted = false;
    function update() {
      out.innerHTML = ""; warn.innerHTML = "";
      var r = CA.risk.positionSize({ balance: f.bal.get(), riskPct: f.risk.get(), entry: f.entry.get(), stop: f.stop.get(), feePct: f.fee.get() || 0 });
      if (!r.ok) { warn.appendChild(h("p", { class: "down small" }, r.error)); return; }
      if (!counted && CA.app && CA.app.store && opts.track !== false) { counted = true; CA.app.store.count("calc"); }
      out.appendChild(stat("Направление", r.side === "long" ? "Покупка (long)" : "Продажа (short)", r.side === "long" ? "up" : "down"));
      out.appendChild(stat("Риск в деньгах", fmt(r.riskAmount) + " USDT"));
      out.appendChild(stat("Размер позиции", fmt(r.qty, 4) + " монет", "", "≈ " + fmt(r.notional) + " USDT (" + fmt(r.notionalPct, 1) + "% депозита)"));
      out.appendChild(stat("Расстояние до стопа", fmt(r.stopPct, 2) + "%"));
      var t = f.target.get();
      if (isFinite(t) && t > 0) {
        var rr = CA.risk.riskReward(f.entry.get(), f.stop.get(), t);
        if (rr && rr.valid) {
          var res = CA.risk.tradeResult({ side: r.side, entry: f.entry.get(), exit: t, qty: r.qty, feePct: f.fee.get() || 0 });
          out.appendChild(stat("R:R", "1 : " + fmt(rr.ratio, 2), rr.ratio >= 2 ? "up" : rr.ratio < 1 ? "down" : ""));
          out.appendChild(stat("Результат при цели", CA.dom.signed(res.net) + " USDT", "up", "комиссии " + fmt(res.fees) + " USDT"));
          out.appendChild(stat("Результат при стопе", "−" + fmt(r.riskAmount) + " USDT", "down", "уже с комиссиями"));
          out.appendChild(stat("Безубыточный винрейт", fmt(CA.risk.breakevenWinRate(rr.ratio), 1) + "%", "", "доля прибыльных сделок для выхода в ноль"));
        } else warn.appendChild(h("p", { class: "warn small" }, "Цель должна быть по другую сторону от входа, чем стоп."));
      }
      if (r.notionalPct > 100) warn.appendChild(h("div", { class: "callout callout--risk" }, h("div", { class: "callout__title" }, "Позиция больше депозита"), h("p", null, "При таком близком стопе для риска " + fmt(f.risk.get(), 1) + "% нужна позиция " + fmt(r.notionalPct, 0) + "% депозита — на споте это невозможно без плеча. Уменьшите риск или поставьте стоп логичнее; не берите плечо только ради «правильного» размера.")));
      if (f.risk.get() > 2) warn.appendChild(h("div", { class: "callout callout--warn" }, h("div", { class: "callout__title" }, "Высокий риск на сделку"), h("p", null, "10 убыточных сделок подряд при риске " + fmt(f.risk.get(), 1) + "% дадут просадку около " + fmt((1 - Math.pow(1 - f.risk.get() / 100, 10)) * 100, 0) + "%. Серии убытков случаются даже у хороших систем.")));
    }
    wrap.appendChild(h("h3", null, "Калькулятор позиции и результата сделки"));
    wrap.appendChild(h("div", { class: "grid-3" }, f.bal.el, f.risk.el, f.fee.el, f.entry.el, f.stop.el, f.target.el));
    wrap.appendChild(out); wrap.appendChild(warn);
    update();
    return wrap;
  };

  // ───── Кредитное плечо и ликвидация ─────
  W["calc-liq"] = function () {
    var wrap = h("div", { class: "card card--flat" });
    var entry = numInput("Цена входа", "100", update), margin = numInput("Залог (маржа), USDT", "100", update);
    var lev = h("input", { type: "range", min: 1, max: 100, value: 10, "aria-label": "Плечо", oninput: update });
    var levOut = h("b", { class: "num" }, "×10");
    var side = h("div", { class: "seg" }), sideV = "long";
    [["long", "Long"], ["short", "Short"]].forEach(function (s) { side.appendChild(h("button", { type: "button", class: s[0] === "long" ? "is-active" : "", onclick: function (e) { sideV = s[0]; Array.from(side.children).forEach(function (b) { b.classList.toggle("is-active", b === e.currentTarget); }); update(); } }, s[1])); });
    var out = h("div", { class: "stats stats--compact", style: { marginTop: "12px" } });
    function update() {
      var L = +lev.value; levOut.textContent = "×" + L;
      out.innerHTML = "";
      var e = entry.get(), m = margin.get();
      if (!(e > 0 && m > 0)) return;
      var lp = CA.risk.liquidationPrice({ entry: e, leverage: L, side: sideV, mmr: 0.005 });
      var dist = Math.abs(lp - e) / e * 100;
      out.appendChild(stat("Размер позиции", fmt(m * L) + " USDT"));
      out.appendChild(stat("Цена ликвидации ≈", L === 1 && sideV === "long" ? "≈ 0" : fmtP(lp), "down"));
      out.appendChild(stat("Движение до ликвидации", L === 1 && sideV === "long" ? "−100%" : (sideV === "long" ? "−" : "+") + fmt(dist, 2) + "%", dist < 5 ? "down" : ""));
      out.appendChild(stat("Изменение цены на 1%", "≈ " + fmt(L, 0) + "% залога", L >= 10 ? "down" : ""));
    }
    wrap.appendChild(h("h3", null, "Калькулятор: плечо и ликвидация (учебная модель)"));
    wrap.appendChild(h("div", { class: "grid-3" }, entry.el, margin.el, h("div", { class: "field" }, h("span", null, "Сторона"), side)));
    wrap.appendChild(h("label", { class: "field", style: { marginTop: "12px" } }, h("span", null, "Кредитное плечо"), h("div", { style: { display: "flex", gap: "12px", alignItems: "center" } }, lev, levOut)));
    wrap.appendChild(out);
    wrap.appendChild(h("p", { class: "small muted", style: { marginTop: "10px" } }, "Упрощённая формула для изолированной маржи с поддерживающей маржей 0,5%. На реальных биржах расчёт зависит от правил площадки, комиссий и ставки финансирования, и ликвидация обычно наступает раньше."));
    update();
    return wrap;
  };

  // ───── Просадка и серии убытков ─────
  W["calc-recovery"] = function () {
    var wrap = h("div", { class: "card card--flat" });
    var dd = h("input", { type: "range", min: 5, max: 90, step: 5, value: 30, "aria-label": "Просадка", oninput: update });
    var risk = numInput("Риск на сделку, %", "2", update), streak = numInput("Убытков подряд", "8", update);
    var out = h("div", { class: "stats stats--compact", style: { marginTop: "12px" } });
    function update() {
      out.innerHTML = "";
      var d = +dd.value;
      out.appendChild(stat("Просадка", "−" + d + "%", "down"));
      out.appendChild(stat("Нужно заработать, чтобы вернуться", "+" + fmt(CA.risk.recoveryNeeded(d), 1) + "%", "up"));
      var r = risk.get(), s = streak.get();
      if (r > 0 && s > 0 && r < 100) out.appendChild(stat("Серия из " + s + " убытков при риске " + fmt(r, 1) + "%", "−" + fmt((1 - Math.pow(1 - r / 100, s)) * 100, 1) + "%", "down", "сложный процент: каждый риск считается от текущего капитала"));
    }
    wrap.appendChild(h("h3", null, "Калькулятор: просадка и восстановление"));
    wrap.appendChild(h("label", { class: "field" }, h("span", null, "Глубина просадки"), dd));
    wrap.appendChild(h("div", { class: "grid-2" }, risk.el, streak.el));
    wrap.appendChild(out);
    update();
    return wrap;
  };

  // ───── Математическое ожидание и разброс результатов ─────
  W.expectancy = function () {
    var wrap = h("div", { class: "card card--flat" });
    var wr = numInput("Доля прибыльных сделок, %", "45", update), rr = numInput("Средний R:R", "2", update), n = numInput("Число сделок", "100", update);
    var out = h("div", { class: "stats stats--compact", style: { margin: "12px 0" } }), holder = h("div"), chart = null, seed = 1;
    function update() {
      out.innerHTML = "";
      var w = wr.get(), k = rr.get(), N = Math.min(500, Math.max(10, Math.round(n.get() || 100)));
      if (!(w >= 0 && w <= 100 && k > 0)) return;
      var e = CA.risk.expectancyR(w, k);
      out.appendChild(stat("Ожидание на сделку", CA.dom.signed(e, 2) + "R", e > 0 ? "up" : "down"));
      out.appendChild(stat("Безубыточный винрейт", fmt(CA.risk.breakevenWinRate(k), 1) + "%"));
      var series = [], colors = ["#3d8bff", "#b388ff", "#f0b429", "#4dd0e1", "#ff8a65"];
      for (var p = 0; p < 5; p++) {
        var R = CA.rng.create("exp" + seed + ":" + p), eq = 10000, vals = [eq];
        for (var i = 0; i < N; i++) { eq += eq * 0.01 * (R.next() < w / 100 ? k : -1); vals.push(eq); }
        series.push({ values: vals, color: colors[p], width: 1.4 });
      }
      if (!chart) chart = CA.LineChart(holder, { series: series, height: 200, baseline: 10000, ariaLabel: "Пять случайных серий сделок" });
      else chart.update({ series: series });
    }
    wrap.appendChild(h("div", { class: "card__head" }, h("h3", null, "Симуляция: одна и та же система — разные результаты"), h("button", { class: "btn btn--sm", onclick: function () { seed++; update(); } }, "Перемешать")));
    wrap.appendChild(h("p", { class: "small muted" }, "Пять случайных последовательностей сделок с одинаковыми параметрами (риск 1% на сделку). Это модель на случайных числах, а не статистика реальной стратегии: она показывает, насколько сильно результат зависит от удачи на коротком отрезке."));
    wrap.appendChild(h("div", { class: "grid-3" }, wr.el, rr.el, n.el));
    wrap.appendChild(out); wrap.appendChild(holder);
    setTimeout(update, 0);
    return wrap;
  };

  // ───── Лаборатория индикаторов ─────
  W["indicator-lab"] = function (opts) {
    opts = opts || {};
    var wrap = h("div", { class: "card card--flat" }), holder = h("div");
    var on = {}; (opts.initial || ["ema20", "sma50"]).forEach(function (k) { on[k] = true; });
    var panes = {}; (opts.panes || []).forEach(function (k) { panes[k] = true; });
    var seed = opts.seed || 11, chart, data;
    var toggles = h("div", { class: "btn-row" });
    var items = [["sma20", "SMA 20"], ["sma50", "SMA 50"], ["ema9", "EMA 9"], ["ema20", "EMA 20"], ["ema50", "EMA 50"], ["bb", "Bollinger"], ["rsi", "RSI"], ["macd", "MACD"]];
    function build() {
      data = CA.market.randomWalk({ n: 400, seed: "lab" + seed, start: 100 });
      render(true);
    }
    function render(refit) {
      var ov = CA.chartSpec.overlays(Object.keys(on).filter(function (k) { return on[k]; }), data);
      var p = ["volume"].concat(Object.keys(panes).filter(function (k) { return panes[k]; }));
      var patch = { candles: data, overlays: ov.overlays, bands: ov.bands, panes: p, height: 300 + (p.length - 1) * 84, refit: refit };
      if (!chart) chart = CA.Chart(holder, Object.assign({ visible: 160, title: "SYN/USDT 1h" }, patch));
      else chart.update(patch);
      Array.from(toggles.children).forEach(function (b) { var k = b.dataset.k; b.classList.toggle("btn--primary", !!(on[k] || panes[k])); });
    }
    items.forEach(function (it) {
      toggles.appendChild(h("button", { class: "btn btn--sm", dataset: { k: it[0] }, onclick: function () {
        if (it[0] === "rsi" || it[0] === "macd") panes[it[0]] = !panes[it[0]]; else on[it[0]] = !on[it[0]];
        render(false);
      } }, it[1]));
    });
    toggles.appendChild(h("button", { class: "btn btn--sm btn--ghost", onclick: function () { seed++; build(); } }, "↻ Другие данные"));
    wrap.appendChild(h("h3", null, opts.title || "Лаборатория индикаторов"));
    wrap.appendChild(h("p", { class: "small muted" }, "Включайте индикаторы и сравнивайте их с ценой. Перетаскивайте график, колесо мыши или щипок — масштаб. Обратите внимание, насколько индикаторы запаздывают и как часто дают противоречивые сигналы."));
    wrap.appendChild(toggles); wrap.appendChild(h("div", { style: { marginTop: "10px" } }, holder));
    setTimeout(build, 0);
    return wrap;
  };

  // ───── Лаборатория стратегий (бэктест) ─────
  var DATASETS = [
    { id: "a", seed: "bt-alpha", title: "Набор A (синтетика, 1h)" },
    { id: "b", seed: "bt-beta", title: "Набор B (синтетика, 1h)" },
    { id: "c", seed: "bt-gamma", title: "Набор C (синтетика, 1h, выше волатильность)", vol: 0.012 }
  ];
  W.lab = function (opts) {
    opts = opts || {};
    var wrap = h("div", { class: opts.compact ? "" : "stack" });
    var st = { entry: "ma-cross", fast: 10, slow: 30, rsiLevel: 30, lookback: 20, emaP: 20, trendP: 50, trendFilter: true, stopAtr: 2, rr: 2, riskPct: 1, data: "a" };
    var form = h("div", { class: "grid-3" });
    var entrySel = h("select", { class: "input", "aria-label": "Правило входа", onchange: function () { st.entry = entrySel.value; renderParams(); } },
      Object.keys(CA.backtest.ENTRIES).map(function (k) { return h("option", { value: k }, CA.backtest.ENTRIES[k].title); }));
    var dataSel = h("select", { class: "input", "aria-label": "Данные", onchange: function () { st.data = dataSel.value; } }, DATASETS.map(function (d) { return h("option", { value: d.id }, d.title); }));
    var params = h("div", { class: "grid-3", style: { marginTop: "12px" } });
    function pnum(label, key, step) {
      var inp = h("input", { class: "input num", type: "number", step: step || 1, value: st[key], "aria-label": label, oninput: function () { var v = parseFloat(inp.value); if (isFinite(v)) st[key] = v; } });
      return h("label", { class: "field" }, h("span", null, label), inp);
    }
    function renderParams() {
      params.innerHTML = "";
      if (st.entry === "ma-cross") { params.appendChild(pnum("Быстрая EMA", "fast")); params.appendChild(pnum("Медленная EMA", "slow")); }
      if (st.entry === "rsi-revert") params.appendChild(pnum("Уровень RSI", "rsiLevel"));
      if (st.entry === "breakout") params.appendChild(pnum("Свечей для максимума", "lookback"));
      if (st.entry === "pullback-ema") { params.appendChild(pnum("EMA отката", "emaP")); params.appendChild(pnum("SMA тренда", "trendP")); }
      params.appendChild(pnum("Стоп, × ATR", "stopAtr", 0.5));
      params.appendChild(pnum("Цель, R", "rr", 0.5));
      params.appendChild(pnum("Риск на сделку, %", "riskPct", 0.5));
    }
    var filter = h("input", { type: "checkbox", checked: true, onchange: function () { st.trendFilter = filter.checked; } });
    form.appendChild(h("label", { class: "field" }, h("span", null, "Правило входа"), entrySel));
    form.appendChild(h("label", { class: "field" }, h("span", null, "Исторические данные"), dataSel));
    form.appendChild(h("label", { class: "field" }, h("span", null, "Фильтр"), h("label", { class: "btn-row small", style: { minHeight: "38px" } }, filter, "Только когда цена выше SMA 100")));
    var results = h("div", { style: { marginTop: "14px" } });
    function run(part) {
      var ds = DATASETS.find(function (d) { return d.id === st.data; });
      var candles = CA.market.randomWalk({ n: 2400, seed: ds.seed, start: 100, vol: ds.vol });
      var split = Math.floor(candles.length * 0.6);
      var range = part === "train" ? { from: 0, to: split } : part === "test" ? { from: split, to: candles.length } : { from: 0, to: candles.length };
      var p = st.entry === "ma-cross" ? { fast: st.fast, slow: st.slow } : st.entry === "rsi-revert" ? { period: 14, level: st.rsiLevel } : st.entry === "breakout" ? { lookback: st.lookback } : { ema: st.emaP, trend: st.trendP };
      if (st.entry === "ma-cross" && !(st.fast < st.slow)) { results.innerHTML = "<p class='down small'>Быстрая средняя должна иметь меньший период, чем медленная.</p>"; return; }
      if (!(st.stopAtr > 0 && st.rr > 0 && st.riskPct > 0 && st.riskPct <= 5)) { results.innerHTML = "<p class='down small'>Проверьте стоп, цель и риск (риск — от 0,1 до 5%).</p>"; return; }
      var r = CA.backtest.run(candles, { entry: st.entry, params: p, trendFilter: st.trendFilter, stopAtr: st.stopAtr, rr: st.rr, riskPct: st.riskPct }, range);
      results.innerHTML = "";
      var s = r.stats;
      results.appendChild(h("div", { class: "card__head" }, h("h3", null, "Результат: " + (part === "train" ? "обучающий отрезок (60%)" : part === "test" ? "проверочный отрезок (40%)" : "все данные")), h("span", { class: "tag-data" }, CA.market.DATA_LABEL)));
      var stats = h("div", { class: "stats stats--compact" });
      stats.appendChild(stat("Сделок", String(s.trades)));
      stats.appendChild(stat("Доходность", CA.dom.signed(s.netPct, 2) + "%", s.netPct >= 0 ? "up" : "down"));
      stats.appendChild(stat("Прибыльных", fmt(s.winRate, 1) + "%"));
      stats.appendChild(stat("Profit factor", fmt(s.profitFactor, 2)));
      stats.appendChild(stat("Среднее, R", CA.dom.signed(s.avgR, 2)));
      stats.appendChild(stat("Макс. просадка", "−" + fmt(s.maxDD, 2) + "%", "down"));
      results.appendChild(stats);
      var lc = h("div", { style: { marginTop: "12px" } }); results.appendChild(lc);
      CA.LineChart(lc, { series: [{ values: [10000].concat(r.curve), color: s.netPct >= 0 ? "#26a69a" : "#ef5350", fill: s.netPct >= 0 ? "rgba(38,166,154,.08)" : "rgba(239,83,80,.08)" }], baseline: 10000, height: 170, ariaLabel: "Кривая капитала бэктеста" });
      var cc = h("div", { style: { marginTop: "12px" } }); results.appendChild(cc);
      var markers = [];
      r.trades.forEach(function (t) { markers.push({ i: t.openI, kind: "buy", price: t.entry }); markers.push({ i: t.closeI, kind: t.pnl > 0 ? "dot" : "x", price: t.exit, color: t.pnl > 0 ? "#26a69a" : "#ef5350" }); });
      var ov = CA.chartSpec.overlays(st.entry === "ma-cross" ? [] : st.entry === "pullback-ema" ? ["ema20", "sma50"] : [], candles);
      if (st.entry === "ma-cross") { var cl = candles.map(function (c) { return c.c; }); ov.overlays = [{ values: CA.indicators.ema(cl, st.fast), color: "#4dd0e1", label: "EMA" + st.fast }, { values: CA.indicators.ema(cl, st.slow), color: "#ff8a65", label: "EMA" + st.slow }]; }
      CA.Chart(cc, { candles: candles.slice(0, range.to), overlays: ov.overlays.map(function (o) { return { values: o.values.slice(0, range.to), color: o.color, label: o.label }; }), markers: markers, height: 300, visible: 200, title: "Сделки бэктеста", spans: [{ from: range.from, to: range.to - 1, color: "rgba(61,139,255,.04)" }] });
      results.appendChild(h("p", { class: "small muted", style: { marginTop: "10px" } }, "Вход — по открытию свечи после сигнала, комиссия 0,1% и проскальзывание 0,05% учтены. Результат на синтетических данных ничего не говорит о будущей доходности на реальном рынке: это упражнение на понимание метода, а не проверенная стратегия."));
      if (CA.app && CA.app.store) CA.app.store.count("backtests");
      if (opts.onRun) opts.onRun(part);
    }
    renderParams();
    wrap.appendChild(h("div", { class: opts.compact ? "" : "card" }, form, params,
      h("div", { class: "btn-row", style: { marginTop: "14px" } },
        h("button", { class: "btn btn--primary", onclick: function () { run("train"); } }, "Проверить на обучающем отрезке"),
        h("button", { class: "btn", onclick: function () { run("test"); } }, "Проверить на проверочном"),
        h("button", { class: "btn btn--ghost", onclick: function () { run("all"); } }, "Все данные")),
      results));
    return wrap;
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
