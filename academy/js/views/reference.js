/* Словарь трейдера (поиск), карточки для повторения, разбор ошибок. */
(function (g) {
  "use strict";
  var CA = g.CA;
  var h = CA.dom.h, esc = CA.dom.esc;

  function terms() { return CA.glossary.slice().sort(function (a, b) { return a.t.localeCompare(b.t, "ru"); }); }
  function norm(s) { return String(s).toLowerCase().replace(/ё/g, "е"); }
  function highlight(text, q) {
    var t = esc(text);
    if (!q) return t;
    var i = norm(text).indexOf(norm(q));
    if (i < 0) return t;
    return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
  }

  // ───── Словарь ─────
  CA.views.glossary = function () {
    var all = terms(), q = "", letter = null;
    var wrap = h("div");
    wrap.appendChild(h("div", { class: "page-head" }, h("div", { class: "eyebrow" }, all.length + " терминов"), h("h1", null, "Словарь трейдера"), h("p", null, "Ищите по-русски или по-английски. Термины из словаря используются в карточках для повторения.")));
    var input = h("input", { class: "input", type: "search", placeholder: "Например: спред, ликвидация, RSI…", "aria-label": "Поиск термина", oninput: function () { q = input.value.trim(); letter = null; render(); } });
    var letters = h("div", { class: "letters" });
    var firsts = [];
    all.forEach(function (t) { var f = t.t[0].toUpperCase(); if (firsts.indexOf(f) < 0) firsts.push(f); });
    firsts.forEach(function (f) { letters.appendChild(h("button", { type: "button", onclick: function (e) { letter = letter === f ? null : f; q = ""; input.value = ""; render(); } }, f)); });
    var list = h("div", { class: "stack", style: { gap: "8px" } }), count = h("p", { class: "small muted" });
    function render() {
      Array.from(letters.children).forEach(function (b) { b.classList.toggle("is-active", b.textContent === letter); });
      var nq = norm(q);
      var res = all.filter(function (t) {
        if (letter) return t.t[0].toUpperCase() === letter;
        if (!nq) return true;
        return norm(t.t).indexOf(nq) >= 0 || norm(t.en || "").indexOf(nq) >= 0 || norm(t.d).indexOf(nq) >= 0;
      });
      res.sort(function (a, b) { var an = norm(a.t).indexOf(nq) === 0 ? 0 : 1, bn = norm(b.t).indexOf(nq) === 0 ? 0 : 1; return an - bn || a.t.localeCompare(b.t, "ru"); });
      count.textContent = q || letter ? "Найдено: " + res.length : "";
      list.innerHTML = "";
      if (!res.length) list.appendChild(h("div", { class: "empty" }, h("div", { class: "empty__icon" }, "🔍"), "Ничего не найдено. Попробуйте другое слово."));
      res.forEach(function (t) {
        list.appendChild(h("div", { class: "term", id: "term-" + t.t },
          h("div", { class: "term__name" }, h("span", { html: highlight(t.t, q) }), t.en ? h("span", { class: "term__en", html: highlight(t.en, q) }) : null),
          h("p", { html: highlight(t.d, q.length > 2 ? q : "") }),
          t.lesson ? h("a", { class: "small", href: "#/lesson/" + t.lesson }, "Урок по теме →") : null));
      });
    }
    wrap.appendChild(h("div", { class: "search" }, input)); wrap.appendChild(letters); wrap.appendChild(count); wrap.appendChild(list);
    render();
    setTimeout(function () { input.focus({ preventScroll: true }); }, 50);
    return wrap;
  };

  // ───── Карточки (интервальное повторение) ─────
  CA.views.cards = function () {
    var store = CA.app.store, all = terms(), mode = "due";
    var wrap = h("div");
    wrap.appendChild(h("div", { class: "page-head" }, h("div", { class: "eyebrow" }, "Интервальное повторение"), h("h1", null, "Карточки терминов"),
      h("p", null, "Нажмите на карточку, чтобы увидеть определение, и честно отметьте, знали ли вы ответ. Знакомые карточки будут возвращаться реже (через 1, 3, 7, 14 дней), незнакомые — снова сегодня.")));
    var seg = h("div", { class: "seg", style: { marginBottom: "16px" } });
    [["due", "К повторению"], ["all", "Все термины"], ["hard", "Сложные"]].forEach(function (m) { seg.appendChild(h("button", { type: "button", dataset: { m: m[0] }, onclick: function () { mode = m[0]; start(); } }, m[1])); });
    var stage = h("div"), info = h("p", { class: "small muted", style: { textAlign: "center" } });
    var deck = [], k = 0;
    function start() {
      Array.from(seg.children).forEach(function (b) { b.classList.toggle("is-active", b.dataset.m === mode); });
      var R = CA.rng.create(CA.chartSpec.newSeed());
      deck = R.shuffle(all.filter(function (t) {
        var c = store.state.cards[t.t];
        if (mode === "due") return store.cardDue(t.t);
        if (mode === "hard") return c && c.box <= 2;
        return true;
      }));
      k = 0; show();
    }
    function show() {
      stage.innerHTML = "";
      var d = store.daily();
      info.textContent = "Сегодня повторено: " + ((d.counts && d.counts.cards) || 0) + " · всего: " + store.state.cardsReviewed;
      if (k >= deck.length) {
        stage.appendChild(h("div", { class: "empty" }, h("div", { class: "empty__icon" }, "✅"), h("h3", null, mode === "due" ? "На сегодня всё повторено" : "Колода закончилась"), h("p", null, "Возвращайтесь завтра или повторите все термины."), h("button", { class: "btn", onclick: function () { mode = "all"; start(); } }, "Повторить все")));
        return;
      }
      var t = deck[k], c = store.state.cards[t.t];
      var card = h("div", { class: "flashcard", tabindex: "0", role: "button", "aria-label": "Перевернуть карточку", onclick: flip, onkeydown: function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); } } },
        h("div", { class: "flashcard__inner" },
          h("div", { class: "flashcard__face" }, h("div", { class: "flashcard__term" }, t.t), t.en ? h("div", { class: "muted" }, t.en) : null, h("div", { class: "flashcard__hint" }, "Нажмите, чтобы увидеть определение")),
          h("div", { class: "flashcard__face flashcard__face--back" }, h("div", { class: "flashcard__def" }, t.d))));
      function flip() { card.classList.toggle("is-flipped"); btns.hidden = false; }
      var btns = h("div", { class: "btn-row", hidden: true, style: { justifyContent: "center", marginTop: "16px" } },
        h("button", { class: "btn btn--sell", onclick: function () { answer(false); } }, "Не знал"),
        h("button", { class: "btn btn--buy", onclick: function () { answer(true); } }, "Знал"));
      function answer(knew) { store.reviewCard(t.t, knew); CA.daily.bump("cards", 10, "cards"); k++; show(); }
      stage.appendChild(h("p", { class: "small muted", style: { textAlign: "center" } }, "Карточка " + (k + 1) + " из " + deck.length + (c ? " · уровень знания " + c.box + "/5" : " · новая")));
      stage.appendChild(card); stage.appendChild(btns);
    }
    wrap.appendChild(seg); wrap.appendChild(stage); wrap.appendChild(info);
    start();
    return wrap;
  };

  // ───── Разбор ошибок ─────
  CA.views.mistakes = function () {
    var store = CA.app.store;
    var wrap = h("div");
    wrap.appendChild(h("div", { class: "page-head" }, h("div", { class: "eyebrow" }, "Работа над ошибками"), h("h1", null, "Разбор ошибок"),
      h("p", null, "Здесь собраны вопросы, на которые вы ответили неверно, и типичные ошибки трейдеров. Ответьте на вопрос правильно ещё раз — он будет отмечен как исправленный.")));
    var seg = h("div", { class: "seg", style: { marginBottom: "16px" } }), body = h("div"), tab = "mine";
    [["mine", "Мои ошибки в тестах"], ["sim", "Ошибки в симуляторе"], ["typical", "Типичные ошибки трейдеров"]].forEach(function (m) { seg.appendChild(h("button", { type: "button", dataset: { m: m[0] }, onclick: function () { tab = m[0]; render(); } }, m[1])); });
    function render() {
      Array.from(seg.children).forEach(function (b) { b.classList.toggle("is-active", b.dataset.m === tab); });
      body.innerHTML = "";
      if (tab === "mine") {
        var ids = Object.keys(store.state.mistakes).filter(function (id) { return CA.course.questions[id]; });
        var open = ids.filter(function (id) { return !store.state.mistakes[id].fixed; }), fixed = ids.length - open.length;
        body.appendChild(h("p", { class: "small muted" }, "Открытых ошибок: " + open.length + " · исправлено: " + fixed));
        if (!open.length) { body.appendChild(h("div", { class: "empty" }, h("div", { class: "empty__icon" }, "🎯"), ids.length ? "Все ошибки исправлены. Отличная работа!" : "Пока ошибок нет. Они появятся здесь после тестов.")); return; }
        open.sort(function (a, b) { return store.state.mistakes[b].count - store.state.mistakes[a].count; });
        open.forEach(function (id) {
          var item = CA.course.questions[id], m = store.state.mistakes[id];
          var box = h("div", { class: "card", style: { marginBottom: "12px" } },
            h("div", { class: "small muted", style: { marginBottom: "6px" } }, "Урок: ", h("a", { href: "#/lesson/" + item.lesson.id }, item.lesson.title), " · ошибок: " + m.count));
          var quiz = CA.Quiz([item.q], { pass: 100, onSubmit: function (c) { if (c === 1) { store.fixMistake(id); CA.dom.toast("Ошибка исправлена!", "success"); setTimeout(render, 1200); } } });
          box.appendChild(quiz.el);
          body.appendChild(box);
        });
      } else if (tab === "sim") {
        var counts = {}, reviews = {};
        try { reviews = (JSON.parse(CA.progress.safeStorage().get("ca.sim.v1")) || {}).reviews || {}; } catch (e) { reviews = {}; }
        Object.keys(reviews).forEach(function (k2) { (reviews[k2].items || []).forEach(function (it) { if (it.kind === "bad" || it.kind === "warn") { var key = it.title.replace(/[\d.,]+%?/g, "N"); counts[key] = counts[key] || { n: 0, it: it }; counts[key].n++; } }); });
        var keys = Object.keys(counts).sort(function (a, b) { return counts[b].n - counts[a].n; });
        if (!keys.length) { body.appendChild(h("div", { class: "empty" }, h("div", { class: "empty__icon" }, "🧪"), "Ошибок пока нет. Сделайте несколько сделок в ", h("a", { href: "#/sim" }, "симуляторе"), " с включённым режимом обучения.")); return; }
        body.appendChild(h("p", { class: "small muted" }, "Повторяющиеся замечания тренера по вашим учебным сделкам. Чаще всего встречающиеся — сверху."));
        keys.forEach(function (k3) {
          var c = counts[k3];
          body.appendChild(h("div", { class: "callout callout--" + (c.it.kind === "bad" ? "risk" : "warn") }, h("div", { class: "callout__title" }, c.it.title.replace(/:.*$/, "") + " · ×" + c.n), h("p", null, c.it.text)));
        });
      } else {
        CA.typicalMistakes.forEach(function (m) {
          body.appendChild(h("div", { class: "card", style: { marginBottom: "12px" } }, h("h3", null, m.title), h("p", { html: m.what }), h("p", { class: "small", html: "<b>Почему это происходит:</b> " + m.why }), h("p", { class: "small", html: "<b>Как исправить:</b> " + m.fix }), m.lesson ? h("a", { class: "small", href: "#/lesson/" + m.lesson }, "Урок по теме →") : null));
        });
      }
    }
    wrap.appendChild(seg); wrap.appendChild(body);
    render();
    return wrap;
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
