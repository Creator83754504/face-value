/* Страница урока: цель → теория → разбор графиков → ошибки → практика → тест → конспект → условия перехода. */
(function (g) {
  "use strict";
  var CA = g.CA;
  var h = CA.dom.h;

  // ───── Блоки контента ─────
  function renderBlocks(blocks) {
    var frag = document.createDocumentFragment();
    (blocks || []).forEach(function (b) { var el = block(b); if (el) frag.appendChild(el); });
    return frag;
  }
  function block(b) {
    if (typeof b === "string") return h("p", { html: b });
    if (b.h) return h("h3", { html: b.h });
    if (b.list) return h(b.ol ? "ol" : "ul", null, b.list.map(function (x) { return h("li", { html: x }); }));
    if (b.callout) {
      var icons = { info: "ℹ️", warn: "⚠️", risk: "⛔", tip: "💡" };
      return h("div", { class: "callout callout--" + b.callout }, b.title ? h("div", { class: "callout__title" }, h("span", { "aria-hidden": "true" }, icons[b.callout] || ""), b.title) : null, h("div", { html: b.text }));
    }
    if (b.fig) return h("figure", { class: "figure" }, h("div", { html: CA.figures.render(b.fig) }), b.caption ? h("figcaption", { html: b.caption }) : null);
    if (b.chart) {
      var holder = h("div");
      var fig = h("figure", { class: "figure" }, holder, h("figcaption", { html: (b.caption || "") + " <span class='tag-data'>" + CA.market.DATA_LABEL + "</span>" }));
      CA.chartSpec.mount(holder, b.chart);
      return fig;
    }
    if (b.example) {
      var dl = h("dl");
      b.example.rows.forEach(function (r) { dl.appendChild(h("dt", { html: r[0] })); dl.appendChild(h("dd", { html: r[1] })); });
      if (b.example.total) { dl.appendChild(h("dt", { html: "<b>" + b.example.total[0] + "</b>" })); dl.appendChild(h("dd", { class: "total", html: b.example.total[1] })); }
      return h("div", { class: "example" }, h("div", { class: "example__title" }, b.example.title || "Учебный пример"), dl, b.example.note ? h("p", { class: "small muted", style: { margin: "10px 0 0" }, html: b.example.note }) : null);
    }
    if (b.table) {
      return h("div", { class: "table-wrap" }, h("table", { class: "table" },
        h("thead", null, h("tr", null, b.table.head.map(function (c) { return h("th", { html: c }); }))),
        h("tbody", null, b.table.rows.map(function (r) { return h("tr", null, r.map(function (c) { return h("td", { html: String(c) }); })); }))));
    }
    if (b.formula) return h("div", { class: "formula", html: b.formula });
    if (b.widget) { var w = CA.widgets[b.widget]; return w ? h("div", { style: { margin: "16px 0" } }, w(b.opts)) : null; }
    return null;
  }
  CA.renderBlocks = renderBlocks;

  // ───── Тест ─────
  function Quiz(questions, opts) {
    opts = opts || {};
    var wrap = h("div", { class: "quiz" });
    var answers = {}, submitted = false, order;
    function shuffle() {
      var R = CA.rng.create(CA.chartSpec.newSeed());
      order = questions.map(function (q) { return q.num ? null : R.shuffle(q.a.map(function (_, i) { return i; })); });
    }
    function isMulti(q) { return Array.isArray(q.c); }
    function render() {
      wrap.innerHTML = "";
      questions.forEach(function (q, qi) {
        var card = h("div", { class: "q", id: "q-" + q.id });
        card.appendChild(h("div", { class: "q__num" }, "Вопрос " + (qi + 1) + " из " + questions.length));
        card.appendChild(h("div", { class: "q__text", html: q.q }));
        if (isMulti(q)) card.appendChild(h("div", { class: "q__hint" }, "Выберите все верные варианты"));
        if (q.num) {
          var inp = h("input", { class: "input num", inputmode: "decimal", style: { maxWidth: "220px" }, placeholder: "Ответ" + (q.num.unit ? ", " + q.num.unit : ""), value: answers[qi] == null ? "" : answers[qi], disabled: submitted, "aria-label": "Ответ на вопрос " + (qi + 1),
            oninput: function () { answers[qi] = inp.value; } });
          card.appendChild(inp);
        } else {
          var opts2 = h("div", { class: "opts" });
          order[qi].forEach(function (ai) {
            var sel = isMulti(q) ? (answers[qi] || []).indexOf(ai) >= 0 : answers[qi] === ai;
            var cls = "opt" + (isMulti(q) ? " opt--multi" : "");
            if (submitted) {
              var correct = isMulti(q) ? q.c.indexOf(ai) >= 0 : q.c === ai;
              if (correct) cls += " is-correct"; else if (sel) cls += " is-wrong";
            } else if (sel) cls += " is-selected";
            opts2.appendChild(h("button", { class: cls, type: "button", disabled: submitted, "aria-pressed": sel ? "true" : "false", onclick: function () {
              if (isMulti(q)) { var a = answers[qi] || []; var k = a.indexOf(ai); if (k >= 0) a.splice(k, 1); else a.push(ai); answers[qi] = a; }
              else answers[qi] = ai;
              render();
            } }, h("span", { class: "opt__mark" }, submitted ? (cls.indexOf("is-correct") >= 0 ? "✓" : cls.indexOf("is-wrong") >= 0 ? "✕" : "") : sel ? "✓" : ""), h("span", { html: q.a[ai] })));
          });
          card.appendChild(opts2);
        }
        if (submitted) {
          var ok = check(q, answers[qi]);
          card.appendChild(h("div", { class: "q__explain" + (ok ? "" : " is-wrong"), html: (ok ? "<b>Верно.</b> " : "<b>Неверно.</b> ") + (q.num ? "Ответ: " + CA.dom.fmt(q.num.answer, q.num.digits == null ? 2 : q.num.digits) + (q.num.unit ? " " + q.num.unit : "") + ". " : "") + (q.e || "") }));
        }
        wrap.appendChild(card);
      });
      var res = h("div");
      if (!submitted) {
        res.appendChild(h("div", { class: "btn-row" }, h("button", { class: "btn btn--primary btn--lg", onclick: submit }, "Проверить ответы"), h("span", { class: "small muted" }, "Для прохождения нужно " + (opts.pass || 70) + "% верных ответов")));
      } else {
        var correct = questions.filter(function (q, i) { return check(q, answers[i]); }).length, pct = Math.round(correct / questions.length * 100), pass = pct >= (opts.pass || 70);
        res.appendChild(h("div", { class: "quiz-result " + (pass ? "is-pass" : "is-fail") },
          h("div", { class: "ring", style: { "--p": pct } }, h("span", null, pct + "%")),
          h("div", { style: { flex: "1 1 220px" } }, h("b", null, pass ? "Тест пройден" : "Тест не пройден"), h("p", { class: "small muted", style: { margin: "2px 0 0" } }, "Верных ответов: " + correct + " из " + questions.length + ". " + (pass ? "Ошибки сохранены в разделе «Разбор ошибок»." : "Перечитайте теорию и попробуйте снова — варианты ответов будут перемешаны."))),
          h("button", { class: "btn", onclick: function () { submitted = false; answers = {}; shuffle(); render(); } }, "Пройти заново")));
      }
      wrap.appendChild(res);
    }
    function check(q, a) {
      if (q.num) { var v = CA.parseNum(a); return isFinite(v) && Math.abs(v - q.num.answer) <= (q.num.tol == null ? Math.abs(q.num.answer) * 0.01 : q.num.tol) + 1e-9; }
      if (Array.isArray(q.c)) { a = a || []; return a.length === q.c.length && q.c.every(function (x) { return a.indexOf(x) >= 0; }); }
      return a === q.c;
    }
    function submit() {
      var missing = questions.map(function (q, i) { return answers[i] == null || answers[i] === "" || (Array.isArray(answers[i]) && !answers[i].length) ? i : -1; }).filter(function (i) { return i >= 0; });
      if (missing.length) {
        CA.dom.toast("Ответьте на все вопросы (не отвечено: " + missing.length + ")", "error");
        var el = document.getElementById("q-" + questions[missing[0]].id); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      submitted = true;
      var wrong = [], correct = 0;
      questions.forEach(function (q, i) { if (check(q, answers[i])) correct++; else wrong.push({ qid: q.id }); });
      render();
      if (opts.onSubmit) opts.onSubmit(correct, questions.length, wrong);
    }
    shuffle(); render();
    return { el: wrap, check: check };
  }
  CA.Quiz = Quiz;

  // ───── Страница урока ─────
  CA.views.lesson = function (route) {
    var store = CA.app.store, L = CA.course.find(route.params[0]);
    if (!L) return CA.views.notFound();
    if (!store.isUnlocked(L.id)) {
      var prev = CA.course.lessons[CA.course.lessons.indexOf(L) - 1];
      return h("div", { class: "empty" }, h("div", { class: "empty__icon" }, "🔒"), h("h2", null, "Урок пока закрыт"),
        h("p", null, "Сначала завершите предыдущий урок" + (prev ? ": «" + prev.title + "»" : "") + ". Курс построен последовательно — каждая тема опирается на предыдущую."),
        h("div", { class: "btn-row", style: { justifyContent: "center" } }, prev ? h("a", { class: "btn btn--primary", href: "#/lesson/" + prev.id }, "К предыдущему уроку") : null, h("a", { class: "btn", href: "#/course" }, "Программа курса")));
    }
    store.visit(L.id);
    CA.app.setTitle(L.title, "Модуль " + L.module);
    var M = CA.course.modules[L.module - 1];
    var rec = store.lesson(L.id);
    var reqBox = h("div", { class: "req" }), nextBox = h("div");

    function updateReq() {
      var r = store.requirements(L.id);
      reqBox.innerHTML = "";
      reqBox.appendChild(h("div", { class: "req__item" + (r.practiceDone === r.practiceTotal ? " is-ok" : "") }, h("span", { class: "req__dot" }, r.practiceDone === r.practiceTotal ? "✓" : r.practiceDone), "Практика: " + r.practiceDone + " из " + r.practiceTotal));
      reqBox.appendChild(h("div", { class: "req__item" + (r.quizOk ? " is-ok" : "") }, h("span", { class: "req__dot" }, r.quizOk ? "✓" : "%"), "Тест ≥ " + store.PASS + "%" + (r.quizBest != null ? " (лучший: " + r.quizBest + "%)" : "")));
      var done = store.isDone(L.id), next = CA.course.lessons[CA.course.lessons.indexOf(L) + 1];
      nextBox.innerHTML = "";
      nextBox.appendChild(h("div", { class: "next-box" },
        h("div", null, h("b", null, done ? "Урок завершён ✓" : "Чтобы перейти дальше:"), h("p", { class: "small muted", style: { margin: "2px 0 0" } }, done ? "Можно двигаться дальше или повторить материал." : "выполните все практические задания и сдайте тест минимум на " + store.PASS + "%.")),
        next ? h("a", { class: "btn btn--primary" + (done ? "" : " is-disabled"), href: done ? "#/lesson/" + next.id : null, "aria-disabled": done ? null : "true", onclick: function (e) { if (!done) { e.preventDefault(); CA.dom.toast("Сначала выполните условия перехода", "error"); } } }, "Следующий урок →")
          : h("a", { class: "btn btn--primary" + (done ? "" : " is-disabled"), href: done ? "#/exam" : null, onclick: function (e) { if (!done) e.preventDefault(); } }, L.module === 7 ? "К финальному экзамену →" : "К программе курса")));
    }

    var sections = [
      { id: "theory", title: "Теория", body: renderBlocks(L.theory) },
      { id: "analysis", title: "Разбор графиков и примеров", body: renderBlocks(L.analysis) },
      { id: "mistakes", title: "Типичные ошибки новичков", body: h("div", { class: "mistakes" }, (L.mistakes || []).map(function (m) { return h("div", { class: "mistake" }, h("b", { html: m[0] }), h("p", { html: m[1] })); })) },
      { id: "practice", title: "Практика", body: h("div", null, h("p", { class: "muted" }, "Задания проверяются автоматически. Можно пробовать сколько угодно раз — графики каждый раз новые."), L.practice.map(function (t) {
        return CA.renderTask(t, { passed: !!rec.practice[t.id], onPass: function (id) { var r = store.recordTask(L.id, id); updateReq(); if (r.completed) celebrate(); } });
      })) },
      { id: "quiz", title: "Тест", body: CA.Quiz(L.quiz, { pass: store.PASS, onSubmit: function (c, t, wrong) { var r = store.recordQuiz(L.id, c, t, wrong); if (r.passed) CA.daily.complete("quiz"); updateReq(); if (r.completed) celebrate(); else if (r.passed && !store.requirements(L.id).ready) CA.dom.toast("Тест сдан! Осталось выполнить практические задания.", "success"); } }).el },
      { id: "summary", title: "Краткий конспект", body: h("div", { class: "summary" }, h("ul", null, (L.summary || []).map(function (s) { return h("li", { html: s }); }))) },
      { id: "next", title: "Условия перехода", body: nextBox }
    ].filter(function (s) { return s.id !== "analysis" || (L.analysis && L.analysis.length); });

    function celebrate() { CA.dom.toast("Урок «" + L.title + "» завершён!", "success", 4000); updateReq(); }

    var toc = h("nav", { class: "lesson__toc card", "aria-label": "Разделы урока" }, sections.map(function (s, i) { return h("a", { href: "#/lesson/" + L.id, "data-target": "sec-" + s.id, onclick: function (e) { e.preventDefault(); document.getElementById("sec-" + s.id).scrollIntoView({ behavior: "smooth" }); } }, (i + 1) + ". " + s.title); }));
    var fav = h("button", { class: "star" + (store.isFavorite(L.id) ? " is-on" : ""), "aria-label": "Добавить в избранное", title: "Избранное", onclick: function () { var on = store.toggleFavorite(L.id); fav.classList.toggle("is-on", on); CA.dom.toast(on ? "Урок добавлен в избранное" : "Урок убран из избранного"); } }, "★");
    var body = h("article", { class: "lesson__body" },
      h("header", { class: "lesson-hero" },
        h("div", { class: "eyebrow" }, "Модуль " + L.module + " · " + M.title + " · урок " + (M.lessons.indexOf(L) + 1) + " из " + M.lessons.length),
        h("div", { style: { display: "flex", gap: "8px", alignItems: "flex-start" } }, h("h1", { style: { flex: 1 } }, L.title), fav),
        h("div", { class: "btn-row", style: { marginBottom: "14px" } }, h("span", { class: "chip" }, "≈ " + L.minutes + " мин"), h("span", { class: "chip" }, L.practice.length + " " + CA.dom.plural(L.practice.length, "задание", "задания", "заданий")), h("span", { class: "chip" }, L.quiz.length + " " + CA.dom.plural(L.quiz.length, "вопрос", "вопроса", "вопросов")), store.isDone(L.id) ? h("span", { class: "chip chip--up" }, "✓ Пройден") : null),
        h("div", { class: "lesson-goal" }, h("span", { class: "lesson-goal__icon", "aria-hidden": "true" }, "🎯"), h("div", null, h("b", null, "Цель урока"), h("span", { class: "muted", html: L.goal })))),
      sections.map(function (s, i) { return h("section", { class: "lesson-section", id: "sec-" + s.id }, h("h2", null, h("span", { class: "step" }, String(i + 1).padStart(2, "0")), s.title), s.body); }));
    var aside = h("aside", { class: "lesson__aside" }, h("div", { class: "card" }, h("div", { class: "card__title" }, "Условия перехода"), reqBox), toc);
    updateReq();

    // подсветка текущего раздела в оглавлении
    if (typeof IntersectionObserver !== "undefined") {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) Array.from(toc.children).forEach(function (a) { a.classList.toggle("is-active", a.dataset.target === en.target.id); }); });
      }, { rootMargin: "-30% 0px -60% 0px" });
      setTimeout(function () { sections.forEach(function (s) { var el = document.getElementById("sec-" + s.id); if (el) io.observe(el); }); }, 0);
      CA.app.onLeave(function () { io.disconnect(); });
    }
    return h("div", { class: "lesson" }, body, aside);
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
