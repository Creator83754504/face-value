/* Главная: продолжение обучения, прогресс, ежедневные задания, быстрые ссылки. */
(function (g) {
  "use strict";
  var CA = g.CA;
  var h = CA.dom.h;

  function sparkline() {
    var c = CA.market.randomWalk({ n: 60, seed: "hero", start: 100, vol: 0.02 }), lo = Math.min.apply(null, c.map(function (x) { return x.l; })), hi = Math.max.apply(null, c.map(function (x) { return x.h; }));
    var y = function (v) { return 4 + (hi - v) / (hi - lo) * 112; }, b = "";
    c.forEach(function (k, i) { b += CA.figures.candleAt(4 + i * 5, 3, k.o, k.h, k.l, k.c, y); });
    return CA.figures.svg(304, 120, b, "");
  }

  CA.views.home = function () {
    var store = CA.app.store, st = store.state, cp = store.courseProgress(), lv = store.level(), next = store.nextLesson();
    var wrap = h("div");
    var last = st.last;
    var cont;
    if (!cp.done && !last) cont = h("a", { class: "btn btn--primary btn--lg", href: "#/lesson/" + CA.course.lessons[0].id }, "Начать обучение →");
    else cont = h("div", { class: "btn-row" },
      next ? h("a", { class: "btn btn--primary btn--lg", href: "#/lesson/" + next.id }, (store.lessonStatus(next.id) === "progress" ? "Продолжить: " : "Следующий урок: ") + next.title) : h("a", { class: "btn btn--primary btn--lg", href: "#/exam" }, "К финальному экзамену →"),
      last && last.route && last.route.indexOf(next ? next.id : "~") < 0 ? h("a", { class: "btn btn--lg", href: last.route }, "Вернуться: " + (last.title || "последний раздел")) : null);
    wrap.appendChild(h("section", { class: "hero" },
      h("div", { class: "hero__main" },
        h("div", { class: "hero__spark", html: sparkline() }),
        h("div", { class: "eyebrow" }, cp.done ? "С возвращением" : "Добро пожаловать в Crypto Academy"),
        h("h1", null, cp.done ? "Продолжим обучение" : "Научитесь читать рынок и управлять риском"),
        h("p", null, "Последовательный курс: от устройства криптовалют до анализа графиков, стратегий и собственного торгового плана. Практика на синтетических данных и симулятор с виртуальными 10 000 USDT."),
        cont),
      h("div", { class: "card" },
        h("div", { class: "card__head" }, h("h3", null, "Ваш прогресс"), h("a", { href: "#/profile", class: "small" }, "Подробнее")),
        h("div", { style: { display: "flex", gap: "16px", alignItems: "center" } },
          h("div", { class: "ring", style: { "--p": cp.pct } }, h("span", null, Math.round(cp.pct) + "%")),
          h("div", null, h("b", null, cp.done + " из " + cp.total + " уроков"), h("div", { class: "small muted" }, "Уровень " + lv.index + " · " + lv.title), h("div", { class: "small muted" }, lv.xp + " XP" + (lv.to ? " · до «" + lv.nextTitle + "» " + (lv.to - lv.xp) + " XP" : "")))),
        h("div", { class: "bar", style: { marginTop: "14px" } }, h("i", { style: { width: lv.pct + "%" } })),
        h("div", { class: "stats stats--compact", style: { marginTop: "14px" } },
          h("div", { class: "stat" }, h("div", { class: "stat__label" }, "Достижения"), h("div", { class: "stat__value" }, Object.keys(st.achievements).length + "/" + store.ACHIEVEMENTS.length)),
          h("div", { class: "stat" }, h("div", { class: "stat__label" }, "Серия дней"), h("div", { class: "stat__value" }, "🔥 " + store.streak()))))));

    // ежедневные задания
    var dailyCard = h("div", { class: "card" }, h("div", { class: "card__head" }, h("h3", null, "Задания на сегодня"), h("a", { class: "small", href: "#/daily" }, "Открыть")));
    var d = store.daily();
    CA.daily.tasks().forEach(function (t) {
      var done = !!d.done[t.id];
      dailyCard.appendChild(h("a", { class: "daily-item" + (done ? " is-done" : ""), href: t.href || "#/daily", style: { marginBottom: "6px", color: "inherit", textDecoration: "none" } }, h("span", { class: "daily-item__check" }, done ? "✓" : ""), h("span", { class: "daily-item__text" }, t.title), h("span", { class: "chip" }, "+" + store.XP.daily + " XP")));
    });

    // избранное
    var favCard = h("div", { class: "card" }, h("div", { class: "card__head" }, h("h3", null, "Избранные уроки")));
    if (!st.favorites.length) favCard.appendChild(h("p", { class: "small muted" }, "Отмечайте уроки звёздочкой ★, чтобы быстро к ним возвращаться."));
    else favCard.appendChild(h("ul", { class: "lesson-list" }, st.favorites.map(function (id) { var L = CA.course.find(id); return L ? CA.lessonRow(L, store) : null; })));

    wrap.appendChild(h("div", { class: "split section" }, dailyCard, favCard));

    // модули
    var mods = h("div", { class: "cards" });
    CA.course.modules.forEach(function (M) {
      var done = M.lessons.filter(function (l) { return store.isDone(l.id); }).length;
      mods.appendChild(h("a", { class: "card card--link", href: "#/course" },
        h("div", { class: "eyebrow" }, "Модуль " + M.n), h("div", { class: "card__title" }, M.title), h("p", { class: "small muted" }, M.subtitle),
        h("div", { class: "bar bar--up" }, h("i", { style: { width: done / M.lessons.length * 100 + "%" } })), h("div", { class: "small muted", style: { marginTop: "6px" } }, done + " / " + M.lessons.length + " уроков")));
    });
    mods.appendChild(h("a", { class: "card card--link", href: "#/exam" }, h("div", { class: "eyebrow" }, "Модуль 8"), h("div", { class: "card__title" }, "Финальный экзамен"), h("p", { class: "small muted" }, "Теория, практический анализ графика, риск-менеджмент и торговый план.")));
    wrap.appendChild(h("section", { class: "section" }, h("h2", null, "Модули курса"), mods));

    var tools = h("div", { class: "cards" });
    [["#/sim", "Paper Trading", "Виртуальные 10 000 USDT, комиссии, стопы, статистика и разбор каждой сделки тренером."], ["#/lab", "Лаборатория стратегий", "Соберите правила и проверьте их на синтетической истории: обучающий и проверочный отрезки."], ["#/tools", "Калькуляторы", "Размер позиции, результат сделки, плечо и ликвидация, восстановление после просадки."], ["#/cases", "Исторические кейсы", "Mt. Gox, ICO-пузырь, март 2020, крах Terra/LUNA, банкротство FTX — что пошло не так."]].forEach(function (t) {
      tools.appendChild(h("a", { class: "card card--link", href: t[0] }, h("div", { class: "card__title" }, t[1]), h("p", { class: "small muted", style: { margin: 0 } }, t[2])));
    });
    wrap.appendChild(h("section", { class: "section" }, h("h2", null, "Практика и справочник"), tools));
    wrap.appendChild(h("p", { class: "disclaimer section" }, "Crypto Academy — образовательный проект. Материалы не являются инвестиционной рекомендацией. Технический анализ не позволяет достоверно предсказывать цену; торговля криптовалютами сопряжена с высоким риском потери средств. В симуляторе используются только виртуальные деньги и синтетические данные."));
    return wrap;
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
