/* Исторические кейсы, калькуляторы, лаборатория стратегий, профиль и прогресс. */
(function (g) {
  "use strict";
  var CA = g.CA;
  var h = CA.dom.h, fmt = CA.dom.fmt;

  // ───── Исторические кейсы ─────
  CA.views.cases = function (route) {
    var store = CA.app.store, id = route.params[0];
    if (id) return caseDetail(id);
    var wrap = h("div");
    wrap.appendChild(h("div", { class: "page-head" }, h("div", { class: "eyebrow" }, "Разбор реальных событий"), h("h1", null, "Исторические рыночные ситуации"),
      h("p", null, "Крупные события в истории крипторынка и уроки, которые из них следуют. Описания основаны на широко известных фактах; графики — схематичные реконструкции формы движения, а не реальные котировки.")));
    var grid = h("div", { class: "cards" });
    CA.cases.forEach(function (c) {
      grid.appendChild(h("a", { class: "card card--link", href: "#/cases/" + c.id },
        h("div", { class: "case-card__date" }, c.date), h("div", { class: "card__title", style: { marginTop: "4px" } }, c.title), h("p", { class: "small muted" }, c.short),
        store.state.casesRead[c.id] ? h("span", { class: "chip chip--up" }, "✓ изучено") : h("span", { class: "chip" }, "+" + store.XP.caseRead + " XP")));
    });
    wrap.appendChild(grid);
    return wrap;
  };
  function caseDetail(id) {
    var store = CA.app.store, c = CA.cases.find(function (x) { return x.id === id; });
    if (!c) return CA.views.notFound();
    CA.app.setTitle(c.title, "Кейсы");
    var wrap = h("article", { class: "lesson__body", style: { margin: "0 auto" } });
    wrap.appendChild(h("a", { href: "#/cases", class: "small" }, "← Все кейсы"));
    wrap.appendChild(h("div", { class: "lesson-hero", style: { marginTop: "10px" } }, h("div", { class: "eyebrow" }, c.date), h("h1", null, c.title), h("p", { class: "muted" }, c.short)));
    if (c.facts) wrap.appendChild(h("div", { class: "case-facts" }, c.facts.map(function (f) { return h("div", null, h("b", null, f[1]), f[0]); })));
    if (c.shape) {
      var holder = h("div");
      wrap.appendChild(h("figure", { class: "figure" }, holder, h("figcaption", { html: "Схематичная реконструкция формы движения. <span class='tag-data'>Не реальные котировки</span> " + (c.shapeCaption || "") })));
      var piv = c.shape.map(function (p) { return { i: p[0], p: p[1] }; });
      var candles = CA.market.fromPivots(piv, { seed: "case-" + c.id, vol: c.vol || 0.02, tf: 1440 });
      setTimeout(function () { CA.Chart(holder, { candles: candles, tf: 1440, height: 280, timeLabels: "index", title: "Схема", dataLabel: "Схема, не котировки", pan: false, showLast: false, legend: false }); }, 0);
    }
    wrap.appendChild(h("h2", null, "Что произошло"));
    wrap.appendChild(CA.renderBlocks(c.story));
    wrap.appendChild(h("h2", { style: { marginTop: "28px" } }, "Уроки для трейдера"));
    wrap.appendChild(h("div", { class: "summary" }, h("ul", null, c.lessons.map(function (l) { return h("li", { html: l }); }))));
    if (c.question) {
      wrap.appendChild(h("h2", { style: { marginTop: "28px" } }, "Проверьте себя"));
      wrap.appendChild(CA.Quiz([Object.assign({ id: "case-" + c.id }, c.question)], { pass: 100 }).el);
    }
    var done = !!store.state.casesRead[c.id];
    var btn = h("button", { class: "btn btn--primary", disabled: done, onclick: function () { store.readCase(c.id, CA.cases.length); btn.disabled = true; btn.textContent = "✓ Кейс изучен"; } }, done ? "✓ Кейс изучен" : "Отметить как изученный");
    wrap.appendChild(h("div", { class: "next-box" }, h("span", { class: "small muted" }, "Источники: публичные заявления компаний, судебные и регуляторные документы, сообщения деловых СМИ. Цифры округлены."), btn));
    return wrap;
  }

  // ───── Калькуляторы ─────
  CA.views.tools = function () {
    var wrap = h("div");
    wrap.appendChild(h("div", { class: "page-head" }, h("div", { class: "eyebrow" }, "Инструменты"), h("h1", null, "Калькуляторы трейдера"), h("p", null, "Посчитайте риск до входа в сделку: размер позиции, результат с учётом комиссий, цену ликвидации при плече и последствия просадки.")));
    var st = h("div", { class: "stack" });
    st.appendChild(CA.widgets["calc-position"]({ flat: false }));
    st.appendChild(CA.widgets["calc-recovery"]());
    st.appendChild(CA.widgets["calc-liq"]());
    st.appendChild(CA.widgets.expectancy());
    wrap.appendChild(st);
    return wrap;
  };

  // ───── Лаборатория стратегий ─────
  CA.views.lab = function () {
    var wrap = h("div");
    wrap.appendChild(h("div", { class: "page-head" }, h("div", { class: "eyebrow" }, "Бэктест на синтетической истории"), h("h1", null, "Лаборатория стратегий"),
      h("p", null, "Выберите правило входа, стоп и цель, затем проверьте систему на обучающем отрезке (первые 60% данных) и на проверочном (оставшиеся 40%). Если результат держится только на обучающем отрезке, вы, скорее всего, подогнали параметры под историю.")));
    wrap.appendChild(h("div", { class: "callout callout--warn" }, h("div", { class: "callout__title" }, "Важно"), h("p", null, "Данные синтетические, а прошлые результаты не гарантируют будущих. Задача лаборатории — научиться проверять идеи и понимать статистику (просадку, винрейт, profit factor), а не найти «прибыльную стратегию».")));
    wrap.appendChild(CA.widgets.lab({}));
    wrap.appendChild(h("div", { class: "section" }, CA.widgets["indicator-lab"]({ initial: ["ema20", "sma50"], panes: ["rsi"] })));
    return wrap;
  };

  // ───── Профиль ─────
  CA.views.profile = function () {
    var store = CA.app.store, st = store.state, lv = store.level(), cp = store.courseProgress();
    var wrap = h("div");
    wrap.appendChild(h("div", { class: "page-head" }, h("div", { class: "eyebrow" }, "Прогресс"), h("h1", null, "Профиль ученика")));
    var quizzes = Object.keys(st.lessons).map(function (k) { return st.lessons[k].quizBest; }).filter(function (x) { return x != null; });
    var avg = quizzes.length ? quizzes.reduce(function (a, b) { return a + b; }, 0) / quizzes.length : null;
    var tasksDone = Object.keys(st.lessons).reduce(function (s, k) { return s + Object.keys(st.lessons[k].practice || {}).length; }, 0);
    wrap.appendChild(h("div", { class: "card" },
      h("div", { style: { display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" } },
        h("div", { class: "ring", style: { "--p": lv.pct, width: "76px", height: "76px" } }, h("span", { style: { width: "62px", height: "62px", fontSize: "18px" } }, String(lv.index))),
        h("div", { style: { flex: "1 1 220px" } }, h("h2", { style: { margin: 0 } }, lv.title), h("div", { class: "muted small" }, lv.xp + " XP" + (lv.to ? " · до уровня «" + lv.nextTitle + "» осталось " + (lv.to - lv.xp) + " XP" : " · максимальный уровень")), h("div", { class: "bar", style: { marginTop: "8px", maxWidth: "360px" } }, h("i", { style: { width: lv.pct + "%" } }))))));
    var stats = h("div", { class: "stats section" });
    [["Курс пройден", Math.round(cp.pct) + "%", cp.done + " из " + cp.total + " уроков"], ["Средний балл тестов", avg == null ? "—" : Math.round(avg) + "%", quizzes.length + " тестов сдано"], ["Практических заданий", String(tasksDone), "выполнено"], ["Учебных сделок", String(st.counters.trades), st.counters.tradesWithStop + " со стопом"], ["Карточек повторено", String(st.cardsReviewed), "серия дней: " + store.streak()], ["Финальный экзамен", st.exam ? st.exam.best + "%" : "—", st.exam ? (st.exam.passed ? "сдан" : "не сдан") : "не начат"]].forEach(function (s) {
      stats.appendChild(h("div", { class: "stat" }, h("div", { class: "stat__label" }, s[0]), h("div", { class: "stat__value" }, s[1]), h("div", { class: "stat__sub" }, s[2])));
    });
    wrap.appendChild(stats);

    // результаты тестов
    var rows = CA.course.lessons.filter(function (L) { return st.lessons[L.id] && st.lessons[L.id].quizAttempts; }).map(function (L) {
      var r = st.lessons[L.id];
      return [L.module + "." + (CA.course.modules[L.module - 1].lessons.indexOf(L) + 1), "<a href='#/lesson/" + L.id + "'>" + CA.dom.esc(L.title) + "</a>", r.quizBest + "%", r.quizLast + "%", String(r.quizAttempts), r.status === "done" ? "<span class='up'>✓ пройден</span>" : "в процессе"];
    });
    wrap.appendChild(h("section", { class: "section" }, h("h2", null, "Результаты тестов"), rows.length ? CA.renderBlocks([{ table: { head: ["#", "Урок", "Лучший", "Последний", "Попыток", "Статус"], rows: rows } }]) : h("p", { class: "muted small" }, "Тесты ещё не пройдены.")));

    // достижения
    var ach = h("div", { class: "ach-grid" });
    store.ACHIEVEMENTS.forEach(function (a) {
      var got = st.achievements[a.id];
      ach.appendChild(h("div", { class: "ach" + (got ? "" : " is-locked") }, h("div", { class: "ach__icon" }, a.icon), h("div", null, h("b", null, a.title), h("span", null, got ? "Получено " + new Date(got).toLocaleDateString("ru-RU") : a.text))));
    });
    wrap.appendChild(h("section", { class: "section" }, h("h2", null, "Достижения · " + Object.keys(st.achievements).length + " из " + store.ACHIEVEMENTS.length), ach));

    // уровни
    wrap.appendChild(h("section", { class: "section" }, h("h2", null, "Уровни"), h("div", { class: "btn-row" }, store.LEVELS.map(function (l, i) { return h("span", { class: "chip" + (lv.index > i ? " chip--accent" : "") }, (i + 1) + ". " + l.title + " · " + l.xp + " XP"); }))));

    // торговый план
    if (st.plan) {
      var p = st.plan;
      wrap.appendChild(h("section", { class: "section" }, h("h2", null, "Мой торговый план"), h("div", { class: "card" }, CA.renderBlocks([{ table: { head: ["Пункт", "Правило"], rows: [
        ["Стиль / таймфрейм", CA.dom.esc(p.style + " · " + p.tf)], ["Состояние рынка", CA.dom.esc(p.market)], ["Вход", CA.dom.esc(p.entry)], ["Stop Loss", CA.dom.esc(p.stop)], ["Выход", CA.dom.esc(p.exit)],
        ["Риск на сделку", CA.dom.esc(p.risk) + "%"], ["Дневной лимит убытка", CA.dom.esc(p.daily) + "%"], ["Сделок в день, не более", CA.dom.esc(p.maxTrades)], ["Когда не торгую", CA.dom.esc(p.noTrade)]] } }]))));
    }

    // история
    var hist = h("ul", { class: "timeline" });
    st.history.slice(0, 40).forEach(function (e) { hist.appendChild(h("li", null, h("time", null, CA.dom.date(e.ts)), h("span", null, e.text))); });
    wrap.appendChild(h("section", { class: "section" }, h("h2", null, "История обучения"), st.history.length ? hist : h("p", { class: "muted small" }, "Пока пусто — начните первый урок.")));

    // настройки
    var set = h("div", { class: "card stack", style: { gap: "10px" } },
      h("label", { class: "btn-row" }, h("input", { type: "checkbox", checked: st.settings.freeMode, onchange: function (e) { store.setSetting("freeMode", e.target.checked); } }), "Свободный режим (все уроки открыты)"),
      h("label", { class: "btn-row" }, h("input", { type: "checkbox", checked: st.settings.coach, onchange: function (e) { store.setSetting("coach", e.target.checked); } }), "Режим обучения в симуляторе (разбор каждой сделки)"),
      h("p", { class: "small muted", style: { margin: 0 } }, "Прогресс хранится только в этом браузере (localStorage). Очистка данных сайта удалит прогресс — сохраните резервную копию."),
      h("div", { class: "btn-row" },
        h("button", { class: "btn btn--sm", onclick: function () {
          var blob = new Blob([store.exportJSON()], { type: "application/json" }), a = h("a", { href: URL.createObjectURL(blob), download: "crypto-academy-progress.json" });
          document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 100);
        } }, "Скачать резервную копию"),
        h("label", { class: "btn btn--sm" }, "Восстановить из файла", h("input", { type: "file", accept: "application/json", hidden: true, onchange: function (e) {
          var f = e.target.files[0]; if (!f) return;
          f.text().then(function (txt) {
            try { var d = JSON.parse(txt); if (!d || d.v !== 1 || typeof d.lessons !== "object") throw new Error("bad"); CA.progress.safeStorage().set(CA.progress.KEY, txt); location.reload(); }
            catch (err) { CA.dom.toast("Файл не похож на резервную копию Crypto Academy", "error"); }
          });
        } })),
        h("button", { class: "btn btn--sm btn--sell", onclick: function () { if (confirm("Удалить весь прогресс обучения? Это действие нельзя отменить.")) { store.reset(); CA.router.go("#/"); } } }, "Сбросить прогресс")));
    wrap.appendChild(h("section", { class: "section" }, h("h2", null, "Настройки"), set));
    return wrap;
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
