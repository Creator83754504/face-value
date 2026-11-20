/*
 * Движок учебной торговли (Paper Trading). Только виртуальные деньги, никаких подключений к биржам.
 * Спот: можно купить актив на USDT и продать купленное. Шорта и плеча нет.
 * Состояние — простой объект, который целиком сохраняется в localStorage.
 */
(function (g) {
  "use strict";
  var CA = g.CA || (g.CA = {});
  if (!CA.risk && typeof require === "function") require("./risk.js");

  var MIN_ORDER = 10;

  function create(opts) {
    opts = opts || {};
    return {
      startBalance: opts.balance || 10000, cash: opts.balance || 10000,
      fee: opts.fee == null ? 0.001 : opts.fee,           // 0,1 % — типичная комиссия тейкера на споте
      slippage: opts.slippage == null ? 0.0005 : opts.slippage, // 0,05 % — проскальзывание рыночного ордера
      open: [], closed: [], orders: [], equity: [], nextId: 1
    };
  }

  function err(msg) { return { ok: false, error: msg }; }

  // Рыночная покупка на сумму usdt (комиссия включена в сумму)
  function buy(st, o) {
    var usdt = +o.usdt;
    if (!(usdt >= MIN_ORDER)) return err("Минимальная сумма ордера — " + MIN_ORDER + " USDT");
    if (usdt > st.cash + 1e-9) return err("Недостаточно USDT: доступно " + st.cash.toFixed(2));
    var exec = o.exact ? o.price : o.price * (1 + st.slippage);
    if (o.sl != null && !(o.sl > 0 && o.sl < exec)) return err("Stop Loss для покупки должен быть ниже цены входа");
    if (o.tp != null && !(o.tp > exec)) return err("Take Profit должен быть выше цены входа");
    var feeIn = usdt * st.fee;
    var qty = (usdt - feeIn) / exec;
    st.cash -= usdt;
    var tr = {
      id: st.nextId++, asset: o.asset, qty: qty, entry: exec, cost: usdt, feeIn: feeIn,
      sl: o.sl == null ? null : +o.sl, tp: o.tp == null ? null : +o.tp,
      openI: o.i, openT: o.t, hadStop: o.sl != null,
      initialSl: o.sl == null ? null : +o.sl, initialTp: o.tp == null ? null : +o.tp, equityAtOpen: o.equity == null ? null : o.equity, note: o.note || ""
    };
    st.open.push(tr);
    return { ok: true, trade: tr };
  }

  function closeTrade(st, id, price, i, reason, exact) {
    var k = st.open.findIndex(function (t) { return t.id === id; });
    if (k < 0) return err("Позиция не найдена");
    var tr = st.open[k];
    var exec = exact ? price : price * (1 - st.slippage);
    var value = tr.qty * exec, feeOut = value * st.fee;
    st.cash += value - feeOut;
    tr.exit = exec; tr.feeOut = feeOut; tr.closeI = i; tr.reason = reason || "manual";
    tr.pnl = value - feeOut - tr.cost;
    tr.pnlPct = tr.pnl / tr.cost * 100;
    st.open.splice(k, 1);
    st.closed.push(tr);
    return { ok: true, trade: tr };
  }

  function setProtection(st, id, sl, tp) {
    var tr = st.open.find(function (t) { return t.id === id; });
    if (!tr) return err("Позиция не найдена");
    tr.sl = sl == null || sl === "" ? null : +sl;
    tr.tp = tp == null || tp === "" ? null : +tp;
    if (tr.sl != null) { tr.hadStop = true; if (tr.initialSl == null) tr.initialSl = tr.sl; }
    if (tr.tp != null && tr.initialTp == null) tr.initialTp = tr.tp;
    return { ok: true, trade: tr };
  }

  function placeLimit(st, o) {
    var usdt = +o.usdt;
    if (!(usdt >= MIN_ORDER)) return err("Минимальная сумма ордера — " + MIN_ORDER + " USDT");
    if (usdt > st.cash + 1e-9) return err("Недостаточно USDT");
    if (!(o.limit > 0 && o.limit < o.price)) return err("Лимитная покупка ставится ниже текущей цены");
    st.cash -= usdt; // средства резервируются
    var ord = { id: st.nextId++, asset: o.asset, usdt: usdt, limit: +o.limit, sl: o.sl == null ? null : +o.sl, tp: o.tp == null ? null : +o.tp, placedI: o.i };
    st.orders.push(ord);
    return { ok: true, order: ord };
  }

  function cancelOrder(st, id) {
    var k = st.orders.findIndex(function (x) { return x.id === id; });
    if (k < 0) return err("Ордер не найден");
    st.cash += st.orders[k].usdt;
    st.orders.splice(k, 1);
    return { ok: true };
  }

  /*
   * Новая свеча по каждому активу: исполняем лимитные ордера, стопы и тейки.
   * Если в одной свече задеты и стоп, и тейк, считаем, что первым сработал стоп (консервативно).
   * Если свеча открылась за стопом (гэп), исполнение по цене открытия.
   */
  function step(st, candlesByAsset, i) {
    var events = [];
    st.orders.slice().forEach(function (ord) {
      var c = candlesByAsset[ord.asset]; if (!c) return;
      if (c.l <= ord.limit) {
        var px = Math.min(c.o, ord.limit);
        st.cash += ord.usdt;
        st.orders.splice(st.orders.indexOf(ord), 1);
        var r = buy(st, { asset: ord.asset, usdt: ord.usdt, price: px, exact: true, i: i, t: c.t, equity: equity(st, candlesByAsset, "c") });
        if (r.ok) {
          if (ord.sl != null && ord.sl < px) r.trade.sl = ord.sl;
          if (ord.tp != null && ord.tp > px) r.trade.tp = ord.tp;
          r.trade.viaLimit = true;
          events.push({ type: "filled", trade: r.trade });
        }
      }
    });
    st.open.slice().forEach(function (tr) {
      var c = candlesByAsset[tr.asset]; if (!c || tr.openI === i) return;
      var hitSL = tr.sl != null && c.l <= tr.sl, hitTP = tr.tp != null && c.h >= tr.tp;
      if (hitSL) {
        var px = c.o < tr.sl ? c.o : tr.sl;
        var r = closeTrade(st, tr.id, px * (1 - st.slippage), i, "stop", true);
        events.push({ type: "stop", trade: r.trade });
      } else if (hitTP) {
        var px2 = c.o > tr.tp ? c.o : tr.tp;
        var r2 = closeTrade(st, tr.id, px2, i, "take", true);
        events.push({ type: "take", trade: r2.trade });
      }
    });
    st.equity.push({ i: i, v: equity(st, candlesByAsset, "c") });
    if (st.equity.length > 5000) st.equity.splice(0, st.equity.length - 5000);
    return events;
  }

  function equity(st, candlesByAsset, field) {
    var v = st.cash;
    st.orders.forEach(function (o) { v += o.usdt; });
    st.open.forEach(function (t) { var c = candlesByAsset[t.asset]; v += t.qty * (c ? c[field || "c"] : t.entry); });
    return v;
  }

  function stats(st) {
    var cl = st.closed, wins = cl.filter(function (t) { return t.pnl > 0; }), losses = cl.filter(function (t) { return t.pnl <= 0; });
    var sum = function (a, f) { return a.reduce(function (s, t) { return s + f(t); }, 0); };
    var grossWin = sum(wins, function (t) { return t.pnl; }), grossLoss = -sum(losses, function (t) { return t.pnl; });
    var series = [st.startBalance].concat(st.equity.map(function (e) { return e.v; }));
    var dd = CA.risk.maxDrawdown(series);
    return {
      trades: cl.length, wins: wins.length, losses: losses.length,
      winRate: cl.length ? wins.length / cl.length * 100 : 0,
      avgWin: wins.length ? grossWin / wins.length : 0,
      avgLoss: losses.length ? grossLoss / losses.length : 0,
      profitFactor: grossLoss > 0 ? grossWin / grossLoss : (grossWin > 0 ? Infinity : 0),
      netPnl: sum(cl, function (t) { return t.pnl; }),
      fees: sum(cl, function (t) { return t.feeIn + t.feeOut; }) + sum(st.open, function (t) { return t.feeIn; }),
      best: cl.length ? Math.max.apply(null, cl.map(function (t) { return t.pnl; })) : 0,
      worst: cl.length ? Math.min.apply(null, cl.map(function (t) { return t.pnl; })) : 0,
      withStop: cl.filter(function (t) { return t.sl != null || t.hadStop; }).length,
      avgHold: cl.length ? sum(cl, function (t) { return t.closeI - t.openI; }) / cl.length : 0,
      maxDrawdownPct: dd.pct, maxDrawdownAbs: dd.abs
    };
  }

  var api = { create: create, buy: buy, close: closeTrade, setProtection: setProtection, placeLimit: placeLimit,
    cancelOrder: cancelOrder, step: step, equity: equity, stats: stats, MIN_ORDER: MIN_ORDER };
  CA.engine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
