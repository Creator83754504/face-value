/* Программа курса: модули, уроки, статусы, финальный экзамен. */
(function (g) {
  "use strict";
  var CA = g.CA;
  var h = CA.dom.h;

  function lessonRow(L, store) {
    var st = store.lessonStatus(L.id), rec = store.state.lessons[L.id];
    var mark = st === "done" ? "✓" : st === "locked" ? "🔒" : st === "progress" ? "•" : String(L.module + "." + (CA.course.modules[L.module - 1].lessons.indexOf(L) + 1));
    var meta = st === "done" ? "тест " + rec.quizBest + "%" : "≈ " + L.minutes + " мин";
    var attrs = { class: "lesson-row is-" + st };
    if (st === "locked") return h("li", null, h("div", Object.assign(attrs, { title: "Завершите предыдущий урок" }), h("span", { class: "lesson-row__state" }, mark), h("span", { class: "lesson-row__title" }, L.title), h("span", { class: "lesson-row__meta" }, meta)));
    return h("li", null, h("a", Object.assign(attrs, { href: "#/lesson/" + L.id }), h("span", { class: "lesson-row__state" }, mark), h("span", { class: "lesson-row__title" }, L.title, store.isFavorite(L.id) ? h("span", { class: "warn", style: { marginLeft: "6px" } }, "★") : null), h("span", { class: "lesson-row__meta" }, meta)));
  }
  CA.lessonRow = lessonRow;

  CA.views.course = function () {
    var store = CA.app.store, cp = store.courseProgress();
    var wrap = h("div");
    wrap.appendChild(h("div", { class: "page-head" }, h("div", { class: "eyebrow" }, "Программа"), h("h1", null, "8 модулей: от нуля до собственного торгового плана"),
      h("p", null, "Уроки открываются последовательно: чтобы перейти дальше, выполните практику и сдайте тест урока минимум на " + store.PASS + "%. Пройдено " + cp.done + " из " + cp.total + " уроков.")));
    var free = h("label", { class: "btn-row small muted", style: { marginBottom: "16px" } },
      h("input", { type: "checkbox", checked: store.state.settings.freeMode, onchange: function (e) { store.setSetting("freeMode", e.target.checked); CA.router.reload(); } }),
      "Свободный режим — открыть все уроки (для повторения или если вы уже знакомы с темой)");
    wrap.appendChild(free);
    var list = h("div", { class: "stack" });
    CA.course.modules.forEach(function (M) {
      var done = M.lessons.filter(function (l) { return store.isDone(l.id); }).length, pct = done / M.lessons.length * 100;
      var open = M.lessons.some(function (l) { return store.lessonStatus(l.id) !== "locked" && !store.isDone(l.id); });
      var det = h("details", { class: "card", open: open || null },
        h("summary", { style: { listStyle: "none", cursor: "pointer" } },
          h("div", { class: "module-card" + (done === M.lessons.length ? " is-done" : "") },
            h("div", { class: "module-card__num" }, done === M.lessons.length ? "✓" : String(M.n)),
            h("div", null, h("div", { class: "card__title" }, "Модуль " + M.n + ". " + M.title), h("div", { class: "muted small" }, M.subtitle),
              h("div", { class: "module-card__meta" }, h("span", null, M.lessons.length + " " + CA.dom.plural(M.lessons.length, "урок", "урока", "уроков")), h("span", null, "пройдено " + done)),
              h("div", { class: "bar bar--up" }, h("i", { style: { width: pct + "%" } }))),
            h("span", { class: "chip" + (done === M.lessons.length ? " chip--up" : "") }, Math.round(pct) + "%"))),
        h("ul", { class: "lesson-list" }, M.lessons.map(function (L) { return lessonRow(L, store); })));
      list.appendChild(det);
    });
    var exUnlocked = store.allLessonsDone() || store.state.settings.freeMode;
    var ex = store.state.exam;
    list.appendChild(h("a", { class: "card card--link", href: "#/exam" },
      h("div", { class: "module-card" + (ex && ex.passed ? " is-done" : "") },
        h("div", { class: "module-card__num" }, ex && ex.passed ? "✓" : "8"),
        h("div", null, h("div", { class: "card__title" }, "Модуль 8. Финальный экзамен"), h("div", { class: "muted small" }, "Теория, анализ графика, расчёт риска и собственный торговый план. Итоговая оценка знаний.")),
        h("span", { class: "chip" + (exUnlocked ? " chip--accent" : "") }, ex ? "лучший " + ex.best + "%" : exUnlocked ? "доступен" : "🔒 после модулей 1–7"))));
    wrap.appendChild(list);
    return wrap;
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
