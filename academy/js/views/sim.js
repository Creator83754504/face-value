/*
 * Paper Trading — учебный симулятор торговли. Виртуальные 10 000 USDT, только синтетические данные.
 * Рынок «проигрывается» свеча за свечой: вы принимаете решение, затем открываете следующую свечу.
 */
(function (g) {
  "use strict";
  var CA = g.CA;
  var h = CA.dom.h, fmt = CA.dom.fmt, fmtP = CA.dom.fmtPrice;

  var KEY = "ca.sim.v1";
  var N = 3000, START = 300;
  var ASSETS = [
    { id: "SYN-BTC", name: "Synthetic Bitcoin", start: 42000, vol: 0.007 },
    { id: "SYN-ETH", name: "Synthetic Ether", start: 2300, vol: 0.009 },
    { id: "SYN-ALT", name: "Synthetic Altcoin", start: 1.8, vol: 0.015 }
  ];
  var cache = {};

  function storage() { return CA.progress.safeStorage(); }
  function load() {
    try { var s = JSON.parse(storage().get(KEY)); if (s && s.v === 1 && s.account) return s; } catch (e) { /* повреждённые данные — новая сессия */ }
    return fresh();
  }
  function fresh() { return { v: 1, seed: Math.floor(Math.random() * 1e9), cursor: START, asset: ASSETS[0].id, account: CA.engine.create({ balance: 10000 }), reviews: {}, ind: { ema20: true, sma50: true }, sessions: 1 }; }
  function save(s) { storage().set(KEY, JSON.stringify(s)); }
  function series(seed, a) {
    var k = seed + ":" + a.id;
    if (!cache[k]) cache[k] = CA.market.randomWalk({ n: N, seed: k, start: a.start, vol: a.vol, volume: a.start > 100 ? 120 : 90000 });
    return cache[k];
  }

  CA.views.sim = function () {
    var store = CA.app.store, S = load(), timer = null;
    var data = {};
    ASSETS.forEach(function (a) { data[a.id] = series(S.seed, a); });
    var acc = S.account;

    function cur() { return data[S.asset][S.cursor]; }
    function candlesNow() { var m = {}; ASSETS.forEach(function (a) { m[a.id] = data[a.id][S.cursor]; }); return m; }
    function eq() { return CA.engine.equity(acc, candlesNow(), "c"); }

    var wrap = h("div", { class: "sim" });
    wrap.appendChild(h("div", { class: "page-head" }, h("div", { class: "eyebrow" }, "Paper Trading · только виртуальные деньги"), h("h1", null, "Учебный симулятор торговли"),
      h("p", null, "Стартовый баланс 10 000 USDT, комиссия 0,1% и проскальзывание 0,05% на рыночных ордерах. Рынок открывается по одной свече: сначала решение, потом результат. Активы вымышленные, графики сгенерированы алгоритмом — это ", h("b", null, "синтетические данные"), ", а не котировки реальных монет. Подключения к биржам и реальных денег нет.")));

    // ── верхняя панель: активы и показатели
    var assetSeg = h("div", { class: "seg", role: "tablist", "aria-label": "Актив" });
    ASSETS.forEach(function (a) { assetSeg.appendChild(h("button", { type: "button", role: "tab", dataset: { id: a.id }, onclick: function () { S.asset = a.id; save(S); renderAll(true); } }, a.id)); });
    var priceEl = h("div", { class: "sim-price" });
    var kpis = h("div", { class: "stats stats--compact sim-kpis" });

    // ── график
    var chartBox = h("div"), chart;
    var indSeg = h("div", { class: "btn-row" });
    [["ema20", "EMA 20"], ["sma50", "SMA 50"], ["bb", "Bollinger"], ["rsi", "RSI"], ["macd", "MACD"]].forEach(function (p) {
      indSeg.appendChild(h("button", { class: "btn btn--sm", dataset: { k: p[0] }, onclick: function () { S.ind[p[0]] = !S.ind[p[0]]; save(S); renderChart(true); } }, p[1]));
    });
    var stepBtn = h("button", { class: "btn btn--primary", onclick: function () { step(1); } }, "Следующая свеча →");
    var playBtn = h("button", { class: "btn", onclick: togglePlay }, "▶ Авто");
    var speedSel = h("select", { class: "input", style: { width: "auto", minHeight: "38px" }, "aria-label": "Скорость" }, [["600", "Медленно"], ["250", "Средне"], ["80", "Быстро"]].map(function (o) { return h("option", { value: o[0], selected: o[0] === "250" }, o[1]); }));
    var skipBtn = h("button", { class: "btn btn--ghost", onclick: function () { step(10); } }, "+10 свечей");
    var progressNote = h("span", { class: "small muted" });

    // ── панель ордеров
    var amount = h("input", { class: "input num", inputmode: "decimal", value: "1000", "aria-label": "Сумма в USDT" });
    var slIn = h("input", { class: "input num", inputmode: "decimal", placeholder: "необязательно", "aria-label": "Stop Loss" });
    var tpIn = h("input", { class: "input num", inputmode: "decimal", placeholder: "необязательно", "aria-label": "Take Profit" });
    var limitIn = h("input", { class: "input num", inputmode: "decimal", placeholder: "ниже текущей", "aria-label": "Лимитная цена" });
    var riskIn = h("input", { class: "input num", inputmode: "decimal", value: "1", "aria-label": "Риск, %", style: { maxWidth: "80px" } });
    var orderMsg = h("div", { class: "small", style: { minHeight: "20px" } });
    var pct = h("div", { class: "btn-row" });
    [10, 25, 50, 100].forEach(function (p) { pct.appendChild(h("button", { class: "btn btn--sm", type: "button", onclick: function () { amount.value = (acc.cash * p / 100).toFixed(2); preview(); } }, p + "%")); });
    var orderType = "market", typeSeg = h("div", { class: "seg" }), limitRow = h("label", { class: "field", hidden: true }, h("span", null, "Цена лимитной покупки"), limitIn);
    [["market", "Рыночный"], ["limit", "Лимитный"]].forEach(function (p) { typeSeg.appendChild(h("button", { type: "button", class: p[0] === "market" ? "is-active" : "", onclick: function (e) { orderType = p[0]; Array.from(typeSeg.children).forEach(function (b) { b.classList.toggle("is-active", b === e.currentTarget); }); limitRow.hidden = p[0] !== "limit"; preview(); } }, p[1])); });
    var previewEl = h("div", { class: "small muted" });
    [amount, slIn, tpIn, limitIn].forEach(function (i) { i.addEventListener("input", preview); });

    function num(inp) { var v = CA.parseNum(inp.value); return inp.value.trim() === "" ? null : v; }
    function preview() {
      var price = orderType === "limit" && num(limitIn) ? num(limitIn) : cur().c, usd = num(amount), sl = num(slIn), tp = num(tpIn), parts = [];
      if (usd > 0) parts.push("≈ " + fmt(usd * (1 - acc.fee) / price, 6) + " " + S.asset.replace("SYN-", "") + ", комиссия " + fmt(usd * acc.fee) + " USDT");
      if (usd > 0 && sl > 0 && sl < price) { var loss = usd * (1 - acc.fee) / price * (price - sl) + usd * acc.fee * 2; parts.push("риск до стопа ≈ " + fmt(loss) + " USDT (" + fmt(loss / eq() * 100, 2) + "% капитала)"); }
      if (sl > 0 && tp > 0 && sl < price && tp > price) parts.push("R:R 1 : " + fmt((tp - price) / (price - sl), 2));
      previewEl.textContent = parts.join(" · ");
    }
    function sizeByRisk() {
      var sl = num(slIn), r = num(riskIn), price = orderType === "limit" && num(limitIn) ? num(limitIn) : cur().c;
      if (!(sl > 0 && sl < price)) { orderMsg.innerHTML = "<span class='down'>Сначала укажите Stop Loss ниже цены — размер считается от расстояния до стопа.</span>"; return; }
      var ps = CA.risk.positionSize({ balance: eq(), riskPct: r || 1, entry: price, stop: sl, feePct: acc.fee * 100 });
      if (!ps.ok) { orderMsg.textContent = ps.error; return; }
      var usd = Math.min(acc.cash, ps.notional * (1 + acc.fee));
      amount.value = usd.toFixed(2);
      orderMsg.innerHTML = ps.notional > acc.cash ? "<span class='warn'>Расчётный размер больше свободных средств — сумма ограничена балансом, риск будет меньше заданного.</span>" : "<span class='up'>Размер рассчитан: при срабатывании стопа убыток ≈ " + fmt(r || 1, 1) + "% капитала.</span>";
      preview();
    }
    function placeOrder() {
      var usd = num(amount), sl = num(slIn), tp = num(tpIn), c = cur(), r;
      if (orderType === "market") r = CA.engine.buy(acc, { asset: S.asset, usdt: usd, price: c.c, sl: sl, tp: tp, i: S.cursor, t: c.t, equity: eq() });
      else r = CA.engine.placeLimit(acc, { asset: S.asset, usdt: usd, limit: num(limitIn), price: c.c, sl: sl, tp: tp, i: S.cursor });
      if (!r.ok) { orderMsg.innerHTML = "<span class='down'>" + r.error + "</span>"; return; }
      orderMsg.innerHTML = orderType === "market" ? "<span class='up'>Куплено по " + fmtP(r.trade.entry) + (sl == null ? ". Внимание: без Stop Loss." : "") + "</span>" : "<span class='up'>Лимитный ордер выставлен по " + fmtP(r.order.limit) + "</span>";
      slIn.value = ""; tpIn.value = ""; limitIn.value = "";
      save(S); renderAll(false);
    }
    var orderPanel = h("div", { class: "card sim-order" },
      h("div", { class: "card__head" }, h("h3", null, "Покупка " + "(спот)"), typeSeg),
      h("div", { class: "stack", style: { gap: "10px" } },
        h("label", { class: "field" }, h("span", null, "Сумма, USDT"), amount), pct, limitRow,
        h("div", { class: "grid-2" }, h("label", { class: "field" }, h("span", null, "Stop Loss"), slIn), h("label", { class: "field" }, h("span", null, "Take Profit"), tpIn)),
        h("div", { class: "btn-row" }, h("span", { class: "small muted" }, "Риск"), riskIn, h("span", { class: "small muted" }, "%"), h("button", { class: "btn btn--sm", type: "button", onclick: sizeByRisk }, "Рассчитать размер от риска")),
        previewEl,
        h("button", { class: "btn btn--buy btn--lg btn--block", onclick: placeOrder }, "Купить"),
        orderMsg,
        h("p", { class: "small faint", style: { margin: 0 } }, "Спот: можно купить актив и продать купленное. Продажа без покупки (шорт) и кредитное плечо в учебном симуляторе отключены.")));

    // ── позиции и ордера
    var posBox = h("div", { class: "card" });
    function renderPositions() {
      posBox.innerHTML = "";
      posBox.appendChild(h("div", { class: "card__head" }, h("h3", null, "Открытые позиции"), acc.open.length > 1 ? h("button", { class: "btn btn--sm btn--sell", onclick: function () { acc.open.slice().forEach(function (t) { closeTrade(t.id); }); } }, "Закрыть все") : null));
      if (!acc.open.length && !acc.orders.length) { posBox.appendChild(h("p", { class: "small muted" }, "Нет открытых позиций.")); return; }
      acc.open.forEach(function (t) {
        var c = data[t.asset][S.cursor], val = t.qty * c.c, pnl = val * (1 - acc.fee) - t.cost;
        var slE = h("input", { class: "input num", value: t.sl == null ? "" : t.sl, placeholder: "SL", "aria-label": "Stop Loss позиции", style: { minHeight: "32px" } });
        var tpE = h("input", { class: "input num", value: t.tp == null ? "" : t.tp, placeholder: "TP", "aria-label": "Take Profit позиции", style: { minHeight: "32px" } });
        posBox.appendChild(h("div", { class: "pos" },
          h("div", { class: "pos__top" }, h("b", null, t.asset), h("span", { class: "chip chip--up" }, "LONG"), h("span", { class: "num " + (pnl >= 0 ? "up" : "down"), style: { marginLeft: "auto" } }, CA.dom.signed(pnl) + " USDT (" + CA.dom.signed(pnl / t.cost * 100) + "%)")),
          h("div", { class: "pos__meta small muted" }, "Вход " + fmtP(t.entry) + " · " + fmt(t.qty, 6) + " шт. · стоимость " + fmt(val) + " USDT" + (t.sl == null ? " · " : ""), t.sl == null ? h("span", { class: "warn" }, "без стопа") : null),
          h("div", { class: "pos__actions" }, slE, tpE,
            h("button", { class: "btn btn--sm", onclick: function () {
              var sl = num(slE), tp = num(tpE), price = c.c;
              if (sl != null && !(sl > 0 && sl < price)) { CA.dom.toast("Stop Loss должен быть ниже текущей цены", "error"); return; }
              if (tp != null && !(tp > price)) { CA.dom.toast("Take Profit должен быть выше текущей цены", "error"); return; }
              CA.engine.setProtection(acc, t.id, sl, tp); save(S); renderAll(false); CA.dom.toast("Защитные ордера обновлены");
            } }, "Сохранить"),
            h("button", { class: "btn btn--sm btn--sell", onclick: function () { closeTrade(t.id); } }, "Продать"))));
      });
      acc.orders.forEach(function (o) {
        posBox.appendChild(h("div", { class: "pos" }, h("div", { class: "pos__top" }, h("b", null, o.asset), h("span", { class: "chip chip--accent" }, "LIMIT BUY"), h("span", { class: "num", style: { marginLeft: "auto" } }, fmtP(o.limit))),
          h("div", { class: "pos__meta small muted" }, fmt(o.usdt) + " USDT зарезервировано" + (o.sl ? " · SL " + fmtP(o.sl) : "") + (o.tp ? " · TP " + fmtP(o.tp) : "")),
          h("div", { class: "pos__actions" }, h("button", { class: "btn btn--sm", onclick: function () { CA.engine.cancelOrder(acc, o.id); save(S); renderAll(false); } }, "Отменить"))));
      });
    }

    function closeTrade(id) {
      var t = acc.open.find(function (x) { return x.id === id; });
      if (!t) return;
      var r = CA.engine.close(acc, id, data[t.asset][S.cursor].c, S.cursor, "manual");
      if (r.ok) afterClose(r.trade);
      save(S); renderAll(false);
    }

    function afterClose(trade) {
      var rv = CA.coach.review(trade, { candles: data[trade.asset], allClosed: acc.closed });
      S.reviews[trade.id] = rv;
      store.recordTrade(trade, rv);
      if (trade.hadStop) CA.daily.complete("trade");
      CA.dom.toast((trade.reason === "stop" ? "Сработал Stop Loss: " : trade.reason === "take" ? "Сработал Take Profit: " : "Позиция закрыта: ") + CA.dom.signed(trade.pnl) + " USDT", trade.pnl >= 0 ? "success" : "error");
      if (store.state.settings.coach) { stopPlay(); showReview(trade, rv); }
    }

    function showReview(trade, rv) {
      var body = h("div");
      body.appendChild(h("div", { class: "stats stats--compact" },
        h("div", { class: "stat" }, h("div", { class: "stat__label" }, "Результат"), h("div", { class: "stat__value " + (trade.pnl >= 0 ? "up" : "down") }, CA.dom.signed(trade.pnl) + " USDT")),
        h("div", { class: "stat" }, h("div", { class: "stat__label" }, "Вход → выход"), h("div", { class: "stat__value", style: { fontSize: "15px" } }, fmtP(trade.entry) + " → " + fmtP(trade.exit))),
        h("div", { class: "stat" }, h("div", { class: "stat__label" }, "Длительность"), h("div", { class: "stat__value" }, (trade.closeI - trade.openI) + " св."))));
      body.appendChild(h("p", { style: { margin: "14px 0" } }, rv.verdict));
      rv.items.forEach(function (it) {
        body.appendChild(h("div", { class: "callout callout--" + (it.kind === "bad" ? "risk" : it.kind === "warn" ? "warn" : it.kind === "good" ? "tip" : "info") }, h("div", { class: "callout__title" }, it.title), h("p", null, it.text)));
      });
      if (!rv.items.length) body.appendChild(h("p", { class: "muted" }, "Явных ошибок не найдено."));
      body.appendChild(h("label", { class: "btn-row small muted", style: { marginTop: "12px" } }, h("input", { type: "checkbox", checked: store.state.settings.coach, onchange: function (e) { store.setSetting("coach", e.target.checked); coachToggle.checked = e.target.checked; } }), "Показывать разбор после каждой сделки (режим обучения)"));
      CA.dom.modal(body, { title: "Разбор сделки #" + trade.id + " · " + trade.asset, wide: true });
    }

    function step(n) {
      for (var k = 0; k < n; k++) {
        if (S.cursor >= N - 1) { stopPlay(); CA.dom.toast("Учебные данные закончились. Начните новую сессию.", "info"); break; }
        S.cursor++;
        var ev = CA.engine.step(acc, candlesNow(), S.cursor);
        ev.forEach(function (e) {
          if (e.type === "filled") CA.dom.toast("Лимитный ордер исполнен по " + fmtP(e.trade.entry), "success");
          else afterClose(e.trade);
        });
      }
      save(S); renderAll(false);
    }
    function togglePlay() { if (timer) stopPlay(); else { playBtn.textContent = "❚❚ Пауза"; timer = setInterval(function () { step(1); }, +speedSel.value); } }
    function stopPlay() { if (timer) clearInterval(timer); timer = null; playBtn.textContent = "▶ Авто"; }
    speedSel.addEventListener("change", function () { if (timer) { stopPlay(); togglePlay(); } });
    CA.app.onLeave(stopPlay);

    // ── нижние вкладки: история, статистика, капитал
    var tabs = h("div", { class: "seg" }), tabBody = h("div", { style: { marginTop: "14px" } }), tab = "history";
    [["history", "История сделок"], ["stats", "Статистика"], ["equity", "Кривая капитала"]].forEach(function (p) {
      tabs.appendChild(h("button", { type: "button", dataset: { t: p[0] }, onclick: function () { tab = p[0]; renderTab(); } }, p[1]));
    });
    var eqChart = null;
    function renderTab() {
      Array.from(tabs.children).forEach(function (b) { b.classList.toggle("is-active", b.dataset.t === tab); });
      if (eqChart) { eqChart.destroy(); eqChart = null; }
      tabBody.innerHTML = "";
      var st = CA.engine.stats(acc);
      if (tab === "history") {
        if (!acc.closed.length) { tabBody.appendChild(h("p", { class: "muted small" }, "Закрытых сделок пока нет.")); return; }
        tabBody.appendChild(h("div", { class: "table-wrap" }, h("table", { class: "table" },
          h("thead", null, h("tr", null, ["#", "Актив", "Вход", "Выход", "Причина", "Свечей", "Стоп", "Результат", ""].map(function (c, i) { return h("th", { class: i >= 2 && i !== 4 && i !== 6 && i !== 8 ? "num" : "" }, c); }))),
          h("tbody", null, acc.closed.slice().reverse().map(function (t) {
            return h("tr", null, h("td", null, String(t.id)), h("td", null, t.asset), h("td", { class: "num" }, fmtP(t.entry)), h("td", { class: "num" }, fmtP(t.exit)),
              h("td", null, { manual: "вручную", stop: "Stop Loss", take: "Take Profit" }[t.reason]), h("td", { class: "num" }, String(t.closeI - t.openI)),
              h("td", null, t.hadStop ? "✓" : h("span", { class: "warn" }, "нет")),
              h("td", { class: "num " + (t.pnl >= 0 ? "up" : "down") }, CA.dom.signed(t.pnl) + " (" + CA.dom.signed(t.pnlPct) + "%)"),
              h("td", null, S.reviews[t.id] ? h("button", { class: "btn btn--sm btn--ghost", onclick: function () { showReview(t, S.reviews[t.id]); } }, "Разбор") : null));
          })))));
      } else if (tab === "stats") {
        var tiles = [
          ["Сделок", st.trades], ["Прибыльных", st.wins + " (" + fmt(st.winRate, 1) + "%)"], ["Убыточных", st.losses],
          ["Средняя прибыль", fmt(st.avgWin) + " USDT"], ["Средний убыток", fmt(st.avgLoss) + " USDT"], ["Profit factor", fmt(st.profitFactor, 2)],
          ["Чистый результат", CA.dom.signed(st.netPnl) + " USDT"], ["Уплачено комиссий", fmt(st.fees) + " USDT"], ["Макс. просадка", "−" + fmt(st.maxDrawdownPct, 2) + "%"],
          ["Сделок со стопом", st.withStop + " из " + st.trades], ["Средняя длительность", fmt(st.avgHold, 1) + " св."], ["Лучшая / худшая", CA.dom.signed(st.best, 0) + " / " + CA.dom.signed(st.worst, 0)]
        ];
        var grid = h("div", { class: "stats stats--compact" });
        tiles.forEach(function (t) { grid.appendChild(h("div", { class: "stat" }, h("div", { class: "stat__label" }, t[0]), h("div", { class: "stat__value" }, String(t[1])))); });
        tabBody.appendChild(grid);
        tabBody.appendChild(h("p", { class: "small muted", style: { marginTop: "12px" } }, "Максимальная просадка — наибольшее падение капитала от пика до последующего минимума. Profit factor — отношение суммы прибылей к сумме убытков. На малом числе сделок эти цифры почти ничего не значат: оценивайте статистику минимум по 30–50 сделкам."));
      } else {
        var vals = [acc.startBalance].concat(acc.equity.map(function (e) { return e.v; }));
        var holder = h("div"); tabBody.appendChild(holder);
        eqChart = CA.LineChart(holder, { series: [{ values: vals, color: "#3d8bff", fill: "rgba(61,139,255,.08)" }], baseline: acc.startBalance, height: 220, ariaLabel: "Изменение виртуального баланса", empty: "Сделайте несколько шагов рынка" });
        tabBody.appendChild(h("p", { class: "small muted" }, "Стоимость счёта (USDT + открытые позиции по текущей цене) на закрытии каждой свечи. Пунктир — стартовые 10 000 USDT."));
      }
    }

    var coachToggle = h("input", { type: "checkbox", checked: store.state.settings.coach, onchange: function (e) { store.setSetting("coach", e.target.checked); } });

    function renderChart(refit) {
      var c = data[S.asset];
      var names = ["ema20", "sma50", "bb"].filter(function (k) { return S.ind[k]; });
      var ov = CA.chartSpec.overlays(names, c);
      var panes = ["volume"].concat(["rsi", "macd"].filter(function (k) { return S.ind[k]; }));
      var markers = [], levels = [];
      acc.closed.concat(acc.open).forEach(function (t) {
        if (t.asset !== S.asset) return;
        markers.push({ i: t.openI, kind: "buy", price: t.entry });
        if (t.closeI != null) markers.push({ i: t.closeI, kind: t.pnl > 0 ? "dot" : "x", price: t.exit, color: t.pnl > 0 ? "#26a69a" : "#ef5350" });
      });
      acc.open.forEach(function (t) {
        if (t.asset !== S.asset) return;
        levels.push({ price: t.entry, color: "#e6e9ed", label: "Вход #" + t.id, dash: false, fit: false });
        if (t.sl) levels.push({ price: t.sl, color: "#ef5350", label: "SL #" + t.id, fit: false });
        if (t.tp) levels.push({ price: t.tp, color: "#26a69a", label: "TP #" + t.id, fit: false });
      });
      acc.orders.forEach(function (o) { if (o.asset === S.asset) levels.push({ price: o.limit, color: "#3d8bff", label: "Лимит", fit: false }); });
      var patch = { candles: c, limit: S.cursor + 1, overlays: ov.overlays, bands: ov.bands, panes: panes, markers: markers, levels: levels, title: S.asset + " · 1h", height: 380 + (panes.length - 1) * 84, refit: refit };
      if (!chart) chart = CA.Chart(chartBox, Object.assign({ visible: window.innerWidth < 600 ? 60 : 120, dataLabel: "Синтетические данные · вымышленный актив" }, patch));
      else chart.update(patch);
      Array.from(indSeg.children).forEach(function (b) { b.classList.toggle("btn--primary", !!S.ind[b.dataset.k]); });
    }

    function renderAll(refit) {
      Array.from(assetSeg.children).forEach(function (b) { b.classList.toggle("is-active", b.dataset.id === S.asset); });
      var c = cur(), prev = data[S.asset][S.cursor - 24] || data[S.asset][0], ch = (c.c - prev.c) / prev.c * 100;
      priceEl.innerHTML = "";
      priceEl.appendChild(h("b", { class: "num" }, fmtP(c.c)));
      priceEl.appendChild(h("span", { class: "num " + (ch >= 0 ? "up" : "down") }, CA.dom.signed(ch) + "% за 24 св."));
      var e = eq(), st = CA.engine.stats(acc);
      kpis.innerHTML = "";
      [["Капитал", fmt(e) + " USDT", e >= acc.startBalance ? "up" : "down"], ["Свободно", fmt(acc.cash) + " USDT", ""], ["Результат", CA.dom.signed((e - acc.startBalance) / acc.startBalance * 100) + "%", e >= acc.startBalance ? "up" : "down"], ["Макс. просадка", st.maxDrawdownPct > 0.005 ? "−" + fmt(st.maxDrawdownPct, 2) + "%" : "0,00%", st.maxDrawdownPct > 0.005 ? "down" : ""]].forEach(function (k) {
        kpis.appendChild(h("div", { class: "stat" }, h("div", { class: "stat__label" }, k[0]), h("div", { class: "stat__value " + k[2] }, k[1])));
      });
      progressNote.textContent = "Свеча " + (S.cursor - START) + " из " + (N - 1 - START);
      renderChart(refit);
      renderPositions();
      renderTab();
      preview();
    }

    var resetBtn = h("button", { class: "btn btn--ghost btn--sm", onclick: function () {
      if (!confirm("Начать новую сессию? Баланс вернётся к 10 000 USDT, история сделок будет удалена, рынок сгенерируется заново.")) return;
      stopPlay(); var n = (S.sessions || 1) + 1; S = fresh(); S.sessions = n; save(S); CA.router.reload();
    } }, "Новая сессия");

    wrap.appendChild(h("div", { class: "sim-grid" },
      h("div", { class: "sim-main" },
        h("div", { class: "card" },
          h("div", { class: "sim-head" }, assetSeg, priceEl, h("span", { class: "tag-data", style: { marginLeft: "auto" } }, "Синтетические данные")),
          kpis,
          h("div", { class: "chart-tools" }, indSeg),
          chartBox,
          h("div", { class: "chart-tools", style: { marginTop: "10px" } }, stepBtn, playBtn, speedSel, skipBtn, progressNote, h("span", { style: { marginLeft: "auto" } }), h("label", { class: "btn-row small muted" }, coachToggle, "Режим обучения"), resetBtn)),
        h("div", { class: "card" }, tabs, tabBody)),
      h("div", { class: "sim-side" }, orderPanel, posBox)));
    setTimeout(function () { renderAll(true); }, 0);
    return wrap;
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
