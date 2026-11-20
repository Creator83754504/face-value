/*
 * Генератор СИНТЕТИЧЕСКИХ учебных рыночных данных (OHLCV).
 *
 * Здесь нет реальных котировок. Все свечи вычисляются алгоритмом из seed:
 *  • fromPivots — график проходит через заданные точки разворота (так мы точно знаем,
 *    где на графике поддержка, сопротивление, пробой — и можем проверить ответ ученика);
 *  • randomWalk — длинный ряд со сменой режимов (рост, падение, флэт) и кластерами
 *    волатильности — для симулятора и бэктеста;
 *  • scenario — готовые учебные сценарии («восходящий тренд», «ложный пробой» и т. д.).
 */
(function (g) {
  "use strict";
  var CA = g.CA || (g.CA = {});
  if (!CA.rng && typeof require === "function") require("./rng.js");

  var T0 = Date.UTC(2024, 0, 1);
  var DATA_LABEL = "Синтетические учебные данные";

  function round(p) {
    var d = p >= 1000 ? 2 : p >= 10 ? 3 : 5;
    var m = Math.pow(10, d);
    return Math.round(p * m) / m;
  }

  function roundCandle(c) {
    c.o = round(c.o); c.h = round(c.h); c.l = round(c.l); c.c = round(c.c);
    c.h = Math.max(c.h, c.o, c.c); c.l = Math.min(c.l, c.o, c.c);
    c.v = Math.round(c.v);
    return c;
  }

  /*
   * pivots: [{ i, p, close? }] — индекс свечи и цена экстремума (high для вершины, low для впадины).
   * Между соседними точками цена не выходит за их пределы, поэтому точки — настоящие локальные экстремумы.
   */
  function fromPivots(pivots, opts) {
    opts = opts || {};
    var R = CA.rng.create(opts.seed || 1);
    var vol = opts.vol || 0.006;
    var tf = opts.tf || 60;
    var n = pivots[pivots.length - 1].i + 1;
    var type = pivots.map(function (pv, k) {
      var prev = pivots[k - 1], next = pivots[k + 1];
      if (prev && next) return pv.p >= prev.p && pv.p >= next.p ? "high" : pv.p <= prev.p && pv.p <= next.p ? "low" : "mid";
      var other = prev || next;
      return pv.p >= other.p ? "high" : "low";
    });

    // 1. Путь цен закрытия: линейная интерполяция + броуновский мост
    var close = new Array(n), seg = new Array(n);
    for (var k = 0; k < pivots.length - 1; k++) {
      var a = pivots[k], b = pivots[k + 1], len = b.i - a.i;
      var w = [0], acc = 0;
      for (var s = 1; s <= len; s++) { acc += R.normal(); w.push(acc); }
      var hiCap = Math.max(a.p, b.p), loCap = Math.min(a.p, b.p), span = hiCap - loCap;
      for (var s2 = 0; s2 <= len; s2++) {
        var t = s2 / len;
        var base = a.p + (b.p - a.p) * t;
        var bridge = (w[s2] - t * w[len]) * vol * base * 0.55;
        var v = base + bridge;
        var margin = Math.min(span * 0.08, base * vol * 0.5);
        v = Math.min(hiCap - margin, Math.max(loCap + margin, v));
        close[a.i + s2] = v;
        if (s2 > 0 && s2 < len) seg[a.i + s2] = { hi: hiCap, lo: loCap };
      }
    }

    // Закрытие на свече-экстремуме: немного «отходит» от экстремума внутрь движения (или задано явно)
    pivots.forEach(function (pv, k) {
      if (typeof pv.close === "number") { close[pv.i] = pv.close; return; }
      var off = pv.p * vol * R.range(0.3, 0.9);
      close[pv.i] = type[k] === "high" ? pv.p - off : type[k] === "low" ? pv.p + off : pv.p;
    });

    // 2. Свечи
    var candles = [];
    for (var i = 0; i < n; i++) {
      var o = i === 0 ? close[0] * (1 + R.normal() * vol * 0.4) : close[i - 1];
      var c = close[i];
      var px = (o + c) / 2;
      var h = Math.max(o, c) + Math.abs(R.normal()) * vol * px * 0.55;
      var l = Math.min(o, c) - Math.abs(R.normal()) * vol * px * 0.55;
      if (seg[i]) {
        var m2 = (seg[i].hi - seg[i].lo) * 0.01;
        h = Math.min(h, seg[i].hi - m2); l = Math.max(l, seg[i].lo + m2);
        o = Math.min(Math.max(o, l), h);
      }
      candles.push({ t: T0 + i * tf * 60000, o: o, h: h, l: l, c: c, v: 0 });
    }
    pivots.forEach(function (pv, k) {
      var cd = candles[pv.i];
      if (type[k] === "high") { cd.h = pv.p; cd.o = Math.min(cd.o, pv.p); cd.c = Math.min(cd.c, pv.p); }
      else if (type[k] === "low") { cd.l = pv.p; cd.o = Math.max(cd.o, pv.p); cd.c = Math.max(cd.c, pv.p); }
      // соседние свечи не должны перекрывать экстремум
      [pv.i - 1, pv.i + 1].forEach(function (j) {
        var nb = candles[j]; if (!nb) return;
        if (type[k] === "high" && nb.h >= pv.p) nb.h = pv.p - Math.abs(pv.p * vol * 0.2);
        if (type[k] === "low" && nb.l <= pv.p) nb.l = pv.p + Math.abs(pv.p * vol * 0.2);
        nb.h = Math.max(nb.h, nb.o, nb.c); nb.l = Math.min(nb.l, nb.o, nb.c);
      });
    });

    // 3. Объём: базовый уровень × размер движения × шум × заданные всплески
    var vbase = opts.volume || 1000;
    var spikes = {};
    (opts.volumeSpikes || []).forEach(function (sp) {
      for (var j = sp.from; j <= (sp.to == null ? sp.from : sp.to); j++) spikes[j] = sp.mult;
    });
    var fade = opts.volumeTrend || null; // {from, to, mult} — плавное изменение объёма
    candles.forEach(function (cd, j) {
      var move = Math.abs(cd.c - cd.o) / cd.o / vol;
      var vv = vbase * (0.6 + 0.35 * move) * Math.exp(R.normal() * 0.25);
      if (spikes[j]) vv *= spikes[j];
      if (fade && j >= fade.from && j <= fade.to) vv *= 1 + (fade.mult - 1) * (j - fade.from) / Math.max(1, fade.to - fade.from);
      cd.v = vv;
      roundCandle(cd);
    });
    return candles;
  }

  // Длинный ряд со сменой режимов и кластерами волатильности (для симулятора и бэктеста)
  function randomWalk(opts) {
    opts = opts || {};
    var R = CA.rng.create(opts.seed || 7);
    var n = opts.n || 1000, tf = opts.tf || 60;
    var price = opts.start || 100;
    var baseVol = opts.vol || 0.008;
    var regimes = [
      { name: "up", drift: 0.0012, vol: 0.8 }, { name: "down", drift: -0.0011, vol: 1.0 },
      { name: "range", drift: 0, vol: 0.6 }, { name: "up-slow", drift: 0.0005, vol: 0.7 },
      { name: "down-slow", drift: -0.0004, vol: 0.8 }, { name: "volatile", drift: 0, vol: 1.6 }
    ];
    var reg = R.pick(regimes), left = R.int(60, 220), sigma = baseVol * reg.vol, anchor = price;
    var out = [], regimeLog = [{ from: 0, name: reg.name }];
    for (var i = 0; i < n; i++) {
      if (left-- <= 0) {
        reg = R.pick(regimes); left = R.int(60, 220); anchor = price;
        regimeLog.push({ from: i, name: reg.name });
      }
      var target = baseVol * reg.vol;
      sigma = Math.max(baseVol * 0.3, 0.92 * sigma + 0.08 * target + Math.abs(R.normal()) * baseVol * 0.05 * (R.chance(0.03) ? 6 : 1));
      var shock = R.normal() * sigma;
      if (R.chance(0.006)) shock += (R.chance(0.5) ? 1 : -1) * sigma * R.range(3, 6); // редкие резкие движения
      var drift = reg.drift;
      if (reg.name === "range") drift = -0.02 * Math.log(price / anchor); // во флэте цена «тянется» к середине
      var o = price;
      var c = o * Math.exp(drift + shock);
      var h = Math.max(o, c) * (1 + Math.abs(R.normal()) * sigma * 0.6);
      var l = Math.min(o, c) * (1 - Math.abs(R.normal()) * sigma * 0.6);
      var v = (opts.volume || 1000) * (0.5 + Math.abs(shock) / baseVol * 0.6) * Math.exp(R.normal() * 0.3);
      out.push(roundCandle({ t: T0 + i * tf * 60000, o: o, h: h, l: l, c: c, v: v }));
      price = out[out.length - 1].c;
    }
    out.regimes = regimeLog;
    return out;
  }

  // Зеркальное отражение графика (рост ↔ падение) в логарифмической шкале
  function mirror(candles, around) {
    var K = Math.pow(around || candles[0].o, 2);
    return candles.map(function (c) {
      return roundCandle({ t: c.t, o: K / c.o, h: K / c.l, l: K / c.h, c: K / c.c, v: c.v });
    });
  }

  // Объединение свечей в старший таймфрейм (например, 4 × 15m → 1h)
  function aggregate(candles, factor) {
    var out = [];
    for (var i = 0; i < candles.length; i += factor) {
      var part = candles.slice(i, i + factor);
      if (part.length < factor) break;
      out.push({
        t: part[0].t, o: part[0].o, c: part[part.length - 1].c,
        h: Math.max.apply(null, part.map(function (x) { return x.h; })),
        l: Math.min.apply(null, part.map(function (x) { return x.l; })),
        v: part.reduce(function (s, x) { return s + x.v; }, 0)
      });
    }
    return out;
  }

  // ───── Учебные сценарии ─────
  function legs(R, start, specs) {
    var pts = [{ i: 0, p: start }], i = 0, p = start;
    specs.forEach(function (sp) {
      i += R.int(sp.len[0], sp.len[1]);
      p = typeof sp.to === "number" ? sp.to : p * (1 + R.range(sp.pct[0], sp.pct[1]));
      var pt = { i: i, p: p };
      if (sp.close != null) pt.close = sp.close;
      pts.push(pt);
    });
    return pts;
  }

  function trendPivots(R, dir, swings) {
    var specs = [];
    for (var k = 0; k < swings; k++) {
      specs.push({ len: [7, 12], pct: [0.06, 0.1] });   // импульс
      specs.push({ len: [4, 7], pct: [-0.045, -0.025] }); // коррекция
    }
    specs.push({ len: [6, 10], pct: [0.05, 0.08] });
    return legs(R, 100, specs);
  }

  function rangePivots(R, S, Rz, touches, startLen) {
    var pts = [{ i: 0, p: (S + Rz) / 2 }], i = 0, top = R.chance(0.5);
    for (var k = 0; k < touches; k++) {
      i += k === 0 && startLen ? startLen : R.int(6, 11);
      var jit = (Rz - S) * R.range(0, 0.06);
      pts.push({ i: i, p: top ? Rz - jit : S + jit });
      top = !top;
    }
    return pts;
  }

  var SCENARIOS = {
    uptrend: function (R) {
      var pv = trendPivots(R, 1, R.int(3, 4));
      return { pivots: pv, meta: { trend: "up", title: "Восходящий тренд" } };
    },
    downtrend: function (R) {
      var pv = trendPivots(R, 1, R.int(3, 4));
      return { pivots: pv, mirror: true, meta: { trend: "down", title: "Нисходящий тренд" } };
    },
    range: function (R) {
      var S = 100, Rz = 100 * (1 + R.range(0.07, 0.11));
      var pv = rangePivots(R, S, Rz, R.int(6, 8));
      pv.push({ i: pv[pv.length - 1].i + R.int(4, 6), p: (S + Rz) / 2 });
      return { pivots: pv, meta: { trend: "range", title: "Боковое движение", levels: [{ type: "support", price: S }, { type: "resistance", price: Rz }] } };
    },
    "breakout-up": function (R) {
      var S = 100, Rz = 100 * (1 + R.range(0.06, 0.09));
      var pv = rangePivots(R, S, Rz, 6);
      if (pv[pv.length - 1].p > (S + Rz) / 2) pv.push({ i: pv[pv.length - 1].i + R.int(5, 8), p: S + (Rz - S) * 0.15 });
      var rangeEnd = pv[pv.length - 1].i;
      var bi = rangeEnd + R.int(9, 12);
      pv.push({ i: bi, p: Rz * (1 + R.range(0.05, 0.08)) });
      pv.push({ i: bi + R.int(4, 6), p: Rz * 1.012 });            // ретест пробитого уровня
      pv.push({ i: bi + R.int(12, 16), p: Rz * (1 + R.range(0.09, 0.13)) });
      return {
        pivots: pv,
        post: function (candles, meta) {
          var R2 = meta.levels[1].price, k = rangeEnd + 1;
          while (k < candles.length && candles[k].c <= R2) k++;
          meta.breakoutIndex = k;
          for (var j = k - 1; j <= k + 2 && j < candles.length; j++) candles[j].v = Math.round(candles[j].v * 2.6);
        },
        meta: { title: "Пробой сопротивления", levels: [{ type: "support", price: S }, { type: "resistance", price: Rz }] }
      };
    },
    "false-breakout-up": function (R) {
      var S = 100, Rz = 100 * (1 + R.range(0.06, 0.09));
      var pv = rangePivots(R, S, Rz, 6);
      if (pv[pv.length - 1].p > (S + Rz) / 2) pv.push({ i: pv[pv.length - 1].i + R.int(5, 8), p: S + (Rz - S) * 0.2 });
      var fi = pv[pv.length - 1].i + R.int(7, 10);
      var spike = Rz * (1 + R.range(0.012, 0.022));
      pv.push({ i: fi - 1, p: Rz * 0.992 }); // подход к уровню
      pv.push({ i: fi, p: spike, close: Rz - (Rz - S) * 0.12 }); // тень выше уровня, закрытие внутри диапазона
      pv.push({ i: fi + R.int(8, 12), p: S * 1.004 });
      return {
        pivots: pv, spikes: [{ from: fi, to: fi, mult: 1.4 }],
        meta: { title: "Ложный пробой", falseBreakIndex: fi, levels: [{ type: "support", price: S }, { type: "resistance", price: Rz }] }
      };
    },
    "reversal-top": function (R) {
      var pv = legs(R, 100, [
        { len: [8, 11], pct: [0.07, 0.09] }, { len: [4, 6], pct: [-0.04, -0.03] },
        { len: [8, 11], pct: [0.07, 0.09] }, { len: [4, 6], pct: [-0.04, -0.03] },
        { len: [6, 9], pct: [0.05, 0.06] },  // последний максимум
        { len: [7, 9], pct: [-0.09, -0.07] }, // пробит прошлый минимум
        { len: [4, 6], pct: [0.035, 0.05] },  // нижний максимум
        { len: [7, 10], pct: [-0.08, -0.06] }
      ]);
      return { pivots: pv, meta: { trend: "reversal", title: "Смена тренда" } };
    },
    "pullback-entry": function (R) {
      // Восходящий тренд и откат к уровню. Что будет дальше — заранее неизвестно (исход выбирается случайно).
      var pv = legs(R, 100, [
        { len: [8, 11], pct: [0.07, 0.09] }, { len: [4, 6], pct: [-0.04, -0.03] },
        { len: [8, 11], pct: [0.07, 0.09] }, { len: [4, 6], pct: [-0.04, -0.03] },
        { len: [8, 10], pct: [0.06, 0.08] }
      ]);
      var lastHigh = pv[pv.length - 1].p, prevHigh = pv[pv.length - 3].p;
      var pbIdx = pv[pv.length - 1].i + R.int(5, 7);
      pv.push({ i: pbIdx, p: prevHigh * (1 + R.range(-0.004, 0.006)) }); // откат к бывшему сопротивлению
      var cut = pbIdx + 2;
      var success = R.chance(0.55);
      if (success) {
        pv.push({ i: pbIdx + R.int(8, 11), p: lastHigh * (1 + R.range(0.04, 0.07)) });
        pv.push({ i: pbIdx + R.int(14, 17), p: lastHigh * 1.01 });
        pv.push({ i: pbIdx + 22, p: lastHigh * (1 + R.range(0.08, 0.12)) });
      } else {
        pv.push({ i: pbIdx + R.int(4, 6), p: prevHigh * 1.035 });
        pv.push({ i: pbIdx + R.int(12, 15), p: prevHigh * (1 - R.range(0.07, 0.1)) });
        pv.push({ i: pbIdx + 22, p: prevHigh * 0.97 });
      }
      return { pivots: pv, meta: { title: "Откат в тренде", cut: cut, outcome: success ? "up" : "down", support: prevHigh, lastHigh: lastHigh, pullbackIndex: pbIdx } };
    },
    "pump-dump": function (R) {
      var pv = legs(R, 100, [
        { len: [10, 14], pct: [0.02, 0.03] }, { len: [8, 10], pct: [-0.03, -0.02] },
        { len: [6, 8], pct: [0.02, 0.03] }, { len: [7, 9], pct: [0.55, 0.8] },
        { len: [2, 3], pct: [-0.12, -0.08] }, { len: [2, 3], pct: [0.05, 0.08] },
        { len: [8, 10], pct: [-0.45, -0.38] }, { len: [6, 8], pct: [0.05, 0.08] }
      ]);
      var pumpStart = pv[3].i;
      return { pivots: pv, vol: 0.012, spikes: [{ from: pumpStart, to: pv[6].i, mult: 4 }], meta: { title: "Памп и дамп", pumpStart: pumpStart, top: pv[4].i } };
    },
    "volume-divergence": function (R) {
      var pv = trendPivots(R, 1, 3);
      var last = pv[pv.length - 1].i;
      return { pivots: pv, volumeTrend: { from: Math.floor(last * 0.55), to: last, mult: 0.35 }, meta: { trend: "up", title: "Рост на падающем объёме" } };
    }
  };

  function scenario(name, seed, opts) {
    opts = opts || {};
    var make = SCENARIOS[name];
    if (!make) throw new Error("Неизвестный сценарий: " + name);
    var R = CA.rng.create(name + ":" + seed);
    var spec = make(R);
    var scale = opts.price || 100;
    var pivots = spec.pivots.map(function (p) {
      var o = { i: p.i, p: p.p * scale / 100 };
      if (p.close != null) o.close = p.close * scale / 100;
      return o;
    });
    var candles = fromPivots(pivots, { seed: name + "#" + seed, vol: spec.vol || opts.vol || 0.006, tf: opts.tf || 60, volumeSpikes: spec.spikes, volumeTrend: spec.volumeTrend });
    var meta = JSON.parse(JSON.stringify(spec.meta));
    if (meta.levels) meta.levels.forEach(function (l) { l.price = l.price * scale / 100; });
    ["support", "lastHigh"].forEach(function (k) { if (meta[k]) meta[k] = meta[k] * scale / 100; });
    meta.pivots = pivots.map(function (p) { return { i: p.i, p: p.p }; });
    if (spec.post) spec.post(candles, meta);
    if (spec.mirror) {
      var K = scale;
      candles = mirror(candles, K);
      meta.pivots = meta.pivots.map(function (p) { return { i: p.i, p: K * K / p.p }; });
      if (meta.levels) meta.levels = meta.levels.map(function (l) { return { type: l.type === "support" ? "resistance" : "support", price: K * K / l.price }; });
    }
    meta.name = name; meta.seed = seed; meta.synthetic = true;
    return { candles: candles, meta: meta };
  }

  var api = {
    DATA_LABEL: DATA_LABEL, fromPivots: fromPivots, randomWalk: randomWalk, mirror: mirror,
    aggregate: aggregate, scenario: scenario, scenarioNames: Object.keys(SCENARIOS), round: round
  };
  CA.market = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
