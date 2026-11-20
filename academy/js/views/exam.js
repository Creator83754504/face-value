/*
 * Модуль 8. Финальный экзамен: теория → практический анализ графика → риск → торговый план → итог.
 * Каждая часть сдаётся с одной попытки; экзамен можно пересдавать целиком.
 */
(function (g) {
  "use strict";
  var CA = g.CA;
  var h = CA.dom.h, fmt = CA.dom.fmt, CS = CA.chartSpec;
  var WEIGHTS = { theory: 40, practice: 25, risk: 20, plan: 15 };
  var THEORY_N = 20;

  CA.views.exam = function () {
    var store = CA.app.store, wrap = h("div"), ex = store.state.exam;
    var unlocked = store.allLessonsDone() || store.state.settings.freeMode;
    wrap.appendChild(h("div", { class: "page-head" }, h("div", { class: "eyebrow" }, "Модуль 8"), h("h1", null, "Финальный экзамен"),
      h("p", null, "Четыре части: теория (" + THEORY_N + " вопросов), практический анализ графика, расчёт риска и собственный торговый план. Каждая часть сдаётся с одной попытки. Для успешной сдачи нужно набрать 70% и больше.")));
    var parts = h("div", { class: "stats" });
    [["Теория", WEIGHTS.theory + "%", THEORY_N + " вопросов по модулям 1–7"], ["Анализ графика", WEIGHTS.practice + "%", "тренд, уровни, стоп и цель"], ["Риск-менеджмент", WEIGHTS.risk + "%", "4 расчётные задачи"], ["Торговый план", WEIGHTS.plan + "%", "собственные правила"]].forEach(function (p) {
      parts.appendChild(h("div", { class: "stat" }, h("div", { class: "stat__label" }, p[0]), h("div", { class: "stat__value" }, p[1]), h("div", { class: "stat__sub" }, p[2])));
    });
    wrap.appendChild(parts);
    if (ex) wrap.appendChild(h("div", { class: "callout " + (ex.passed ? "callout--tip" : "callout--warn") }, h("div", { class: "callout__title" }, ex.passed ? "Экзамен сдан" : "Экзамен пока не сдан"), h("p", null, "Лучший результат: " + ex.best + "% · попыток: " + ex.attempts + ". " + (ex.passed ? "Можно пересдать, чтобы улучшить результат." : ""))));
    if (!unlocked) {
      var cp = store.courseProgress();
      wrap.appendChild(h("div", { class: "empty card", style: { marginTop: "16px" } }, h("div", { class: "empty__icon" }, "🔒"), h("h3", null, "Экзамен откроется после модулей 1–7"), h("p", null, "Пройдено уроков: " + cp.done + " из " + cp.total + "."), h("a", { class: "btn btn--primary", href: "#/course" }, "К программе курса")));
      return wrap;
    }
    if (!store.allLessonsDone()) wrap.appendChild(h("p", { class: "callout callout--warn" }, "Включён свободный режим: не все уроки пройдены. Результат будет засчитан, но рекомендуем сначала пройти курс."));
    var stage = h("div", { class: "section" });
    wrap.appendChild(stage);
    stage.appendChild(h("button", { class: "btn btn--primary btn--lg", onclick: function () { run(stage); } }, ex ? "Пересдать экзамен" : "Начать экзамен"));
    return wrap;
  };

  function header(n, title, text) {
    return h("div", { class: "card__head", style: { marginBottom: "6px" } }, h("div", null, h("div", { class: "eyebrow" }, "Часть " + n + " из 4"), h("h2", { style: { margin: 0 } }, title), text ? h("p", { class: "muted small", style: { margin: "4px 0 0" } }, text) : null));
  }

  function run(stage) {
    var store = CA.app.store, result = { theory: 0, practice: 0, risk: 0, plan: 0, weakModules: {} };
    var R = CA.rng.create(CS.newSeed());
    window.scrollTo(0, 0);

    // ── Часть 1: теория
    function theory() {
      stage.innerHTML = "";
      stage.appendChild(header(1, "Теоретическая часть", "Вопросы выбраны случайно из банка экзамена."));
      var qs = R.shuffle(CA.examBank).slice(0, THEORY_N).map(function (q, i) { return Object.assign({ id: "exam-" + i }, q); });
      var quiz = CA.Quiz(qs, { pass: 70, onSubmit: function (c, t, wrong) {
        result.theory = c / t;
        wrong.forEach(function (w) { var q = qs.find(function (x) { return x.id === w.qid; }); if (q && q.m) result.weakModules[q.m] = (result.weakModules[q.m] || 0) + 1; });
        var retry = quiz.el.querySelector(".quiz-result .btn"); if (retry) retry.remove();
        stage.appendChild(h("div", { class: "btn-row", style: { marginTop: "16px" } }, h("button", { class: "btn btn--primary btn--lg", onclick: practice }, "Далее: анализ графика →")));
      } });
      stage.appendChild(quiz.el);
    }

    // ── Часть 2: анализ графика (одна попытка)
    function practice() {
      stage.innerHTML = ""; window.scrollTo(0, 0);
      stage.appendChild(header(2, "Практический анализ графика", "Ответы фиксируются после нажатия «Зафиксировать ответы». Подсказок нет."));
      var score = 0, total = 4, notes = [];
      // график A — боковик
      var boxA = h("div"), modeA = "support", lv = {};
      var A = CS.mount(boxA, { scenario: "range", price: R.pick([18, 640, 3300]), height: 300 }, { seed: CS.newSeed(), pan: false, onClick: function (pt) { lv[modeA] = pt.price; if (modeA === "support") setMode("resistance"); A.chart.update({ levels: lines() }); } });
      function lines() { var o = []; if (lv.support != null) o.push({ price: lv.support, color: "#26a69a", label: "Поддержка", fit: false }); if (lv.resistance != null) o.push({ price: lv.resistance, color: "#ef5350", label: "Сопротивление", fit: false }); return o; }
      var seg = h("div", { class: "seg" });
      function setMode(m) { modeA = m; Array.from(seg.children).forEach(function (b) { b.classList.toggle("is-active", b.dataset.m === m); }); }
      [["support", "Поддержка"], ["resistance", "Сопротивление"]].forEach(function (p) { seg.appendChild(h("button", { type: "button", dataset: { m: p[0] }, onclick: function () { setMode(p[0]); } }, p[1])); });
      setMode("support");
      var trendSel = h("select", { class: "input", style: { maxWidth: "280px" }, "aria-label": "Состояние рынка" }, [["", "— выберите —"], ["up", "Восходящий тренд"], ["down", "Нисходящий тренд"], ["range", "Боковое движение"]].map(function (o) { return h("option", { value: o[0] }, o[1]); }));
      // график B — откат в тренде
      var boxB = h("div"), pB = {}, stageB = 0;
      var B = CS.mount(boxB, { scenario: "pullback-entry", price: R.pick([9, 210, 52000]), height: 300, cut: "meta" }, { seed: CS.newSeed(), pan: false, onClick: function (pt) { if (stageB === 0) pB.stop = pt.price; else pB.target = pt.price; stageB = Math.min(1, stageB + 1); drawB(); } });
      var entryB = B.data.candles[B.data.meta.cut - 1].c, supB = B.data.meta.support, atrB = (function () { var a = CA.indicators.atr(B.data.candles.slice(0, B.data.meta.cut), 14); return a[a.length - 1]; })();
      function drawB() {
        var o = [{ price: entryB, color: "#e6e9ed", label: "Вход", dash: false }, { price: supB, color: "#3d8bff", label: "Уровень" }];
        if (pB.stop != null) o.push({ price: pB.stop, color: "#ef5350", label: "Стоп", dash: false, fit: false });
        if (pB.target != null) o.push({ price: pB.target, color: "#26a69a", label: "Цель", dash: false, fit: false });
        B.chart.update({ levels: o });
        stepB.textContent = pB.stop == null ? "Кликните, чтобы поставить Stop Loss." : pB.target == null ? "Теперь кликните, чтобы поставить Take Profit." : "Стоп и цель указаны. Следующий клик изменит цель.";
      }
      var stepB = h("p", { class: "small" });
      B.chart.update({ extraRange: [supB - atrB * 5, entryB + atrB * 10] });
      drawB();
      var fixBtn = h("button", { class: "btn btn--primary btn--lg", onclick: function () {
        if (!trendSel.value || lv.support == null || lv.resistance == null || pB.stop == null || pB.target == null) { CA.dom.toast("Выполните все пункты на обоих графиках", "error"); return; }
        var levels = A.data.meta.levels, S = levels[0].price, Rz = levels[1].price, tol = (Rz - S) * 0.22;
        if (trendSel.value === "range") score++; else notes.push("График A — боковое движение: цена колеблется между уровнями без новых экстремумов.");
        if (Math.abs(lv.support - S) <= tol && Math.abs(lv.resistance - Rz) <= tol) score++; else notes.push("Уровни на графике A найдены неточно (эталон: поддержка ≈ " + fmt(S) + ", сопротивление ≈ " + fmt(Rz) + ").");
        var okStop = pB.stop < supB - atrB * 0.15 && pB.stop > supB - atrB * 3.5;
        if (okStop) score++; else notes.push("Стоп на графике B должен стоять за уровнем " + fmt(supB) + " с небольшим запасом, но не слишком далеко.");
        var rr = (pB.target - entryB) / (entryB - pB.stop);
        if (pB.stop < entryB && rr >= 2) score++; else notes.push("Соотношение прибыль/риск на графике B — " + (isFinite(rr) ? fmt(rr, 2) : "—") + "; требовалось не меньше 2.");
        result.practice = score / total;
        if (score < total) result.weakModules[3] = (result.weakModules[3] || 0) + 1;
        A.chart.update({ levels: lines().concat(CS.metaLevels(A.data.meta).map(function (l) { l.color = "#f0b429"; l.label += " (эталон)"; l.dash = [2, 3]; return l; })) });
        fixBtn.disabled = true;
        fbx.className = "task__feedback " + (score === total ? "is-ok" : "is-bad");
        fbx.hidden = false;
        fbx.innerHTML = "<b>Результат: " + score + " из " + total + ".</b>" + (notes.length ? "<ul>" + notes.map(function (n) { return "<li>" + n + "</li>"; }).join("") + "</ul>" : " Все пункты выполнены верно.");
        stage.appendChild(h("div", { class: "btn-row", style: { marginTop: "16px" } }, h("button", { class: "btn btn--primary btn--lg", onclick: risk }, "Далее: риск-менеджмент →")));
      } }, "Зафиксировать ответы");
      var fbx = h("div", { hidden: true });
      stage.appendChild(h("div", { class: "task" }, h("h3", null, "График A"), h("p", { class: "small" }, "1) Определите состояние рынка. 2) Отметьте поддержку и сопротивление (кликами по графику)."), h("div", { class: "btn-row", style: { marginBottom: "10px" } }, trendSel, seg), boxA));
      stage.appendChild(h("div", { class: "task" }, h("h3", null, "График B"), h("p", { class: "small" }, "Учебная покупка по " + fmt(entryB) + " после отката к уровню ≈ " + fmt(supB) + ". 3) Поставьте Stop Loss. 4) Поставьте Take Profit так, чтобы R:R был не меньше 1:2."), stepB, boxB));
      stage.appendChild(fixBtn); stage.appendChild(fbx);
    }

    // ── Часть 3: риск
    function risk() {
      stage.innerHTML = ""; window.scrollTo(0, 0);
      stage.appendChild(header(3, "Риск-менеджмент", "Четыре задачи. Дробную часть можно вводить через точку или запятую."));
      var gens = ["position", "rr", "recovery", "liquidation"], tasks = gens.map(function (gname) { return CA.calcGen[gname](R); }), inputs = [];
      tasks.forEach(function (t, i) {
        var inp = h("input", { class: "input num", inputmode: "decimal", placeholder: "Ответ", style: { maxWidth: "220px" }, "aria-label": "Ответ на задачу " + (i + 1) });
        inputs.push(inp);
        stage.appendChild(h("div", { class: "q" }, h("div", { class: "q__num" }, "Задача " + (i + 1)), h("div", { class: "q__text", html: t.text }), h("div", { class: "btn-row" }, inp, h("span", { class: "small muted" }, t.unit || "")), h("div", { class: "q__explain", hidden: true, dataset: { i: i } })));
      });
      var btn = h("button", { class: "btn btn--primary btn--lg", style: { marginTop: "14px" }, onclick: function () {
        if (inputs.some(function (i) { return !inputs || i.value.trim() === ""; })) { CA.dom.toast("Решите все задачи", "error"); return; }
        var ok = 0;
        tasks.forEach(function (t, i) {
          var v = CA.parseNum(inputs[i].value), tol = t.abs != null ? t.abs : Math.abs(t.answer) * (t.rel || 0.01), good = isFinite(v) && Math.abs(v - t.answer) <= tol + 1e-9;
          if (good) ok++;
          inputs[i].disabled = true;
          var ex = stage.querySelector('.q__explain[data-i="' + i + '"]');
          ex.hidden = false; ex.className = "q__explain" + (good ? "" : " is-wrong"); ex.innerHTML = (good ? "<b>Верно.</b> " : "<b>Неверно.</b> ") + t.explain;
        });
        result.risk = ok / tasks.length;
        if (ok < tasks.length) result.weakModules[6] = (result.weakModules[6] || 0) + (tasks.length - ok);
        btn.disabled = true;
        stage.appendChild(h("div", { class: "btn-row", style: { marginTop: "16px" } }, h("button", { class: "btn btn--primary btn--lg", onclick: plan }, "Далее: торговый план →")));
      } }, "Проверить");
      stage.appendChild(btn);
    }

    // ── Часть 4: торговый план
    function plan() {
      stage.innerHTML = ""; window.scrollTo(0, 0);
      stage.appendChild(header(4, "Собственный торговый план", "Сформулируйте правила, по которым вы бы торговали. План проверяется на полноту и разумность ограничений риска."));
      var passed = false, attempts = 0;
      stage.appendChild(CA.renderTask({ id: "exam-plan", type: "plan-form", title: "Торговый план" }, { passed: false, onPass: function () { passed = true; } }));
      stage.appendChild(h("button", { class: "btn btn--primary btn--lg", style: { marginTop: "14px" }, onclick: function () {
        attempts++;
        result.plan = passed ? 1 : 0;
        if (!passed && attempts === 1) { CA.dom.toast("План ещё не прошёл проверку. Нажмите «Проверить и сохранить план». Если завершить сейчас, часть оценивается в 0%.", "error", 5000); return; }
        finish();
      } }, "Завершить экзамен"));
    }

    function finish() {
      var total = Math.round(result.theory * WEIGHTS.theory + result.practice * WEIGHTS.practice + result.risk * WEIGHTS.risk + result.plan * WEIGHTS.plan);
      var passed = total >= 70;
      store.recordExam({ total: total, passed: passed, parts: { theory: Math.round(result.theory * 100), practice: Math.round(result.practice * 100), risk: Math.round(result.risk * 100), plan: Math.round(result.plan * 100) } });
      stage.innerHTML = ""; window.scrollTo(0, 0);
      var grade = total >= 90 ? "Отлично" : total >= 80 ? "Хорошо" : total >= 70 ? "Удовлетворительно" : "Не сдан";
      stage.appendChild(h("div", { class: "quiz-result " + (passed ? "is-pass" : "is-fail") },
        h("div", { class: "ring", style: { "--p": total, width: "84px", height: "84px" } }, h("span", { style: { width: "68px", height: "68px", fontSize: "16px" } }, total + "%")),
        h("div", { style: { flex: "1 1 260px" } }, h("h2", { style: { margin: 0 } }, passed ? "Экзамен сдан — " + grade.toLowerCase() : "Экзамен не сдан"), h("p", { class: "muted", style: { margin: "4px 0 0" } }, passed ? "Вы показали понимание устройства рынка, анализа графиков и управления риском." : "Для сдачи нужно 70%. Повторите слабые темы и попробуйте снова."))));
      var st = h("div", { class: "stats", style: { marginTop: "14px" } });
      [["Теория", result.theory, WEIGHTS.theory], ["Анализ графика", result.practice, WEIGHTS.practice], ["Риск", result.risk, WEIGHTS.risk], ["Торговый план", result.plan, WEIGHTS.plan]].forEach(function (p) {
        st.appendChild(h("div", { class: "stat" }, h("div", { class: "stat__label" }, p[0] + " (вес " + p[2] + "%)"), h("div", { class: "stat__value " + (p[1] >= 0.7 ? "up" : "down") }, Math.round(p[1] * 100) + "%")));
      });
      stage.appendChild(st);
      var weak = Object.keys(result.weakModules).sort(function (a, b) { return result.weakModules[b] - result.weakModules[a]; });
      if (weak.length) stage.appendChild(h("div", { class: "card section" }, h("h3", null, "Что стоит повторить"), h("ul", null, weak.map(function (m) { var M = CA.course.modules[m - 1]; return M ? h("li", null, "Модуль " + m + ". " + M.title + " (ошибок: " + result.weakModules[m] + ")") : null; }))));
      stage.appendChild(h("p", { class: "disclaimer section" }, "Результат экзамена отражает понимание материала курса. Это не профессиональная квалификация и не гарантия успеха в реальной торговле. Перед торговлей реальными деньгами продолжайте практику на демо-счёте и никогда не рискуйте суммой, потерю которой не можете себе позволить."));
      stage.appendChild(h("div", { class: "btn-row section" }, h("a", { class: "btn btn--primary", href: "#/profile" }, "Мой профиль"), h("button", { class: "btn", onclick: function () { CA.router.reload(); } }, "К экзамену")));
    }
    theory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
