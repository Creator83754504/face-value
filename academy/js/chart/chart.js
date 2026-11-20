/*
 * Свечной график на canvas (без библиотек).
 * Возможности: свечи, объём, оверлеи (линии и полосы), уровни, зоны, маркеры, вертикальные линии,
 * подокна RSI и MACD, кроссхейр с OHLC, перемещение (перетаскивание), масштаб (колесо, щипок),
 * клики по графику для интерактивных заданий (возвращает индекс свечи и цену).
 */
(function (g) {
  "use strict";
  var CA = g.CA || (g.CA = {});

  var AXIS_W = 62, AXIS_H = 22, SUB_H = 84;

  function css(name, fb) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fb;
  }
  function palette() {
    return {
      bg: css("--chart-bg", "#15181c"), grid: css("--chart-grid", "#22262c"), text: css("--muted", "#8b929b"),
      up: css("--up", "#26a69a"), down: css("--down", "#ef5350"), cross: css("--chart-cross", "#6b7380"),
      accent: css("--accent", "#3d8bff"), warn: css("--warn", "#f0b429"), strong: css("--text", "#e6e8eb")
    };
  }

  function fmtP(p) {
    var a = Math.abs(p);
    return a >= 1000 ? p.toFixed(0) : a >= 100 ? p.toFixed(1) : a >= 1 ? p.toFixed(2) : p.toFixed(4);
  }
  function fmtT(t, tf) {
    var d = new Date(t);
    var dd = String(d.getUTCDate()).padStart(2, "0") + "." + String(d.getUTCMonth() + 1).padStart(2, "0");
    if (tf >= 1440) return dd;
    return dd + " " + String(d.getUTCHours()).padStart(2, "0") + ":" + String(d.getUTCMinutes()).padStart(2, "0");
  }

  function Chart(container, opts) {
    var o = Object.assign({ height: 320, panes: ["volume"], overlays: [], bands: [], levels: [], markers: [], zones: [], vlines: [], rightPad: 3, pan: true, legend: true }, opts || {});
    var wrap = document.createElement("div");
    wrap.className = "chart";
    var canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", o.ariaLabel || "Свечной график. " + (o.dataLabel || "Синтетические учебные данные"));
    var legend = document.createElement("div");
    legend.className = "chart__legend";
    var badge = document.createElement("div");
    badge.className = "chart__badge";
    badge.textContent = o.dataLabel || "Синтетические данные";
    wrap.appendChild(canvas); wrap.appendChild(legend); wrap.appendChild(badge);
    container.appendChild(wrap);
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, dpr = 1, P = palette();
    var view = { from: 0, to: 0 };
    var hover = null, raf = 0, ro = null;
    var derived = {};

    function n() { return o.candles ? o.candles.length : 0; }
    function visibleEnd() { return o.limit != null ? Math.min(o.limit, n()) : n(); }

    function fit() {
      var end = visibleEnd();
      var count = o.visible || end;
      view.to = end + o.rightPad;
      view.from = Math.max(0, view.to - count - o.rightPad);
    }

    function computeDerived() {
      derived = {};
      if (!o.candles) return;
      var cl = o.candles.map(function (c) { return c.c; });
      if (o.panes.indexOf("rsi") >= 0) derived.rsi = CA.indicators.rsi(cl, 14);
      if (o.panes.indexOf("macd") >= 0) derived.macd = CA.indicators.macd(cl);
    }

    function layout() {
      var subs = o.panes.filter(function (p) { return p !== "volume"; });
      var mainH = H - AXIS_H - subs.length * SUB_H;
      var panes = [{ id: "main", top: 0, h: mainH }];
      subs.forEach(function (p, k) { panes.push({ id: p, top: mainH + k * SUB_H, h: SUB_H }); });
      return { plotW: W - AXIS_W, mainH: mainH, panes: panes };
    }

    function resize() {
      var r = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(200, Math.floor(r.width));
      H = o.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      draw();
    }

    function xOf(i, L) { var span = view.to - view.from; return (i - view.from + 0.5) * (L.plotW / span); }
    function iOf(x, L) { var span = view.to - view.from; return Math.floor(x / (L.plotW / span) + view.from); }

    function priceRange() {
      var lo = Infinity, hi = -Infinity, end = visibleEnd();
      for (var i = Math.max(0, Math.floor(view.from)); i < Math.min(end, Math.ceil(view.to)); i++) {
        var c = o.candles[i]; if (c.l < lo) lo = c.l; if (c.h > hi) hi = c.h;
        o.overlays.forEach(function (ov) { var v = ov.values[i]; if (v != null && ov.fit !== false) { lo = Math.min(lo, v); hi = Math.max(hi, v); } });
        o.bands.forEach(function (b) { if (b.upper[i] != null) { lo = Math.min(lo, b.lower[i]); hi = Math.max(hi, b.upper[i]); } });
      }
      (o.levels || []).forEach(function (l) { if (l.fit !== false) { lo = Math.min(lo, l.price); hi = Math.max(hi, l.price); } });
      (o.markers || []).forEach(function (m) { if (m.price != null && m.i >= view.from && m.i <= view.to) { lo = Math.min(lo, m.price); hi = Math.max(hi, m.price); } });
      if (o.extraRange) { lo = Math.min(lo, o.extraRange[0]); hi = Math.max(hi, o.extraRange[1]); }
      if (!isFinite(lo)) { lo = 0; hi = 1; }
      var pad = (hi - lo) * 0.08 || hi * 0.01;
      return { lo: lo - pad, hi: hi + pad };
    }

    var lastL = null, lastPR = null;
    function yOf(p, L, pr) { var volH = o.panes.indexOf("volume") >= 0 ? L.mainH * 0.0 : 0; return 8 + (pr.hi - p) / (pr.hi - pr.lo) * (L.mainH - 16 - volH); }
    function pOf(y, L, pr) { return pr.hi - (y - 8) / (L.mainH - 16) * (pr.hi - pr.lo); }

    function niceStep(range, target) {
      var raw = range / target, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
      return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
    }

    function draw() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    }

    function paint() {
      if (!W || !o.candles) return;
      var L = layout(), pr = priceRange();
      lastL = L; lastPR = pr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.textBaseline = "middle";
      var span = view.to - view.from, cw = L.plotW / span, end = visibleEnd();
      var i0 = Math.max(0, Math.floor(view.from)), i1 = Math.min(end, Math.ceil(view.to));

      // сетка и шкала цен
      var step = niceStep(pr.hi - pr.lo, Math.max(3, Math.floor(L.mainH / 55)));
      ctx.strokeStyle = P.grid; ctx.lineWidth = 1; ctx.fillStyle = P.text; ctx.textAlign = "left";
      for (var p = Math.ceil(pr.lo / step) * step; p <= pr.hi; p += step) {
        var y = Math.round(yOf(p, L, pr)) + 0.5;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(L.plotW, y); ctx.stroke();
        ctx.fillText(fmtP(p), L.plotW + 6, y);
      }
      // шкала времени
      var tf = o.tf || 60, every = Math.max(1, Math.ceil(80 / cw));
      ctx.textAlign = "center";
      for (var ti = i0 - (i0 % every); ti < i1; ti += every) {
        if (ti < 0) continue;
        var x = Math.round(xOf(ti, L)) + 0.5;
        ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H - AXIS_H); ctx.stroke();
        if (o.candles[ti]) ctx.fillText(o.timeLabels === "index" ? "#" + ti : fmtT(o.candles[ti].t, tf), x, H - AXIS_H / 2);
      }

      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, L.plotW, L.mainH); ctx.clip();

      // зоны
      (o.zones || []).forEach(function (z) {
        var y1 = yOf(z.from, L, pr), y2 = yOf(z.to, L, pr);
        ctx.fillStyle = z.color || "rgba(61,139,255,.12)";
        ctx.fillRect(0, Math.min(y1, y2), L.plotW, Math.abs(y2 - y1));
      });
      // выделение области свечей
      (o.spans || []).forEach(function (s) {
        ctx.fillStyle = s.color || "rgba(255,255,255,.05)";
        ctx.fillRect(xOf(s.from, L) - cw / 2, 0, (s.to - s.from + 1) * cw, L.mainH);
      });

      // объём (внизу основного окна)
      if (o.panes.indexOf("volume") >= 0) {
        var vmax = 0;
        for (var vi = i0; vi < i1; vi++) vmax = Math.max(vmax, o.candles[vi].v);
        var vh = L.mainH * 0.2;
        for (var vj = i0; vj < i1; vj++) {
          var cv = o.candles[vj], hh = vmax ? cv.v / vmax * vh : 0;
          ctx.fillStyle = (cv.c >= cv.o ? P.up : P.down) + "55";
          ctx.fillRect(xOf(vj, L) - cw * 0.35, L.mainH - hh, Math.max(1, cw * 0.7), hh);
        }
      }

      // полосы (Bollinger)
      (o.bands || []).forEach(function (b) {
        ctx.beginPath();
        var started = false;
        for (var k = i0; k < i1; k++) { if (b.upper[k] == null) continue; var xx = xOf(k, L), yy = yOf(b.upper[k], L, pr); if (!started) { ctx.moveTo(xx, yy); started = true; } else ctx.lineTo(xx, yy); }
        for (var k2 = i1 - 1; k2 >= i0; k2--) { if (b.lower[k2] == null) continue; ctx.lineTo(xOf(k2, L), yOf(b.lower[k2], L, pr)); }
        ctx.closePath(); ctx.fillStyle = b.fill || "rgba(61,139,255,.07)"; ctx.fill();
        [b.upper, b.lower, b.mid].forEach(function (arr, idx) { if (arr) line(arr, idx === 2 ? (b.midColor || b.color) : b.color, 1, L, pr, i0, i1, idx === 2 ? [4, 3] : null); });
      });

      // свечи
      var faded = o.fadeFrom;
      for (var i = i0; i < i1; i++) {
        var c = o.candles[i], up = c.c >= c.o, col = up ? P.up : P.down;
        var cx = xOf(i, L), yo = yOf(c.o, L, pr), yc = yOf(c.c, L, pr), yh = yOf(c.h, L, pr), yl = yOf(c.l, L, pr);
        ctx.globalAlpha = faded != null && i >= faded ? 0.35 : 1;
        if (o.highlight && o.highlight.indexOf(i) >= 0) {
          ctx.fillStyle = "rgba(240,180,41,.16)"; ctx.fillRect(cx - cw / 2, 0, cw, L.mainH);
        }
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = Math.max(1, Math.min(2, cw * 0.12));
        ctx.beginPath(); ctx.moveTo(Math.round(cx) + 0.5, yh); ctx.lineTo(Math.round(cx) + 0.5, yl); ctx.stroke();
        var bw = Math.max(1, cw * 0.68), top = Math.min(yo, yc), bh = Math.max(1, Math.abs(yc - yo));
        ctx.fillRect(cx - bw / 2, top, bw, bh);
      }
      ctx.globalAlpha = 1;

      // линии-оверлеи
      (o.overlays || []).forEach(function (ov) { line(ov.values, ov.color || P.accent, ov.width || 1.6, L, pr, i0, i1, ov.dash); });

      // вертикальные линии
      (o.vlines || []).forEach(function (v) {
        var x2 = Math.round(xOf(v.i, L)) + 0.5;
        ctx.strokeStyle = v.color || P.warn; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x2, 0); ctx.lineTo(x2, L.mainH); ctx.stroke(); ctx.setLineDash([]);
        if (v.label) { ctx.fillStyle = v.color || P.warn; ctx.textAlign = "left"; ctx.fillText(v.label, x2 + 4, 12); }
      });

      // уровни
      (o.levels || []).forEach(function (lv) {
        var y3 = Math.round(yOf(lv.price, L, pr)) + 0.5;
        ctx.strokeStyle = lv.color || P.accent; ctx.lineWidth = lv.width || 1.5;
        ctx.setLineDash(lv.dash === false ? [] : (lv.dash || [6, 4]));
        var xs = lv.from != null ? xOf(lv.from, L) : 0;
        ctx.beginPath(); ctx.moveTo(xs, y3); ctx.lineTo(L.plotW, y3); ctx.stroke(); ctx.setLineDash([]);
        if (lv.label) {
          ctx.font = "600 11px system-ui, sans-serif";
          var tw = ctx.measureText(lv.label).width + 10;
          ctx.fillStyle = lv.color || P.accent; ctx.globalAlpha = 0.9;
          ctx.fillRect(L.plotW - tw - 4, y3 - 9, tw, 18); ctx.globalAlpha = 1;
          ctx.fillStyle = "#0d0f12"; ctx.textAlign = "left"; ctx.fillText(lv.label, L.plotW - tw + 1, y3);
          ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
        }
      });

      // маркеры
      (o.markers || []).forEach(function (m) {
        if (m.i < i0 - 1 || m.i > i1) return;
        var mx = xOf(m.i, L), c2 = o.candles[Math.min(m.i, n() - 1)];
        var price = m.price != null ? m.price : (m.kind === "sell" ? c2.h : c2.l);
        var my = yOf(price, L, pr), col2 = m.color || (m.kind === "sell" ? P.down : m.kind === "buy" ? P.up : P.warn);
        ctx.fillStyle = col2; ctx.strokeStyle = col2;
        if (m.kind === "buy" || m.kind === "sell") {
          var dir = m.kind === "buy" ? 1 : -1, base = my + dir * (m.price != null ? 0 : 6);
          ctx.beginPath(); ctx.moveTo(mx, base); ctx.lineTo(mx - 6, base + dir * 10); ctx.lineTo(mx + 6, base + dir * 10); ctx.closePath(); ctx.fill();
          if (m.text) { ctx.textAlign = "center"; ctx.fillText(m.text, mx, base + dir * 20); }
        } else if (m.kind === "x") {
          ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mx - 5, my - 5); ctx.lineTo(mx + 5, my + 5); ctx.moveTo(mx + 5, my - 5); ctx.lineTo(mx - 5, my + 5); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.arc(mx, my, m.r || 5, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = P.bg; ctx.lineWidth = 1.5; ctx.stroke();
          if (m.text) { ctx.fillStyle = col2; ctx.textAlign = "center"; ctx.fillText(m.text, mx, my + (m.textBelow ? 14 : -13)); }
        }
      });
      ctx.restore();

      // подокна
      L.panes.slice(1).forEach(function (pane) { paintSub(pane, L, i0, i1); });

      // подписи цены уровней на шкале
      (o.levels || []).forEach(function (lv) {
        var y4 = yOf(lv.price, L, pr);
        if (y4 < 0 || y4 > L.mainH) return;
        ctx.fillStyle = lv.color || P.accent; ctx.fillRect(L.plotW, y4 - 9, AXIS_W, 18);
        ctx.fillStyle = "#0d0f12"; ctx.textAlign = "left"; ctx.fillText(fmtP(lv.price), L.plotW + 6, y4);
      });
      // последняя цена
      var lastC = o.candles[end - 1];
      if (lastC && o.showLast !== false) {
        var yl2 = yOf(lastC.c, L, pr);
        if (yl2 > 0 && yl2 < L.mainH) {
          ctx.fillStyle = lastC.c >= lastC.o ? P.up : P.down; ctx.fillRect(L.plotW, yl2 - 9, AXIS_W, 18);
          ctx.fillStyle = "#fff"; ctx.fillText(fmtP(lastC.c), L.plotW + 6, yl2);
        }
      }

      // кроссхейр
      if (hover && hover.x < L.plotW) {
        ctx.strokeStyle = P.cross; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
        var hx = Math.round(xOf(hover.i, L)) + 0.5;
        ctx.beginPath(); ctx.moveTo(hx, 0); ctx.lineTo(hx, H - AXIS_H); ctx.stroke();
        if (hover.y < L.mainH) { ctx.beginPath(); ctx.moveTo(0, Math.round(hover.y) + 0.5); ctx.lineTo(L.plotW, Math.round(hover.y) + 0.5); ctx.stroke(); }
        ctx.setLineDash([]);
        if (hover.y < L.mainH) {
          ctx.fillStyle = "#39404a"; ctx.fillRect(L.plotW, hover.y - 9, AXIS_W, 18);
          ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.fillText(fmtP(pOf(hover.y, L, pr)), L.plotW + 6, hover.y);
        }
      }
      updateLegend();
    }

    function line(values, color, width, L, pr, i0, i1, dash) {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash || []);
      ctx.beginPath();
      var started = false;
      for (var k = i0; k < i1; k++) {
        var v = values[k]; if (v == null) { started = false; continue; }
        var x = xOf(k, L), y = yOf(v, L, pr);
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.setLineDash([]);
    }

    function paintSub(pane, L, i0, i1) {
      var top = pane.top, h = pane.h;
      ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(0, top + 0.5); ctx.lineTo(W, top + 0.5); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.rect(0, top, L.plotW, h); ctx.clip();
      ctx.fillStyle = P.text; ctx.textAlign = "left";
      if (pane.id === "rsi" && derived.rsi) {
        var yR = function (v) { return top + 6 + (100 - v) / 100 * (h - 12); };
        ctx.fillStyle = "rgba(61,139,255,.06)"; ctx.fillRect(0, yR(70), L.plotW, yR(30) - yR(70));
        [30, 50, 70].forEach(function (lv) { ctx.strokeStyle = lv === 50 ? P.grid : P.cross; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(0, yR(lv)); ctx.lineTo(L.plotW, yR(lv)); ctx.stroke(); });
        ctx.setLineDash([]);
        ctx.strokeStyle = "#b388ff"; ctx.lineWidth = 1.5; ctx.beginPath();
        var st = false;
        for (var k = i0; k < i1; k++) { var v = derived.rsi[k]; if (v == null) continue; var x = xOf(k, L), y = yR(v); if (!st) { ctx.moveTo(x, y); st = true; } else ctx.lineTo(x, y); }
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = P.text; ctx.fillText("70", L.plotW + 6, yR(70)); ctx.fillText("30", L.plotW + 6, yR(30));
        ctx.fillText("RSI 14", 6, top + 12);
        var lr = derived.rsi[Math.min(visibleEnd(), n()) - 1];
        if (lr != null) ctx.fillText(lr.toFixed(1), 54, top + 12);
        return;
      }
      if (pane.id === "macd" && derived.macd) {
        var m = derived.macd, mx = 0;
        for (var k2 = i0; k2 < i1; k2++) { if (m.macd[k2] != null) mx = Math.max(mx, Math.abs(m.macd[k2]), Math.abs(m.signal[k2] || 0)); }
        mx = mx || 1;
        var yM = function (v) { return top + h / 2 - v / mx * (h / 2 - 6); };
        ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(0, yM(0)); ctx.lineTo(L.plotW, yM(0)); ctx.stroke();
        var cw = L.plotW / (view.to - view.from);
        for (var k3 = i0; k3 < i1; k3++) {
          var hv = m.hist[k3]; if (hv == null) continue;
          ctx.fillStyle = (hv >= 0 ? P.up : P.down) + "88";
          var y0 = yM(0), y1 = yM(hv);
          ctx.fillRect(xOf(k3, L) - cw * 0.35, Math.min(y0, y1), Math.max(1, cw * 0.7), Math.abs(y1 - y0));
        }
        [[m.macd, "#3d8bff"], [m.signal, "#f0b429"]].forEach(function (pair) {
          ctx.strokeStyle = pair[1]; ctx.lineWidth = 1.4; ctx.beginPath();
          var s2 = false;
          for (var k4 = i0; k4 < i1; k4++) { var v2 = pair[0][k4]; if (v2 == null) continue; var x2 = xOf(k4, L), y2 = yM(v2); if (!s2) { ctx.moveTo(x2, y2); s2 = true; } else ctx.lineTo(x2, y2); }
          ctx.stroke();
        });
        ctx.restore();
        ctx.fillStyle = P.text; ctx.fillText("MACD 12 26 9", 6, top + 12);
        return;
      }
      ctx.restore();
    }

    function updateLegend() {
      if (!o.legend) { legend.textContent = ""; return; }
      var i = hover ? hover.i : visibleEnd() - 1;
      var c = o.candles[i];
      if (!c || i >= visibleEnd()) { legend.innerHTML = ""; return; }
      var up = c.c >= c.o, ch = (c.c - c.o) / c.o * 100;
      var parts = [
        o.title ? "<b>" + o.title + "</b>" : "",
        "O <span>" + fmtP(c.o) + "</span>", "H <span>" + fmtP(c.h) + "</span>", "L <span>" + fmtP(c.l) + "</span>", "C <span>" + fmtP(c.c) + "</span>",
        "<span class='" + (up ? "up" : "down") + "'>" + (ch >= 0 ? "+" : "") + ch.toFixed(2) + "%</span>"
      ];
      (o.overlays || []).forEach(function (ov) { if (ov.label && ov.values[i] != null) parts.push("<span style='color:" + ov.color + "'>" + ov.label + " " + fmtP(ov.values[i]) + "</span>"); });
      legend.innerHTML = parts.filter(Boolean).join(" ");
    }

    // ───── Взаимодействие ─────
    var drag = null, pinch = null, pointers = {};
    function local(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function hit(pt) {
      if (!lastL) return null;
      var i = iOf(pt.x, lastL);
      return { i: Math.max(0, Math.min(visibleEnd() - 1, i)), rawI: i, x: pt.x, y: pt.y, price: pOf(pt.y, lastL, lastPR), inMain: pt.y < lastL.mainH && pt.x < lastL.plotW };
    }
    canvas.addEventListener("pointerdown", function (e) {
      pointers[e.pointerId] = local(e);
      var ids = Object.keys(pointers);
      if (ids.length === 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        pinch = { d: Math.abs(a.x - b.x) || 1, from: view.from, to: view.to };
        drag = null;
      } else {
        drag = { x: pointers[e.pointerId].x, y: pointers[e.pointerId].y, from: view.from, to: view.to, moved: false, id: e.pointerId };
      }
    });
    canvas.addEventListener("pointermove", function (e) {
      var pt = local(e);
      if (pointers[e.pointerId]) pointers[e.pointerId] = pt;
      if (pinch && Object.keys(pointers).length === 2) {
        var ids = Object.keys(pointers), a = pointers[ids[0]], b = pointers[ids[1]];
        var d = Math.abs(a.x - b.x) || 1, span = (pinch.to - pinch.from) * pinch.d / d;
        zoomTo(span, (pinch.from + pinch.to) / 2);
        return;
      }
      if (drag && drag.id === e.pointerId) {
        var dx = pt.x - drag.x;
        if (Math.abs(dx) > 4 || Math.abs(pt.y - drag.y) > 4) drag.moved = true;
        if (o.pan && drag.moved && lastL && Math.abs(dx) > Math.abs(pt.y - drag.y)) {
          var shift = dx / (lastL.plotW / (drag.to - drag.from));
          setRange(drag.from - shift, drag.to - shift);
          if (e.pointerType !== "mouse") e.preventDefault();
          return;
        }
      }
      if (e.pointerType === "mouse" || !drag) { var h2 = hit(pt); hover = h2 && h2.rawI >= 0 ? h2 : null; draw(); if (o.onHover) o.onHover(hover); }
    });
    function end(e) {
      var wasDrag = drag && drag.id === e.pointerId ? drag : null;
      delete pointers[e.pointerId];
      if (Object.keys(pointers).length < 2) pinch = null;
      if (wasDrag) {
        drag = null;
        if (!wasDrag.moved && e.type === "pointerup") {
          var h3 = hit(local(e));
          if (e.pointerType !== "mouse") { hover = h3; draw(); }
          if (h3 && h3.inMain && o.onClick) o.onClick(h3);
        }
      }
    }
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    canvas.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { hover = null; draw(); } });
    canvas.addEventListener("wheel", function (e) {
      if (!o.pan || !lastL) return;
      e.preventDefault();
      var pt = local(e), center = view.from + pt.x / lastL.plotW * (view.to - view.from);
      var span = (view.to - view.from) * (e.deltaY > 0 ? 1.12 : 0.89);
      zoomTo(span, center, pt.x / lastL.plotW);
    }, { passive: false });

    function setRange(from, to) {
      var span = to - from, max = visibleEnd() + o.rightPad + 10;
      if (from < -5) { from = -5; to = from + span; }
      if (to > max) { to = max; from = to - span; }
      view.from = from; view.to = to; draw();
    }
    function zoomTo(span, center, frac) {
      span = Math.max(12, Math.min(Math.max(30, visibleEnd() + o.rightPad + 10), span));
      frac = frac == null ? 0.5 : frac;
      setRange(center - span * frac, center + span * (1 - frac));
    }

    var api = {
      el: wrap,
      update: function (patch) {
        var dataChanged = patch.candles && patch.candles !== o.candles;
        var panesChanged = patch.panes && patch.panes.join() !== o.panes.join();
        var limitChanged = patch.limit != null && patch.limit !== o.limit;
        var prevEnd = visibleEnd();
        Object.assign(o, patch);
        if (dataChanged || panesChanged) computeDerived();
        if (dataChanged || patch.refit) fit();
        else if (limitChanged) { var d = visibleEnd() - prevEnd; if (view.to >= prevEnd - 1) { view.from += d; view.to += d; } }
        badge.textContent = o.dataLabel || "Синтетические данные";
        if (panesChanged || patch.height) resize(); else draw();
      },
      fit: function () { fit(); draw(); },
      zoom: function (k) { zoomTo((view.to - view.from) * k, (view.from + view.to) / 2); },
      redraw: function () { P = palette(); draw(); },
      view: function () { return { from: view.from, to: view.to }; },
      destroy: function () { if (ro) ro.disconnect(); cancelAnimationFrame(raf); wrap.remove(); }
    };

    computeDerived(); fit();
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(function () { resize(); }); ro.observe(wrap); }
    resize();
    return api;
  }

  // Простой линейный график (кривая капитала, бэктест)
  function LineChart(container, opts) {
    var o = Object.assign({ height: 180, series: [], baseline: null }, opts || {});
    var wrap = document.createElement("div"); wrap.className = "chart chart--line";
    var canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", o.ariaLabel || "Линейный график");
    wrap.appendChild(canvas); container.appendChild(wrap);
    var ctx = canvas.getContext("2d"), W = 0, H = o.height, dpr = 1, P = palette(), ro;
    function resize() {
      W = Math.max(200, Math.floor(wrap.getBoundingClientRect().width)); dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + "px"; canvas.style.height = H + "px"; paint();
    }
    function paint() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      var all = [];
      o.series.forEach(function (s) { all = all.concat(s.values.filter(function (v) { return v != null; })); });
      if (o.baseline != null) all.push(o.baseline);
      if (!all.length) { ctx.fillStyle = P.text; ctx.font = "13px system-ui"; ctx.textAlign = "center"; ctx.fillText(o.empty || "Пока нет данных", W / 2, H / 2); return; }
      var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), pad = (hi - lo) * 0.1 || hi * 0.01 || 1;
      lo -= pad; hi += pad;
      var pw = W - AXIS_W, y = function (v) { return 8 + (hi - v) / (hi - lo) * (H - 16); };
      ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
      var stp = (function (r) { var raw = r / 4, m = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / m; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m; })(hi - lo);
      for (var p = Math.ceil(lo / stp) * stp; p <= hi; p += stp) {
        ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(0, Math.round(y(p)) + 0.5); ctx.lineTo(pw, Math.round(y(p)) + 0.5); ctx.stroke();
        ctx.fillStyle = P.text; ctx.fillText(fmtP(p), pw + 6, y(p));
      }
      if (o.baseline != null) { ctx.strokeStyle = P.cross; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(0, y(o.baseline)); ctx.lineTo(pw, y(o.baseline)); ctx.stroke(); ctx.setLineDash([]); }
      o.series.forEach(function (s) {
        var len = s.values.length; if (len < 1) return;
        var x = function (i) { return len === 1 ? pw / 2 : i / (len - 1) * pw; };
        if (s.fill) {
          ctx.beginPath(); ctx.moveTo(x(0), y(s.values[0]));
          for (var i = 1; i < len; i++) ctx.lineTo(x(i), y(s.values[i]));
          ctx.lineTo(x(len - 1), H); ctx.lineTo(x(0), H); ctx.closePath();
          ctx.fillStyle = s.fill; ctx.fill();
        }
        ctx.strokeStyle = s.color || P.accent; ctx.lineWidth = s.width || 1.8; ctx.beginPath();
        ctx.moveTo(x(0), y(s.values[0]));
        for (var j = 1; j < len; j++) ctx.lineTo(x(j), y(s.values[j]));
        ctx.stroke();
        if (s.split != null && s.split > 0 && s.split < len) {
          ctx.strokeStyle = P.warn; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x(s.split), 0); ctx.lineTo(x(s.split), H); ctx.stroke(); ctx.setLineDash([]);
        }
      });
    }
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(resize); ro.observe(wrap); }
    resize();
    return {
      el: wrap,
      update: function (patch) { Object.assign(o, patch); paint(); },
      destroy: function () { if (ro) ro.disconnect(); wrap.remove(); }
    };
  }

  CA.Chart = Chart;
  CA.LineChart = LineChart;
})(typeof globalThis !== "undefined" ? globalThis : this);
