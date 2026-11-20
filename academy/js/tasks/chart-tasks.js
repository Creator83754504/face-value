/* Задания на графиках: свечи, тренд, уровни, точки, стоп, план сделки, чтение индикаторов. */
(function (g) {
  "use strict";
  var CA = g.CA;
  var h = CA.dom.h, fmt = CA.dom.fmt, fb = CA.taskFeedback, CS = CA.chartSpec;

  function rng() { return CA.rng.create(CS.newSeed()); }
  function lastAtr(candles, upto) { var a = CA.indicators.atr(candles.slice(0, upto), 14); return a[a.length - 1] || candles[upto - 1].c * 0.01; }

  // ───── Конструктор свечи ─────
  CA.tasks["candle-build"] = function (spec, api) {
    var wrap = h("div");
    var target, story;
    var R = rng();
    function newTarget() {
      if (spec.target && !target) target = spec.target;
      else {
        var o = R.int(30, 70), up = R.chance(0.5), body = R.int(5, 20), c = up ? o + body : o - body;
        target = { o: o, c: c, h: Math.max(o, c) + R.int(2, 12), l: Math.min(o, c) - R.int(2, 12) };
      }
      story = spec.story || ("За период цена открылась на <b>" + target.o + "</b>, поднималась до <b>" + target.h + "</b>, опускалась до <b>" + target.l + "</b> и закрылась на <b>" + target.c + "</b>. Постройте эту свечу.");
    }
    newTarget();
    var storyEl = h("p", { html: story });
    var vals = { o: 50, h: 60, l: 40, c: 55 };
    var svgBox = h("div");
    var outs = {};
    function draw() {
      var y = function (v) { return 10 + (100 - v) * 2; };
      var valid = vals.h >= Math.max(vals.o, vals.c) && vals.l <= Math.min(vals.o, vals.c);
      var grid = "";
      for (var v = 0; v <= 100; v += 20) grid += '<line x1="0" x2="160" y1="' + y(v) + '" y2="' + y(v) + '" stroke="#1f242b"/><text x="4" y="' + (y(v) - 3) + '" fill="#5d6672" font-size="9">' + v + "</text>";
      svgBox.innerHTML = CA.figures.svg(160, 220, grid + (valid ? CA.figures.candleAt(90, 34, vals.o, vals.h, vals.l, vals.c, y) : '<text x="80" y="110" fill="#ef5350" font-size="11" text-anchor="middle">High ниже тела</text><text x="80" y="126" fill="#ef5350" font-size="11" text-anchor="middle">или Low выше тела</text>'), "Ваша свеча");
    }
    var sliders = h("div", { class: "stack", style: { gap: "10px" } });
    [["o", "Open"], ["h", "High"], ["l", "Low"], ["c", "Close"]].forEach(function (p) {
      var out = h("output", null, String(vals[p[0]]));
      outs[p[0]] = out;
      var inp = h("input", { type: "range", min: 0, max: 100, step: 1, value: vals[p[0]], "aria-label": p[1], oninput: function (e) { vals[p[0]] = +e.target.value; out.textContent = e.target.value; draw(); } });
      sliders.appendChild(h("label", { class: "slider-row" }, h("b", null, p[1]), inp, out));
    });
    var res = h("div", { hidden: true });
    var check = h("button", { class: "btn btn--primary", onclick: function () {
      var wrong = [];
      if (vals.h < Math.max(vals.o, vals.c) || vals.l > Math.min(vals.o, vals.c)) { fb(res, false, "Свеча невозможна: максимум (High) не может быть ниже тела, а минимум (Low) — выше тела."); return; }
      ["o", "h", "l", "c"].forEach(function (k) { if (Math.abs(vals[k] - target[k]) > 0.5) wrong.push({ o: "Open", h: "High", l: "Low", c: "Close" }[k]); });
      if (!wrong.length) {
        fb(res, true, "Верно! Это " + (target.c >= target.o ? "<b class='up'>растущая</b> свеча: закрытие выше открытия, тело зелёное" : "<b class='down'>падающая</b> свеча: закрытие ниже открытия, тело красное") + ". Верхняя тень — " + (target.h - Math.max(target.o, target.c)) + ", нижняя — " + (Math.min(target.o, target.c) - target.l) + ".");
        api.pass();
      } else fb(res, false, "Не совпадают: <b>" + wrong.join(", ") + "</b>. Помните: тело свечи — между Open и Close, тени тянутся до High и Low.");
    } }, "Проверить");
    var again = h("button", { class: "btn", onclick: function () { newTarget(); storyEl.innerHTML = story; res.hidden = true; } }, "Другая свеча");
    wrap.appendChild(storyEl);
    wrap.appendChild(h("div", { class: "candle-builder" }, svgBox, sliders));
    wrap.appendChild(h("div", { class: "task__controls" }, check, again));
    wrap.appendChild(res);
    draw();
    return wrap;
  };

  // ───── Выбери свечу ─────
  function randomPickRound(R) {
    var kinds = [
      { q: "Найдите свечу, которая открылась на 40 и закрылась на 65.", make: function () { return [40, 70, 36, 65]; } },
      { q: "Найдите падающую свечу с длинной нижней тенью (покупатели выкупили часть падения).", make: function () { return [60, 62, 20, 52]; } },
      { q: "Найдите свечу, где цена почти не изменилась за период, но ходила широко в обе стороны.", make: function () { return [50, 78, 22, 50.5]; } },
      { q: "Найдите растущую свечу почти без теней (сильное движение весь период).", make: function () { return [25, 76, 24.5, 75.5]; } },
      { q: "Найдите свечу, у которой продавцы вернули цену вниз после роста: длинная верхняя тень, закрытие у минимума.", make: function () { return [38, 80, 34, 36]; } }
    ];
    var k = R.pick(kinds), right = k.make();
    var decoys = [[60, 64, 28, 32], [30, 62, 29, 58], [45, 55, 40, 52], [52, 70, 48, 66], [66, 68, 30, 34], [40, 46, 20, 44], [70, 74, 35, 40]];
    decoys = R.shuffle(decoys).slice(0, 3);
    var all = R.shuffle([right].concat(decoys));
    return { q: k.q, candles: all, correct: all.indexOf(right) };
  }
  CA.tasks["candle-pick"] = function (spec, api) {
    var wrap = h("div"), R = rng();
    var rounds = spec.rounds || null, idx = 0, total = rounds ? rounds.length : (spec.count || 3), score = 0;
    var qEl = h("p", { class: "q__text" }), grid = h("div", { class: "pick-grid" }), res = h("div", { hidden: true }), counter = h("span", { class: "task__status" });
    var cur;
    function show() {
      cur = rounds ? rounds[idx] : randomPickRound(R);
      qEl.textContent = cur.q;
      counter.textContent = "Вопрос " + (idx + 1) + " из " + total;
      grid.innerHTML = "";
      res.hidden = true;
      var lo = Math.min.apply(null, cur.candles.map(function (c) { return c[2]; })), hi = Math.max.apply(null, cur.candles.map(function (c) { return c[1]; }));
      cur.candles.forEach(function (c, i) {
        var b = h("button", { class: "pick", type: "button", html: CA.figures.single(c[0], c[1], c[2], c[3], { min: lo, max: hi, label: "Свеча " + (i + 1) }) + "<span>Вариант " + (i + 1) + "</span>", onclick: function () { answer(i, b); } });
        grid.appendChild(b);
      });
    }
    function answer(i, btn) {
      if (grid.dataset.locked) return;
      var ok = i === cur.correct;
      btn.classList.add(ok ? "is-correct" : "is-wrong");
      var c = cur.candles[cur.correct];
      if (ok) {
        score++;
        grid.dataset.locked = "1";
        fb(res, true, "Верно. O " + c[0] + " · H " + c[1] + " · L " + c[2] + " · C " + c[3] + (cur.explain ? ". " + cur.explain : ""));
        var next = h("button", { class: "btn btn--primary btn--sm", style: { marginTop: "10px" }, onclick: function () {
          delete grid.dataset.locked;
          idx++;
          if (idx >= total) { fb(res, true, "Все свечи определены верно!"); api.pass(); next.remove(); }
          else show();
        } }, idx + 1 >= total ? "Завершить" : "Следующий вопрос");
        res.appendChild(h("div", null, next));
      } else fb(res, false, "Не эта свеча. Посмотрите, где находятся открытие и закрытие (тело) и какой длины тени. Попробуйте ещё раз.");
    }
    wrap.appendChild(qEl); wrap.appendChild(grid); wrap.appendChild(h("div", { class: "task__controls" }, counter)); wrap.appendChild(res);
    show();
    return wrap;
  };

  // ───── Определи направление тренда ─────
  var TREND_TEXT = { up: "восходящий тренд", down: "нисходящий тренд", range: "боковое движение (флэт)" };
  CA.tasks["trend-id"] = function (spec, api) {
    var wrap = h("div"), rounds = spec.rounds || 4, need = spec.need || rounds - 1, idx = 0, score = 0, R = rng();
    var holder = h("div"), btns = h("div", { class: "btn-row", style: { marginTop: "10px" } }), res = h("div", { hidden: true }), counter = h("span", { class: "task__status" });
    var cur, chart;
    function show() {
      var sc = R.pick(spec.scenarios || ["uptrend", "downtrend", "range"]);
      if (chart) chart.chart.destroy();
      holder.innerHTML = "";
      chart = CS.mount(holder, { scenario: sc, price: R.pick([2.4, 85, 1600, 41000]), height: 260 }, { seed: CS.newSeed(), pan: false });
      cur = chart.data.meta.trend;
      counter.textContent = "График " + (idx + 1) + " из " + rounds + " · верно: " + score;
      btns.innerHTML = ""; res.hidden = true;
      [["up", "Восходящий"], ["down", "Нисходящий"], ["range", "Боковик"]].forEach(function (o) {
        btns.appendChild(h("button", { class: "btn", onclick: function () { answer(o[0]); } }, o[1]));
      });
    }
    function answer(a) {
      var ok = a === cur;
      if (ok) score++;
      chart.chart.update({ markers: cur === "range" ? [] : CS.pivotMarkers(chart.data.meta, chart.data.candles), levels: cur === "range" ? CS.metaLevels(chart.data.meta) : [] });
      var why = cur === "up" ? "Каждый новый максимум выше предыдущего (HH), каждый минимум — тоже выше (HL)." : cur === "down" ? "Максимумы понижаются (LH), минимумы тоже (LL)." : "Цена колеблется между поддержкой и сопротивлением, новых экстремумов нет.";
      fb(res, ok, (ok ? "Верно: " : "Здесь " ) + "<b>" + TREND_TEXT[cur] + "</b>. " + why);
      btns.innerHTML = "";
      idx++;
      if (idx >= rounds) {
        if (score >= need) { res.innerHTML += "<br><b>Итог: " + score + " из " + rounds + ". Задание выполнено.</b>"; api.pass(); }
        else { res.innerHTML += "<br><b>Итог: " + score + " из " + rounds + ". Нужно минимум " + need + ".</b>"; btns.appendChild(h("button", { class: "btn btn--primary", onclick: function () { idx = 0; score = 0; show(); } }, "Пройти заново")); }
      } else btns.appendChild(h("button", { class: "btn btn--primary", onclick: show }, "Следующий график"));
      counter.textContent = "Верно: " + score + " из " + idx;
    }
    wrap.appendChild(holder); wrap.appendChild(btns); wrap.appendChild(h("div", { class: "task__controls" }, counter)); wrap.appendChild(res);
    show();
    return wrap;
  };

  // ───── Разметка поддержки и сопротивления ─────
  CA.tasks["level-mark"] = function (spec, api) {
    var wrap = h("div"), holder = h("div"), res = h("div", { hidden: true });
    var mode = "support", placed = {}, chart, truth, S, Rz;
    var modeBtns = h("div", { class: "seg", role: "group", "aria-label": "Что отмечаем" });
    function setMode(m) { mode = m; Array.from(modeBtns.children).forEach(function (b) { b.classList.toggle("is-active", b.dataset.m === m); }); }
    [["support", "Поддержка"], ["resistance", "Сопротивление"]].forEach(function (p) {
      modeBtns.appendChild(h("button", { type: "button", dataset: { m: p[0] }, onclick: function () { setMode(p[0]); } }, p[1]));
    });
    function levels() {
      var out = [];
      if (placed.support != null) out.push({ price: placed.support, color: "#26a69a", label: "Ваша поддержка", fit: false });
      if (placed.resistance != null) out.push({ price: placed.resistance, color: "#ef5350", label: "Ваше сопротивление", fit: false });
      return out;
    }
    function load() {
      if (chart) chart.chart.destroy();
      holder.innerHTML = ""; placed = {}; res.hidden = true; setMode("support");
      chart = CS.mount(holder, { scenario: spec.scenario || "range", price: CA.rng.create(CS.newSeed()).pick([1.2, 64, 950, 27000]), height: spec.height || 300, cut: spec.scenario && spec.scenario !== "range" ? "breakout" : null }, {
        seed: CS.newSeed(), pan: false,
        onClick: function (pt) {
          placed[mode] = pt.price;
          if (mode === "support" && placed.resistance == null) setMode("resistance");
          chart.chart.update({ levels: levels() });
        }
      });
      truth = chart.data.meta.levels;
      S = truth.find(function (l) { return l.type === "support"; }).price;
      Rz = truth.find(function (l) { return l.type === "resistance"; }).price;
    }
    var check = h("button", { class: "btn btn--primary", onclick: function () {
      if (placed.support == null || placed.resistance == null) { fb(res, false, "Отметьте обе линии: сначала поддержку, затем сопротивление (кликните по графику на нужной цене)."); return; }
      var tol = (Rz - S) * 0.22, okS = Math.abs(placed.support - S) <= tol, okR = Math.abs(placed.resistance - Rz) <= tol;
      var msgs = [];
      msgs.push((okS ? "✓" : "✗") + " Поддержка: ваша " + fmt(placed.support) + ", зона касаний ≈ " + fmt(S));
      msgs.push((okR ? "✓" : "✗") + " Сопротивление: ваше " + fmt(placed.resistance) + ", зона касаний ≈ " + fmt(Rz));
      if (placed.support > placed.resistance) msgs.push("Поддержка должна быть ниже сопротивления: снизу цену покупают, сверху продают.");
      chart.chart.update({ levels: levels().concat(CS.metaLevels(chart.data.meta).map(function (l) { l.label = l.label + " (эталон)"; l.dash = [2, 3]; l.color = "#f0b429"; return l; })) });
      var ok = okS && okR;
      fb(res, ok, msgs.join("<br>") + (ok ? "<br><b>Уровни найдены верно.</b> Уровень — это зона, а не точная цена: несколько касаний подряд около одной цены." : "<br>Ищите цены, от которых график <b>несколько раз</b> разворачивался. Эталонные уровни показаны жёлтым пунктиром."));
      if (ok) api.pass();
    } }, "Проверить");
    var again = h("button", { class: "btn", onclick: load }, "Новый график");
    var undo = h("button", { class: "btn btn--ghost", onclick: function () { placed = {}; setMode("support"); chart.chart.update({ levels: [] }); } }, "Сбросить линии");
    wrap.appendChild(h("div", { class: "mode-switch" }, h("span", { class: "small muted", style: { alignSelf: "center" } }, "Отмечаю:"), modeBtns));
    wrap.appendChild(holder);
    wrap.appendChild(h("div", { class: "task__controls" }, check, again, undo));
    wrap.appendChild(res);
    load();
    return wrap;
  };

  // ───── Найди точку на графике ─────
  var TARGETS = {
    lastHL: { scenario: "uptrend", text: "Кликните на <b>последний повышающийся минимум (HL)</b> — точку, где закончилась последняя коррекция.", find: function (m, c) { return lastPivot(m, c, "low"); } },
    lastLH: { scenario: "downtrend", text: "Кликните на <b>последний понижающийся максимум (LH)</b>.", find: function (m, c) { return lastPivot(m, c, "high"); } },
    breakout: { scenario: "breakout-up", text: "Кликните на свечу, которая первой <b>закрылась выше сопротивления</b> (пробой).", find: function (m) { return m.breakoutIndex; } },
    falseBreak: { scenario: "false-breakout-up", text: "Кликните на свечу <b>ложного пробоя</b>: цена заходила выше уровня, но закрылась под ним.", find: function (m) { return m.falseBreakIndex; } },
    pumpTop: { scenario: "pump-dump", text: "Кликните на <b>вершину пампа</b> — точку, где покупки «вдогонку» были самыми рискованными.", find: function (m) { return m.top; } },
    breakStructure: { scenario: "reversal-top", text: "Кликните на свечу, где восходящая структура <b>сломалась</b>: цена впервые опустилась ниже последнего повышающегося минимума (HL).", find: function (m, c) {
      var piv = m.pivots, lows = [], highs = [];
      for (var k = 1; k < piv.length - 1; k++) { var isH = Math.abs(c[piv[k].i].h - piv[k].p) < Math.abs(c[piv[k].i].l - piv[k].p); (isH ? highs : lows).push(piv[k]); }
      var topIdx = highs.reduce(function (a, b) { return b.p > a.p ? b : a; }).i;
      var hl = lows.filter(function (l) { return l.i < topIdx; }).pop();
      for (var i = topIdx; i < c.length; i++) if (c[i].c < hl.p) return i;
      return null;
    } }
  };
  function lastPivot(meta, c, kind) {
    var piv = meta.pivots.slice(1, -1).filter(function (p) {
      var isH = Math.abs(c[p.i].h - p.p) < Math.abs(c[p.i].l - p.p);
      return kind === "high" ? isH : !isH;
    });
    return piv.length ? piv[piv.length - 1].i : null;
  }
  CA.tasks["point-pick"] = function (spec, api) {
    var T = TARGETS[spec.target];
    var wrap = h("div"), holder = h("div"), res = h("div", { hidden: true }), text = h("p", { html: spec.text || T.text });
    var chart, target, pick = null;
    function load() {
      if (chart) chart.chart.destroy();
      holder.innerHTML = ""; pick = null; res.hidden = true;
      chart = CS.mount(holder, { scenario: spec.scenario || T.scenario, price: CA.rng.create(CS.newSeed()).pick([3.1, 120, 2400, 52000]), height: 300, levels: spec.showLevels ? "meta" : null }, {
        seed: CS.newSeed(), pan: false,
        onClick: function (pt) { pick = pt.i; chart.chart.update({ highlight: [pt.i] }); }
      });
      target = T.find(chart.data.meta, chart.data.candles);
    }
    var check = h("button", { class: "btn btn--primary", onclick: function () {
      if (pick == null) { fb(res, false, "Сначала кликните по свече на графике."); return; }
      var tol = spec.tol == null ? 1 : spec.tol, ok = Math.abs(pick - target) <= tol;
      chart.chart.update({ highlight: [pick, target], markers: [{ i: target, kind: "dot", color: "#f0b429", text: "ответ", price: chart.data.candles[target][spec.target === "lastHL" || spec.target === "breakStructure" ? "l" : "h"] }] });
      fb(res, ok, ok ? "Верно! " + (spec.okText || "") : "Не совсем: правильная свеча отмечена жёлтым. " + (spec.hint || ""));
      if (ok) api.pass();
    } }, "Проверить");
    wrap.appendChild(text); wrap.appendChild(holder);
    wrap.appendChild(h("div", { class: "task__controls" }, check, h("button", { class: "btn", onclick: load }, "Новый график")));
    wrap.appendChild(res);
    load();
    return wrap;
  };

  // ───── Где поставить стоп ─────
  CA.tasks["risk-zone"] = function (spec, api) {
    var wrap = h("div"), holder = h("div"), res = h("div", { hidden: true }), info = h("p", { class: "small muted" });
    var chart, d, entry, support, atr, stop = null;
    function load() {
      if (chart) chart.chart.destroy();
      holder.innerHTML = ""; stop = null; res.hidden = true;
      chart = CS.mount(holder, { scenario: "pullback-entry", price: CA.rng.create(CS.newSeed()).pick([14, 380, 1900, 61000]), height: 300, cut: "meta" }, {
        seed: CS.newSeed(), pan: false,
        onClick: function (pt) { stop = pt.price; draw(); }
      });
      d = chart.data;
      entry = d.candles[d.meta.cut - 1].c; support = d.meta.support; atr = lastAtr(d.candles, d.meta.cut);
      info.innerHTML = "Учебная идея: покупка по <b>" + fmt(entry) + "</b> после отката к бывшему сопротивлению (зона ≈ " + fmt(support) + "). Кликните на график, чтобы поставить Stop Loss.";
      draw();
    }
    function draw() {
      var lv = [{ price: entry, color: "#e6e9ed", label: "Вход", dash: false }, { price: support, color: "#3d8bff", label: "Уровень" }];
      if (stop != null) lv.push({ price: stop, color: "#ef5350", label: "Ваш стоп", dash: false });
      chart.chart.update({ levels: lv });
    }
    var check = h("button", { class: "btn btn--primary", onclick: function () {
      if (stop == null) { fb(res, false, "Кликните по графику, чтобы поставить стоп."); return; }
      var pct = (entry - stop) / entry * 100;
      if (stop >= entry) { fb(res, false, "Для покупки стоп ставится <b>ниже</b> цены входа: это цена, при которой идея перестаёт работать."); return; }
      if (stop > support - atr * 0.15) { fb(res, false, "Стоп выше уровня или прямо на нём (" + fmt(stop) + "). Обычный откат к уровню выбьет такой стоп, хотя идея ещё не сломана. Поставьте стоп <b>за уровнем</b> — ниже зоны " + fmt(support) + " с небольшим запасом."); return; }
      if (stop < support - atr * 3.5) { fb(res, false, "Стоп слишком далеко (−" + fmt(pct, 1) + "%). Чем дальше стоп, тем меньше должна быть позиция, а логика «откат к уровню» отменяется уже вскоре после пробоя уровня вниз. Разумная зона — чуть ниже уровня (примерно 0,3–2 средних диапазона свечи)."); return; }
      fb(res, true, "Хорошее место: стоп за уровнем " + fmt(support) + ", риск −" + fmt(pct, 2) + "% от цены входа. Если цена уйдёт ниже уровня, идея «покупатели защищают зону» опровергнута — выход логичен. Размер позиции теперь считается от этого расстояния.");
      api.pass();
    } }, "Проверить");
    wrap.appendChild(info); wrap.appendChild(holder);
    wrap.appendChild(h("div", { class: "task__controls" }, check, h("button", { class: "btn", onclick: load }, "Новый график")));
    wrap.appendChild(res);
    load();
    return wrap;
  };

  // ───── План сделки: вход, стоп, цель → затем «что было дальше» ─────
  CA.tasks["plan"] = function (spec, api) {
    var wrap = h("div"), holder = h("div"), res = h("div", { hidden: true }), step = h("p", { class: "small" });
    var minRR = spec.minRR || 2;
    var chart, d, support, atr, cut, pts, stage;
    var stages = ["entry", "stop", "target"], names = { entry: "цену входа", stop: "Stop Loss", target: "Take Profit" };
    function load() {
      if (chart) chart.chart.destroy();
      holder.innerHTML = ""; pts = {}; stage = 0; res.hidden = true; reveal.disabled = true;
      chart = CS.mount(holder, { scenario: spec.scenario || "pullback-entry", price: CA.rng.create(CS.newSeed()).pick([7.5, 240, 3100, 45000]), height: 320, cut: "meta" }, {
        seed: CS.newSeed(), pan: false,
        onClick: function (pt) { if (stage >= 3) return; pts[stages[stage]] = pt.price; stage++; draw(); }
      });
      d = chart.data; cut = d.meta.cut; support = d.meta.support; atr = lastAtr(d.candles, cut);
      draw();
    }
    function draw() {
      var lv = [{ price: support, color: "#3d8bff", label: "Уровень", fit: true }];
      if (pts.entry != null) lv.push({ price: pts.entry, color: "#e6e9ed", label: "Вход", dash: false, fit: false });
      if (pts.stop != null) lv.push({ price: pts.stop, color: "#ef5350", label: "Стоп", dash: false, fit: false });
      if (pts.target != null) lv.push({ price: pts.target, color: "#26a69a", label: "Цель", dash: false, fit: false });
      var z = [];
      if (pts.entry != null && pts.stop != null) z.push({ from: pts.entry, to: pts.stop, color: "rgba(239,83,80,.12)" });
      if (pts.entry != null && pts.target != null) z.push({ from: pts.entry, to: pts.target, color: "rgba(38,166,154,.12)" });
      chart.chart.update({ levels: lv, zones: z });
      step.innerHTML = stage < 3 ? "Шаг " + (stage + 1) + " из 3: кликните на график, чтобы указать <b>" + names[stages[stage]] + "</b>." : "Все точки указаны. Проверьте план.";
    }
    function validate() {
      var e = pts.entry, s = pts.stop, t = pts.target, last = d.candles[cut - 1].c, errs = [];
      if (!(s < e && e < t)) errs.push("Для покупки должно быть: стоп < вход < цель.");
      if (Math.abs(e - last) > atr * 2.5) errs.push("Вход далеко от текущей цены (" + fmt(last) + "). План должен быть исполнимым сейчас или по лимитному ордеру рядом с ценой.");
      if (s >= support - atr * 0.1) errs.push("Стоп над уровнем или на нём — обычное колебание выбьет его. Поставьте стоп за уровнем " + fmt(support) + ".");
      if (s < support - atr * 4) errs.push("Стоп очень далеко от уровня — риск неоправданно большой.");
      var rr = (t - e) / (e - s);
      if (isFinite(rr) && rr < minRR) errs.push("Соотношение прибыль/риск " + fmt(rr, 2) + " — меньше " + minRR + ". Либо цель ближе, чем стоит риска, либо стоп слишком далеко.");
      return { errs: errs, rr: rr };
    }
    var check = h("button", { class: "btn btn--primary", onclick: function () {
      if (stage < 3) { fb(res, false, "Укажите все три точки: вход, стоп, цель."); return; }
      var v = validate();
      if (v.errs.length) { fb(res, false, "<b>План требует доработки:</b><ul>" + v.errs.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"); return; }
      fb(res, true, "<b>План логичен.</b> R:R = 1 : " + fmt(v.rr, 2) + ", риск " + fmt((pts.entry - pts.stop) / pts.entry * 100, 2) + "% от цены входа. Теперь можно посмотреть, что произошло дальше.");
      reveal.disabled = false;
      api.pass();
    } }, "Проверить план");
    var reveal = h("button", { class: "btn", disabled: true, onclick: function () {
      var c = d.candles, outcome = "Цена не дошла ни до стопа, ни до цели за показанный период.";
      var filled = pts.entry >= c[cut - 1].c * 0.997 ? cut : null; // вход по рынку или лимитный ордер ниже цены
      for (var i = cut; i < c.length; i++) {
        if (filled == null) { if (c[i].l <= pts.entry) filled = i; else continue; }
        if (c[i].l <= pts.stop) { outcome = "<b class='down'>Сработал стоп</b> (−1R). Это не значит, что план был плохим: на уровне покупатели не удержали цену, и вы вышли с заранее ограниченным убытком."; break; }
        if (c[i].h >= pts.target) { outcome = "<b class='up'>Достигнута цель</b> (+" + fmt((pts.target - pts.entry) / (pts.entry - pts.stop), 1) + "R). Помните: прибыль в одной сделке не доказывает, что подход работает — нужна статистика на многих сделках."; break; }
      }
      if (filled == null) outcome = "Цена не вернулась к вашей цене входа — ордер не исполнился бы. Это тоже нормальный исход.";
      chart.chart.update({ limit: c.length, fadeFrom: cut, refit: true, vlines: [{ i: cut - 1, label: "момент решения" }] });
      fb(res, null, outcome + "<br><span class='muted small'>Исход в этом сценарии выбирается случайно. Задача — составить логичный план, а не угадать будущее.</span>");
      reveal.disabled = true;
    } }, "Показать, что было дальше");
    wrap.appendChild(step); wrap.appendChild(holder);
    wrap.appendChild(h("div", { class: "task__controls" }, check, reveal, h("button", { class: "btn btn--ghost", onclick: function () { pts = {}; stage = 0; draw(); } }, "Сбросить точки"), h("button", { class: "btn btn--ghost", onclick: load }, "Новый график")));
    wrap.appendChild(res);
    load();
    return wrap;
  };

  // ───── Чтение индикатора по реальному (синтетическому) графику ─────
  var READS = {
    "rsi-zone": {
      panes: ["volume", "rsi"], q: "Где находится RSI на последней свече?",
      opts: ["Выше 70 — зона перекупленности", "Между 30 и 70 — нейтральная зона", "Ниже 30 — зона перепроданности"],
      answer: function (c) { var r = CA.indicators.rsi(c.map(function (x) { return x.c; }), 14); var v = r[r.length - 1]; return { i: v > 70 ? 0 : v < 30 ? 2 : 1, text: "RSI = " + v.toFixed(1) + ". Даже экстремальные значения — не команда к сделке: в сильном тренде RSI может долго оставаться выше 70 или ниже 30." }; }
    },
    "ma-position": {
      overlays: ["ema20", "sma50"], q: "Как расположены цена и средние на последней свече?",
      opts: ["Цена выше EMA20, EMA20 выше SMA50", "Цена ниже EMA20, EMA20 ниже SMA50", "Смешанная картина (средние переплетены или цена между ними)"],
      answer: function (c) { var cl = c.map(function (x) { return x.c; }), e = CA.indicators.ema(cl, 20), s = CA.indicators.sma(cl, 50), n = cl.length - 1;
        var k = cl[n] > e[n] && e[n] > s[n] ? 0 : cl[n] < e[n] && e[n] < s[n] ? 1 : 2; return { i: k, text: "Цена " + fmt(cl[n]) + ", EMA20 " + fmt(e[n]) + ", SMA50 " + fmt(s[n]) + ". Порядок «цена > быстрая > медленная» описывает восходящую структуру, обратный — нисходящую." }; }
    },
    "macd-state": {
      panes: ["volume", "macd"], q: "Что показывает MACD на последней свече?",
      opts: ["Линия MACD выше сигнальной (гистограмма > 0)", "Линия MACD ниже сигнальной (гистограмма < 0)"],
      answer: function (c) { var m = CA.indicators.macd(c.map(function (x) { return x.c; })), v = m.hist[m.hist.length - 1]; return { i: v > 0 ? 0 : 1, text: "Гистограмма = " + v.toFixed(3) + ". MACD отстаёт от цены: он описывает уже произошедшее изменение импульса, а не предсказывает его." }; }
    },
    "bb-position": {
      overlays: ["bb"], q: "Где закрылась последняя свеча относительно полос Боллинджера?",
      opts: ["Выше верхней полосы", "Внутри полос, в верхней половине", "Внутри полос, в нижней половине", "Ниже нижней полосы"],
      answer: function (c) { var b = CA.indicators.bollinger(c.map(function (x) { return x.c; }), 20, 2), n = c.length - 1, p = c[n].c;
        var k = p > b.upper[n] ? 0 : p < b.lower[n] ? 3 : p >= b.mid[n] ? 1 : 2; return { i: k, text: "Закрытие " + fmt(p) + "; полосы: " + fmt(b.lower[n]) + " – " + fmt(b.mid[n]) + " – " + fmt(b.upper[n]) + ". Выход за полосу означает сильное движение относительно недавней волатильности, а не обязательный разворот." }; }
    }
  };
  CA.tasks["chart-read"] = function (spec, api) {
    var Rd = READS[spec.read], need = spec.rounds || 3, wrap = h("div"), holder = h("div"), q = h("p", { class: "q__text", text: Rd.q }), opts = h("div", { class: "opts" }), res = h("div", { hidden: true }), counter = h("span", { class: "task__status" });
    var chart, ans, score = 0, n = 0;
    function load() {
      if (chart) chart.chart.destroy();
      holder.innerHTML = ""; res.hidden = true; opts.innerHTML = "";
      var len = CA.rng.create(CS.newSeed()).int(140, 260);
      chart = CS.mount(holder, { walk: len, price: 100, overlays: Rd.overlays, panes: Rd.panes, height: Rd.panes && Rd.panes.length > 1 ? 340 : 290 }, { seed: CS.newSeed(), visible: 90, pan: true });
      ans = Rd.answer(chart.data.candles);
      Rd.opts.forEach(function (t, i) {
        opts.appendChild(h("button", { class: "opt", type: "button", onclick: function (e) { pick(i, e.currentTarget); } }, h("span", { class: "opt__mark" }), h("span", null, t)));
      });
      counter.textContent = "Верно " + score + " из " + need + " нужных";
    }
    function pick(i, btn) {
      if (opts.dataset.locked) return;
      opts.dataset.locked = "1";
      var ok = i === ans.i;
      btn.classList.add(ok ? "is-correct" : "is-wrong");
      opts.children[ans.i].classList.add("is-correct");
      if (ok) score++;
      n++;
      fb(res, ok, (ok ? "Верно. " : "Неверно. ") + ans.text);
      counter.textContent = "Верно " + score + " из " + need + " нужных";
      if (score >= need) { api.pass(); res.innerHTML += "<br><b>Задание выполнено.</b>"; }
      else res.appendChild(h("div", { style: { marginTop: "8px" } }, h("button", { class: "btn btn--primary btn--sm", onclick: function () { delete opts.dataset.locked; load(); } }, "Следующий график")));
    }
    wrap.appendChild(holder); wrap.appendChild(q); wrap.appendChild(opts); wrap.appendChild(h("div", { class: "task__controls" }, counter)); wrap.appendChild(res);
    load();
    return wrap;
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
