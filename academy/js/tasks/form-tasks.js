/* Задания без графика (или с графиком-иллюстрацией): расчёты, ситуации, порядок, классификация, журнал, торговый план. */
(function (g) {
  "use strict";
  var CA = g.CA;
  var h = CA.dom.h, fb = CA.taskFeedback, fmt = CA.dom.fmt;

  // ───── Расчёт ─────
  CA.tasks.calc = function (spec, api) {
    var wrap = h("div"), gens = spec.gens || [spec.gen], need = spec.rounds || gens.length, score = 0, R = CA.rng.create(CA.chartSpec.newSeed());
    var q = h("p"), input = h("input", { class: "input num", inputmode: "decimal", placeholder: "Ваш ответ", style: { maxWidth: "220px" }, "aria-label": "Ответ" });
    var unit = h("span", { class: "muted small" }), res = h("div", { hidden: true }), counter = h("span", { class: "task__status" }), cur;
    function load() {
      cur = CA.calcGen[gens[score % gens.length]](R);
      q.innerHTML = cur.text; unit.textContent = cur.unit || ""; input.value = ""; input.classList.remove("is-error"); res.hidden = true;
      counter.textContent = "Решено " + score + " из " + need;
    }
    function check() {
      var v = CA.parseNum(input.value);
      if (!isFinite(v)) { input.classList.add("is-error"); fb(res, false, "Введите число. Дробную часть можно отделять точкой или запятой."); return; }
      var tol = cur.abs != null ? cur.abs : Math.abs(cur.answer) * (cur.rel || 0.01);
      var ok = Math.abs(v - cur.answer) <= tol + 1e-9;
      fb(res, ok, (ok ? "Верно! " : "Неверно. ") + cur.explain);
      if (ok) {
        score++;
        counter.textContent = "Решено " + score + " из " + need;
        if (score >= need) { api.pass(); res.innerHTML += "<br><b>Задание выполнено.</b>"; }
        else res.appendChild(h("div", { style: { marginTop: "8px" } }, h("button", { class: "btn btn--primary btn--sm", onclick: load }, "Следующая задача")));
      } else res.appendChild(h("div", { style: { marginTop: "8px" } }, h("button", { class: "btn btn--sm", onclick: load }, "Другие числа")));
    }
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") check(); });
    wrap.appendChild(q);
    wrap.appendChild(h("div", { class: "btn-row" }, input, unit, h("button", { class: "btn btn--primary", onclick: check }, "Проверить")));
    wrap.appendChild(h("div", { class: "task__controls" }, counter));
    wrap.appendChild(res);
    load();
    return wrap;
  };

  // ───── Ситуация: выбор обоснованного плана ─────
  CA.tasks.scenario = function (spec, api) {
    var wrap = h("div"), res = h("div", { hidden: true });
    if (spec.chart) {
      var holder = h("div", { style: { marginBottom: "12px" } });
      wrap.appendChild(holder);
      setTimeout(function () { CA.chartSpec.mount(holder, spec.chart, { pan: false }); }, 0);
    }
    if (spec.situation) wrap.appendChild(h("div", { html: spec.situation, style: { marginBottom: "10px" } }));
    var opts = h("div", { class: "opts" });
    spec.options.forEach(function (o, i) {
      opts.appendChild(h("button", { class: "opt", type: "button", onclick: function (e) {
        Array.from(opts.children).forEach(function (b) { b.classList.remove("is-correct", "is-wrong", "is-selected"); });
        var best = o.score === 2;
        e.currentTarget.classList.add(best ? "is-correct" : o.score === 1 ? "is-selected" : "is-wrong");
        fb(res, best ? true : o.score === 1 ? null : false, (best ? "<b>Лучший вариант.</b> " : o.score === 1 ? "<b>Допустимо, но есть вариант лучше.</b> " : "<b>Рискованное решение.</b> ") + o.feedback);
        if (best) api.pass();
      } }, h("span", { class: "opt__mark" }, String.fromCharCode(65 + i)), h("span", null, o.text)));
    });
    wrap.appendChild(opts); wrap.appendChild(res);
    return wrap;
  };

  // ───── Расставь по порядку ─────
  CA.tasks.sort = function (spec, api) {
    var wrap = h("div"), list = h("ol", { class: "sort-list" }), res = h("div", { hidden: true });
    var R = CA.rng.create(CA.chartSpec.newSeed());
    var order = R.shuffle(spec.items.map(function (_, i) { return i; }));
    if (order.every(function (v, i) { return v === i; })) order.reverse();
    function render() {
      list.innerHTML = "";
      order.forEach(function (it, pos) {
        list.appendChild(h("li", { class: "sort-item" },
          h("span", { class: "sort-item__n" }, String(pos + 1)), h("span", { class: "sort-item__t" }, spec.items[it]),
          h("button", { class: "icon-btn", "aria-label": "Выше", disabled: pos === 0, onclick: function () { move(pos, -1); } }, "↑"),
          h("button", { class: "icon-btn", "aria-label": "Ниже", disabled: pos === order.length - 1, onclick: function () { move(pos, 1); } }, "↓")));
      });
    }
    function move(pos, d) { var t = order[pos]; order[pos] = order[pos + d]; order[pos + d] = t; res.hidden = true; render(); }
    var check = h("button", { class: "btn btn--primary", onclick: function () {
      var wrong = 0;
      Array.from(list.children).forEach(function (li, pos) { var ok = order[pos] === pos; li.classList.toggle("is-correct", ok); li.classList.toggle("is-wrong", !ok); if (!ok) wrong++; });
      if (!wrong) { fb(res, true, spec.explain || "Порядок верный."); api.pass(); }
      else fb(res, false, "Не на своих местах: " + wrong + ". Подумайте, что нужно знать до следующего шага.");
    } }, "Проверить");
    wrap.appendChild(list); wrap.appendChild(h("div", { class: "task__controls" }, check)); wrap.appendChild(res);
    render();
    return wrap;
  };

  // ───── Классификация ─────
  CA.tasks.classify = function (spec, api) {
    var wrap = h("div", { class: "classify" }), res = h("div", { hidden: true }), answers = {};
    var R = CA.rng.create(CA.chartSpec.newSeed());
    var items = R.shuffle(spec.items.map(function (it, i) { return { t: it[0], c: it[1], i: i, why: it[2] }; }));
    var rows = items.map(function (it) {
      var seg = h("div", { class: "seg" });
      spec.categories.forEach(function (cat, ci) {
        seg.appendChild(h("button", { type: "button", onclick: function () { answers[it.i] = ci; Array.from(seg.children).forEach(function (b, k) { b.classList.toggle("is-active", k === ci); }); row.classList.remove("is-correct", "is-wrong"); } }, cat));
      });
      var row = h("div", { class: "classify__row" }, h("span", { class: "classify__text" }, it.t), seg);
      it.row = row;
      return row;
    });
    rows.forEach(function (r) { wrap.appendChild(r); });
    var check = h("button", { class: "btn btn--primary", onclick: function () {
      var miss = items.filter(function (it) { return answers[it.i] == null; }).length;
      if (miss) { fb(res, false, "Распределите все утверждения (осталось " + miss + ")."); return; }
      var wrong = [];
      items.forEach(function (it) { var ok = answers[it.i] === it.c; it.row.classList.toggle("is-correct", ok); it.row.classList.toggle("is-wrong", !ok); if (!ok) wrong.push(it); });
      if (!wrong.length) { fb(res, true, spec.explain || "Всё верно!"); api.pass(); }
      else fb(res, false, "Ошибок: " + wrong.length + "." + (wrong[0].why ? "<ul>" + wrong.filter(function (w) { return w.why; }).map(function (w) { return "<li><b>" + w.t + "</b> — " + w.why + "</li>"; }).join("") + "</ul>" : ""));
    } }, "Проверить");
    wrap.appendChild(h("div", { class: "task__controls" }, check)); wrap.appendChild(res);
    return wrap;
  };

  // ───── Запись в торговом журнале ─────
  CA.tasks.journal = function (spec, api) {
    var R = CA.rng.create(CA.chartSpec.newSeed());
    var e = R.pick([42, 118, 260, 1840]), sl = CA.market.round(e * (1 - R.pick([0.02, 0.03, 0.04]))), tp = CA.market.round(e + (e - sl) * 2.5);
    var mult = R.pick([-1, 1.4, 2.5, -0.6]), x = CA.market.round(e + (e - sl) * mult);
    var wrap = h("div"), res = h("div", { hidden: true });
    wrap.appendChild(h("div", { class: "example" }, h("div", { class: "example__title" }, "Учебная сделка (синтетика)"),
      h("dl", null, h("dt", null, "Актив"), h("dd", null, "SYN/USDT, 1h"), h("dt", null, "Вход"), h("dd", null, fmt(e)), h("dt", null, "Stop Loss"), h("dd", null, fmt(sl)),
        h("dt", null, "Take Profit"), h("dd", null, fmt(tp)), h("dt", null, "Выход"), h("dd", null, fmt(x)),
        h("dt", null, "Контекст"), h("dd", { style: { fontFamily: "var(--font)", textAlign: "right" } }, mult === -0.6 ? "закрыта вручную, «стало страшно»" : "по плану"))));
    var f = {
      reason: h("textarea", { class: "input", placeholder: "Например: восходящий тренд на 4h, откат к пробитому уровню, бычья свеча-поглощение", "aria-label": "Причина входа" }),
      r: h("input", { class: "input num", inputmode: "decimal", placeholder: "например 1,4 или -1", "aria-label": "Результат в R" }),
      emotion: h("select", { class: "input", "aria-label": "Эмоции" }, ["— выберите —", "Спокойствие, действовал по плану", "Страх", "Жадность / FOMO", "Азарт, желание отыграться", "Скука"].map(function (t, i) { return h("option", { value: i ? t : "" }, t); })),
      plan: h("select", { class: "input", "aria-label": "Соблюдён ли план" }, h("option", { value: "" }, "— выберите —"), h("option", { value: "yes" }, "Да"), h("option", { value: "no" }, "Нет")),
      lesson: h("textarea", { class: "input", placeholder: "Что сделаю так же / иначе в следующий раз", "aria-label": "Вывод" })
    };
    wrap.appendChild(h("div", { class: "stack", style: { gap: "10px" } },
      h("label", { class: "field" }, h("span", null, "Почему вошёл (сетап по плану)"), f.reason),
      h("div", { class: "grid-2 grid-2--stack" }, h("label", { class: "field" }, h("span", null, "Результат в R"), f.r), h("label", { class: "field" }, h("span", null, "План соблюдён?"), f.plan)),
      h("label", { class: "field" }, h("span", null, "Эмоциональное состояние"), f.emotion),
      h("label", { class: "field" }, h("span", null, "Вывод"), f.lesson)));
    var check = h("button", { class: "btn btn--primary", onclick: function () {
      var errs = [], rv = CA.parseNum(f.r.value);
      if (f.reason.value.trim().length < 15) errs.push("Опишите причину входа подробнее (что именно вы увидели на графике).");
      if (!isFinite(rv) || Math.abs(rv - mult) > 0.06) errs.push("Результат в R посчитан неверно. 1R = вход − стоп = " + fmt(e - sl) + "; результат = (выход − вход) / 1R.");
      if (!f.plan.value) errs.push("Отметьте, соблюдён ли план.");
      else if (mult === -0.6 && f.plan.value === "yes") errs.push("Сделка закрыта вручную до стопа из‑за страха — это отклонение от плана. Честность в журнале важнее красивой статистики.");
      if (!f.emotion.value) errs.push("Укажите эмоциональное состояние — это помогает найти повторяющиеся ошибки.");
      if (f.lesson.value.trim().length < 10) errs.push("Сформулируйте вывод: что повторить или изменить.");
      if (errs.length) { fb(res, false, "<ul>" + errs.map(function (x2) { return "<li>" + x2 + "</li>"; }).join("") + "</ul>"); return; }
      fb(res, true, "Запись в журнале полная: сетап, результат в R (" + fmt(mult, 2) + "R), соблюдение плана, эмоции и вывод. Через 30–50 таких записей вы увидите свои реальные сильные и слабые стороны.");
      api.pass();
    } }, "Сохранить запись");
    wrap.appendChild(h("div", { class: "task__controls" }, check)); wrap.appendChild(res);
    return wrap;
  };

  // ───── Собственный торговый план ─────
  CA.tasks["plan-form"] = function (spec, api) {
    var store = CA.app && CA.app.store, saved = (store && store.state.plan) || {};
    var wrap = h("div"), res = h("div", { hidden: true });
    function sel(name, label, options) {
      var s = h("select", { class: "input", name: name, "aria-label": label }, h("option", { value: "" }, "— выберите —"), options.map(function (o) { return h("option", { value: o, selected: saved[name] === o }, o); }));
      return h("label", { class: "field" }, h("span", null, label), s);
    }
    function txt(name, label, ph) { return h("label", { class: "field" }, h("span", null, label), h("textarea", { class: "input", name: name, placeholder: ph, "aria-label": label }, saved[name] || "")); }
    function numf(name, label, ph) { return h("label", { class: "field" }, h("span", null, label), h("input", { class: "input num", name: name, inputmode: "decimal", placeholder: ph, value: saved[name] || "", "aria-label": label })); }
    var form = h("form", { class: "stack", style: { gap: "12px" }, onsubmit: function (e) { e.preventDefault(); submit(); } },
      h("div", { class: "grid-2 grid-2--stack" },
        sel("style", "Стиль торговли", ["Скальпинг", "Дейтрейдинг", "Свинг-трейдинг", "Позиционная торговля"]),
        sel("tf", "Рабочий таймфрейм", ["1m", "5m", "15m", "1h", "4h", "1D"])),
      sel("market", "В каком состоянии рынка торгую", ["Только по тренду", "Только во флэте от границ диапазона", "Пробои после консолидации", "Разные режимы, с разными правилами"]),
      txt("entry", "Условия входа (что должно совпасть)", "Например: цена выше EMA50 на 4h; откат к уровню; на 1h бычья свеча закрылась выше EMA20"),
      txt("stop", "Где ставлю Stop Loss", "Например: за минимумом отката, не ближе 1 ATR"),
      txt("exit", "Где фиксирую прибыль / как сопровождаю", "Например: 50% на 2R, остаток — по закрытию ниже EMA20"),
      h("div", { class: "grid-3" },
        numf("risk", "Риск на сделку, % капитала", "1"),
        numf("daily", "Макс. дневной убыток, %", "3"),
        numf("maxTrades", "Макс. сделок в день", "3")),
      txt("noTrade", "Когда я НЕ торгую", "Например: перед важными новостями, после 2 убытков подряд, если устал или зол"),
      h("button", { class: "btn btn--primary", type: "submit" }, "Проверить и сохранить план"));
    function submit() {
      var fd = new FormData(form), p = {};
      fd.forEach(function (v, k) { p[k] = String(v).trim(); });
      var errs = [], risk = CA.parseNum(p.risk), daily = CA.parseNum(p.daily), mt = CA.parseNum(p.maxTrades);
      if (!p.style || !p.tf || !p.market) errs.push("Выберите стиль, таймфрейм и состояние рынка.");
      if (p.entry.length < 25) errs.push("Условия входа слишком общие. Опишите конкретные проверяемые условия — так, чтобы другой человек принял то же решение.");
      if (p.stop.length < 10) errs.push("Опишите правило для Stop Loss — без него план не ограничивает риск.");
      if (p.exit.length < 10) errs.push("Опишите правило выхода с прибылью.");
      if (!isFinite(risk) || risk <= 0) errs.push("Укажите риск на сделку в процентах.");
      else if (risk > 2) errs.push("Риск " + risk + "% на сделку — слишком много для учебного плана. Распространённый ориентир — 0,5–2%.");
      if (!isFinite(daily) || daily <= 0) errs.push("Укажите максимальный дневной убыток.");
      else if (isFinite(risk) && daily < risk) errs.push("Дневной лимит убытка меньше риска одной сделки — так вы не сможете открыть даже одну сделку.");
      else if (daily > 6) errs.push("Дневной лимит " + daily + "% слишком велик: несколько таких дней подряд — глубокая просадка.");
      if (!isFinite(mt) || mt < 1) errs.push("Укажите максимальное число сделок в день.");
      if (p.noTrade.length < 10) errs.push("Опишите, когда вы не торгуете. Это защищает от импульсивных решений.");
      if (p.style === "Скальпинг" && ["4h", "1D"].indexOf(p.tf) >= 0) errs.push("Скальпинг на " + p.tf + " — противоречие: скальпинг подразумевает минутные таймфреймы.");
      if (errs.length) { fb(res, false, "<b>План нужно доработать:</b><ul>" + errs.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"); return; }
      p.savedAt = Date.now();
      if (store) { store.state.plan = p; store.save(); }
      fb(res, true, "<b>План сохранён</b> (его можно посмотреть в профиле). Помните: план нужно проверить на истории и на демо-счёте, а затем соблюдать. План без дисциплины не работает.");
      api.pass();
    }
    wrap.appendChild(form); wrap.appendChild(res);
    return wrap;
  };

  // ───── Бэктест ─────
  CA.tasks.backtest = function (spec, api) {
    var wrap = h("div");
    var ran = {};
    var info = h("p", { class: "small muted", text: "Запустите проверку на обучающем отрезке, затем — на проверочном (данные, которые вы не видели при настройке). Выполнено: 0 из 2." });
    wrap.appendChild(info);
    wrap.appendChild(CA.widgets.lab({ compact: true, onRun: function (part) {
      ran[part] = true;
      info.textContent = "Выполнено: " + Object.keys(ran).length + " из 2. " + (Object.keys(ran).length < 2 ? "Теперь проверьте на другом отрезке." : "Сравните результаты: если на проверочном отрезке система резко хуже — вероятна подгонка под историю.");
      if (ran.train && ran.test) api.pass();
    } }));
    return wrap;
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
