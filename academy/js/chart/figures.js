/* SVG-иллюстрации к урокам: анатомия свечи, паттерны, структура тренда, блокчейн, R:R и др. */
(function (g) {
  "use strict";
  var CA = g.CA || (g.CA = {});
  var UP = "#26a69a", DN = "#ef5350", TX = "#c3c9d1", MU = "#8b939e", AC = "#3d8bff", WA = "#f0b429", LN = "#343d48";

  function svg(w, h, body, label) {
    return '<svg viewBox="0 0 ' + w + " " + h + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + (label || "Иллюстрация") + '" font-family="Inter, system-ui, sans-serif">' + body + "</svg>";
  }
  function t(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" fill="' + (o.c || TX) + '" font-size="' + (o.s || 12) + '" text-anchor="' + (o.a || "start") + '"' + (o.w ? ' font-weight="' + o.w + '"' : "") + ">" + s + "</text>";
  }
  function ln(x1, y1, x2, y2, c, w, dash) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (c || LN) + '" stroke-width="' + (w || 1) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + "/>";
  }
  function rect(x, y, w, h, c, r) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"' + (r ? ' rx="' + r + '"' : "") + "/>"; }

  // Свеча в произвольных координатах: o,h,l,c — значения, y(v) — функция в пиксели
  function candleAt(x, bw, o, h, l, c, y, col) {
    col = col || (c >= o ? UP : DN);
    var top = Math.min(y(o), y(c)), bh = Math.max(2, Math.abs(y(o) - y(c)));
    return ln(x, y(h), x, y(l), col, 2) + rect(x - bw / 2, top, bw, bh, col, 1.5);
  }

  function anatomy() {
    var y = function (v) { return 30 + (120 - v) * 2.1; };
    var b = "";
    // бычья
    b += candleAt(130, 46, 60, 112, 40, 96, y, UP);
    b += ln(160, y(112), 205, y(112), MU, 1, "3 3") + t(210, y(112) + 4, "High — максимум");
    b += ln(160, y(96), 205, y(96), MU, 1, "3 3") + t(210, y(96) + 4, "Close — закрытие");
    b += ln(160, y(60), 205, y(60), MU, 1, "3 3") + t(210, y(60) + 4, "Open — открытие");
    b += ln(160, y(40), 205, y(40), MU, 1, "3 3") + t(210, y(40) + 4, "Low — минимум");
    b += t(95, y(104), "Верхняя тень", { a: "end", c: MU, s: 11 }) + t(95, y(78), "Тело", { a: "end", c: MU, s: 11 }) + t(95, y(50), "Нижняя тень", { a: "end", c: MU, s: 11 });
    b += t(130, 290, "Растущая (зелёная)", { a: "middle", w: 600, c: UP });
    // медвежья
    b += candleAt(470, 46, 96, 112, 40, 60, y, DN);
    b += ln(440, y(112), 395, y(112), MU, 1, "3 3") + t(390, y(112) + 4, "High", { a: "end" });
    b += ln(440, y(96), 395, y(96), MU, 1, "3 3") + t(390, y(96) + 4, "Open", { a: "end" });
    b += ln(440, y(60), 395, y(60), MU, 1, "3 3") + t(390, y(60) + 4, "Close", { a: "end" });
    b += ln(440, y(40), 395, y(40), MU, 1, "3 3") + t(390, y(40) + 4, "Low", { a: "end" });
    b += t(470, 290, "Падающая (красная)", { a: "middle", w: 600, c: DN });
    return svg(600, 305, b, "Строение японской свечи: открытие, закрытие, максимум, минимум, тело и тени");
  }

  var PATTERNS = {
    doji: { o: 50, h: 75, l: 25, c: 50.6, name: "Доджи", text: "Открытие ≈ закрытие" },
    hammer: { o: 62, h: 68, l: 20, c: 67, name: "Молот", text: "Длинная нижняя тень" },
    star: { o: 38, h: 80, l: 32, c: 33, name: "Падающая звезда", text: "Длинная верхняя тень" },
    bullMarubozu: { o: 25, h: 76, l: 24, c: 75, name: "Марубозу (рост)", text: "Почти без теней" },
    bearMarubozu: { o: 75, h: 76, l: 24, c: 25, name: "Марубозу (падение)", text: "Почти без теней" },
    spinning: { o: 47, h: 78, l: 22, c: 53, name: "Волчок", text: "Маленькое тело, обе тени" }
  };
  function single(o, h, l, c, opts) {
    opts = opts || {};
    var lo = Math.min(l, opts.min == null ? l : opts.min), hi = Math.max(h, opts.max == null ? h : opts.max);
    var H = opts.h || 120, pad = 10;
    var y = function (v) { return pad + (hi - v) / (hi - lo || 1) * (H - pad * 2); };
    return svg(60, H, candleAt(30, 20, o, h, l, c, y), opts.label || "Свеча");
  }
  function patterns() {
    var keys = Object.keys(PATTERNS), b = "";
    keys.forEach(function (k, i) {
      var p = PATTERNS[k], x = 55 + i * 100;
      var y = function (v) { return 20 + (90 - v) * 2.2; };
      b += candleAt(x, 26, p.o, p.h, p.l, p.c, y);
      b += t(x, 222, p.name, { a: "middle", s: 11.5, w: 600 }) + t(x, 238, p.text, { a: "middle", s: 10, c: MU });
    });
    return svg(600, 250, b, "Основные формы свечей");
  }

  function zigzag(points, opts) {
    opts = opts || {};
    var W = opts.w || 600, H = opts.h || 240;
    var xs = points.map(function (p) { return p[0]; }), ys = points.map(function (p) { return p[1]; });
    var mnx = Math.min.apply(null, xs), mxx = Math.max.apply(null, xs), mny = Math.min.apply(null, ys), mxy = Math.max.apply(null, ys);
    var X = function (v) { return 30 + (v - mnx) / (mxx - mnx) * (W - 60); }, Y = function (v) { return 30 + (mxy - v) / (mxy - mny) * (H - 60); };
    var b = "";
    (opts.levels || []).forEach(function (lv) { b += ln(10, Y(lv.y), W - 10, Y(lv.y), lv.c || AC, 1.5, "6 4") + t(W - 14, Y(lv.y) - 6, lv.label || "", { a: "end", c: lv.c || AC, s: 11 }); });
    var d = points.map(function (p, i) { return (i ? "L" : "M") + X(p[0]) + " " + Y(p[1]); }).join(" ");
    b += '<path d="' + d + '" fill="none" stroke="' + (opts.color || TX) + '" stroke-width="2.4" stroke-linejoin="round"/>';
    points.forEach(function (p) {
      if (!p[2]) return;
      var isHigh = p[3] !== "low";
      b += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="4" fill="' + (p[4] || (isHigh ? UP : DN)) + '"/>';
      b += t(X(p[0]), Y(p[1]) + (isHigh ? -10 : 20), p[2], { a: "middle", s: 11.5, w: 650, c: p[4] || (isHigh ? UP : DN) });
    });
    return svg(W, H, b, opts.label || "Схема движения цены");
  }

  var FIGS = {
    "candle-anatomy": anatomy,
    "candle-patterns": patterns,
    "trend-up": function () { return zigzag([[0, 10], [2, 40, "HH", "high"], [3, 28, "HL", "low"], [5, 58, "HH", "high"], [6, 45, "HL", "low"], [8, 78, "HH", "high"], [9, 64, "HL", "low"], [10, 86]], { label: "Восходящий тренд: повышающиеся максимумы и минимумы" }); },
    "trend-down": function () { return zigzag([[0, 86], [2, 56, "LL", "low"], [3, 68, "LH", "high"], [5, 38, "LL", "low"], [6, 52, "LH", "high"], [8, 20, "LL", "low"], [9, 32, "LH", "high"], [10, 10]], { label: "Нисходящий тренд" }); },
    "trend-range": function () { return zigzag([[0, 50], [1, 78, "", "high"], [2, 24, "", "low"], [3, 76, "", "high"], [4, 26, "", "low"], [5, 79, "", "high"], [6, 23, "", "low"], [7, 77, "", "high"], [8, 50]], { levels: [{ y: 79, label: "Сопротивление", c: DN }, { y: 23, label: "Поддержка", c: UP }], label: "Боковое движение" }); },
    "sr-flip": function () { return zigzag([[0, 20], [1, 60, "", "high"], [2, 38], [3, 61, "", "high"], [4, 40], [5, 85, "пробой", "high", WA], [6, 62, "ретест", "low", AC], [7, 95]], { levels: [{ y: 61, label: "Сопротивление → поддержка", c: AC }], label: "Пробитое сопротивление становится поддержкой" }); },
    "false-break": function () { return zigzag([[0, 40], [1, 70, "", "high"], [2, 42], [3, 70, "", "high"], [4, 45], [5, 80, "ложный пробой", "high", WA], [5.4, 66], [7, 30]], { levels: [{ y: 70, label: "Сопротивление", c: DN }], label: "Ложный пробой" }); },
    "reversal": function () { return zigzag([[0, 10], [2, 45, "HH", "high"], [3, 30, "HL", "low"], [5, 70, "HH", "high"], [6, 52, "HL", "low"], [8, 80, "HH", "high"], [10, 44, "LL — слом", "low", WA], [11, 62, "LH", "high"], [13, 25]], { label: "Смена тренда: нижний минимум и нижний максимум" }); },
    "blockchain": function () {
      var b = "", names = ["Блок 1 041", "Блок 1 042", "Блок 1 043"], hashes = ["00a3…f1", "00c9…7b", "0071…e4"], prev = ["0095…2c", "00a3…f1", "00c9…7b"];
      names.forEach(function (n, i) {
        var x = 20 + i * 200;
        b += rect(x, 40, 160, 150, "#1c2128", 10) + '<rect x="' + x + '" y="40" width="160" height="150" rx="10" fill="none" stroke="' + LN + '"/>';
        b += t(x + 14, 66, n, { w: 650 }) + t(x + 14, 92, "Пред. хэш: " + prev[i], { s: 11, c: i ? WA : MU }) + t(x + 14, 114, "Транзакции: 2 418", { s: 11, c: MU }) + t(x + 14, 136, "Время: 10:" + (14 + i * 10), { s: 11, c: MU }) + t(x + 14, 170, "Хэш: " + hashes[i], { s: 11.5, c: AC, w: 600 });
        if (i < 2) b += '<path d="M' + (x + 160) + ' 115 L' + (x + 200) + ' 115" stroke="' + WA + '" stroke-width="2" marker-end="url(#ar)"/>';
      });
      return svg(620, 230, '<defs><marker id="ar" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8z" fill="' + WA + '"/></marker></defs>' + b + t(310, 220, "Каждый блок хранит хэш предыдущего: изменить старый блок незаметно нельзя", { a: "middle", s: 11.5, c: MU }), "Цепочка блоков");
    },
    "rr": function () {
      var b = "";
      b += rect(60, 30, 300, 120, "rgba(38,166,154,.18)") + rect(60, 150, 300, 60, "rgba(239,83,80,.2)");
      b += ln(60, 150, 360, 150, TX, 2) + ln(60, 30, 360, 30, UP, 1.5, "5 4") + ln(60, 210, 360, 210, DN, 1.5, "5 4");
      b += t(372, 34, "Take Profit 112", { c: UP, w: 600 }) + t(372, 154, "Вход 100", { w: 600 }) + t(372, 214, "Stop Loss 96", { c: DN, w: 600 });
      b += t(210, 95, "Потенциал: +12 (3R)", { a: "middle", c: UP, w: 650 }) + t(210, 186, "Риск: −4 (1R)", { a: "middle", c: DN, w: 650 });
      return svg(560, 240, b, "Соотношение риска и прибыли 1 к 3");
    },
    "recovery": function () {
      var data = [[10, 11.1], [20, 25], [30, 42.9], [50, 100], [70, 233], [90, 900]], b = "";
      data.forEach(function (d, i) {
        var x = 40 + i * 92, hD = d[0] * 1.6, hR = Math.min(170, Math.log10(1 + d[1]) * 58);
        b += rect(x, 200 - hD, 30, hD, DN, 3) + rect(x + 34, 200 - hR, 30, hR, UP, 3);
        b += t(x + 15, 194 - hD, "−" + d[0] + "%", { a: "middle", s: 10.5, c: DN }) + t(x + 49, 194 - hR, "+" + d[1] + "%", { a: "middle", s: 10.5, c: UP });
      });
      b += ln(20, 200, 590, 200, LN) + t(300, 225, "Красное — просадка, зелёное — рост, нужный чтобы вернуться к исходному капиталу", { a: "middle", s: 11, c: MU });
      return svg(600, 235, b, "Восстановление после просадки");
    },
    "orderbook": function () {
      var asks = [[100.6, 2.1], [100.5, 4.8], [100.4, 1.2], [100.3, 3.5], [100.2, 0.8]], bids = [[100.0, 1.6], [99.9, 3.9], [99.8, 2.4], [99.7, 5.2], [99.6, 1.1]], b = "";
      b += t(20, 22, "Цена", { c: MU, s: 11 }) + t(170, 22, "Объём", { c: MU, s: 11, a: "end" });
      asks.forEach(function (a, i) { var y = 30 + i * 22; b += rect(180 - a[1] * 22, y, a[1] * 22, 18, "rgba(239,83,80,.2)") + t(20, y + 13, a[0].toFixed(1), { c: DN, s: 12 }) + t(170, y + 13, a[1].toFixed(1), { s: 12, a: "end" }); });
      b += t(20, 158, "Спред 0,2 (0,2%)", { c: WA, s: 11.5, w: 600 });
      bids.forEach(function (a, i) { var y = 168 + i * 22; b += rect(180 - a[1] * 22, y, a[1] * 22, 18, "rgba(38,166,154,.2)") + t(20, y + 13, a[0].toFixed(1), { c: UP, s: 12 }) + t(170, y + 13, a[1].toFixed(1), { s: 12, a: "end" }); });
      b += t(210, 80, "Asks — заявки на продажу.", { s: 12 }) + t(210, 98, "Лучшая цена покупки сейчас: 100,2", { s: 12, c: MU });
      b += t(210, 205, "Bids — заявки на покупку.", { s: 12 }) + t(210, 223, "Лучшая цена продажи сейчас: 100,0", { s: 12, c: MU });
      return svg(480, 285, b, "Биржевой стакан заявок");
    },
    "timeframes": function () {
      var c15 = [[100, 103, 99, 102], [102, 104, 101, 101.5], [101.5, 102, 98, 99], [99, 105, 98.5, 104.5]], b = "";
      var y = function (v) { return 30 + (106 - v) * 22; };
      c15.forEach(function (c, i) { b += candleAt(50 + i * 44, 22, c[0], c[1], c[2], c[3], y); });
      b += t(116, 230, "4 свечи по 15 минут", { a: "middle", s: 12, c: MU });
      b += '<path d="M230 120 L300 120" stroke="' + WA + '" stroke-width="2" marker-end="url(#ar2)"/>';
      b += candleAt(370, 40, 100, 105, 98, 104.5, y);
      b += t(370, 230, "= 1 свеча 1 час", { a: "middle", s: 12, c: MU });
      b += t(420, y(105) + 4, "H 105", { s: 11, c: MU }) + t(420, y(98) + 4, "L 98", { s: 11, c: MU }) + t(420, y(100) + 4, "O 100", { s: 11, c: MU }) + t(420, y(104.5) + 4, "C 104,5", { s: 11, c: MU });
      return svg(500, 245, '<defs><marker id="ar2" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8z" fill="' + WA + '"/></marker></defs>' + b, "Как свечи младшего таймфрейма складываются в свечу старшего");
    },
    "liquidation": function () {
      var b = "", rows = [[1, "нет"], [2, "−50%"], [5, "−20%"], [10, "−10%"], [20, "−5%"], [50, "−2%"], [100, "−1%"]];
      rows.forEach(function (r, i) {
        var x = 30 + i * 80, val = r[0] === 1 ? 0 : 100 / r[0], hgt = val * 1.6;
        b += rect(x, 190 - hgt, 44, Math.max(2, hgt), r[0] >= 20 ? DN : r[0] >= 5 ? WA : UP, 3);
        b += t(x + 22, 184 - hgt, r[1], { a: "middle", s: 11, w: 600 }) + t(x + 22, 210, "×" + r[0], { a: "middle", s: 12, c: MU });
      });
      b += t(300, 232, "Примерное движение цены против позиции до ликвидации (без учёта комиссий и поддерживающей маржи)", { a: "middle", s: 10.5, c: MU });
      return svg(600, 242, b, "Кредитное плечо и ликвидация");
    }
  };

  function render(name) { var f = FIGS[name]; return f ? f() : ""; }

  CA.figures = { render: render, single: single, PATTERNS: PATTERNS, candleAt: candleAt, svg: svg };
})(typeof globalThis !== "undefined" ? globalThis : this);
