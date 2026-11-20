/* Ежедневные учебные задания: три задания на день, набор зависит от даты. */
(function (g) {
  "use strict";
  var CA = g.CA;
  var h = CA.dom.h;

  var ROTATE = [
    { id: "trade", title: "Сделайте учебную сделку со Stop Loss в симуляторе", href: "#/sim" },
    { id: "quiz", title: "Пройдите тест любого урока на 70% и выше", href: "#/course" },
    { id: "analysis", title: "Задача дня: определите тренд на трёх графиках", href: "#/daily" }
  ];
  var CALC = ["position", "rr", "fees", "recovery", "breakeven", "liquidation", "tradeR", "spread"];

  function seedOfDay() { return CA.rng.hashSeed(CA.app.store.today()); }

  CA.daily = {
    tasks: function () {
      var s = seedOfDay();
      return [
        { id: "calc", title: "Расчёт дня: " + { position: "размер позиции", rr: "соотношение риск/прибыль", fees: "комиссии", recovery: "восстановление после просадки", breakeven: "безубыточный винрейт", liquidation: "цена ликвидации", tradeR: "результат в R", spread: "спред" }[CALC[s % CALC.length]], href: "#/daily" },
        { id: "cards", title: "Повторите 10 карточек с терминами", href: "#/cards" },
        ROTATE[s % ROTATE.length]
      ];
    },
    complete: function (id) {
      var store = CA.app.store, ids = CA.daily.tasks().map(function (t) { return t.id; });
      if (ids.indexOf(id) < 0) return false;
      return store.completeDaily(id, ids.length);
    },
    bump: function (counter, need, id) {
      var d = CA.app.store.daily();
      d.counts[counter] = (d.counts[counter] || 0) + 1;
      CA.app.store.save();
      if (d.counts[counter] >= need) CA.daily.complete(id);
      return d.counts[counter];
    }
  };

  CA.views.daily = function () {
    var store = CA.app.store, d = store.daily(), tasks = CA.daily.tasks(), s = seedOfDay();
    var wrap = h("div");
    wrap.appendChild(h("div", { class: "page-head" }, h("div", { class: "eyebrow" }, "Сегодня, " + new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" })), h("h1", null, "Задания дня"),
      h("p", null, "Короткая ежедневная практика закрепляет навыки лучше, чем редкие длинные занятия. Выполните все три задания, чтобы продлить серию. Серия сейчас: 🔥 " + store.streak() + " " + CA.dom.plural(store.streak(), "день", "дня", "дней") + ".")));
    var list = h("div", { class: "stack" });
    tasks.forEach(function (t) {
      var done = !!d.done[t.id];
      var card = h("div", { class: "card" }, h("div", { class: "daily-item" + (done ? " is-done" : ""), style: { background: "none", padding: 0 } }, h("span", { class: "daily-item__check" }, done ? "✓" : ""), h("span", { class: "daily-item__text" }, h("b", null, t.title)), h("span", { class: "chip" + (done ? " chip--up" : "") }, done ? "выполнено" : "+" + store.XP.daily + " XP")));
      if (t.id === "calc") card.appendChild(CA.renderTask({ id: "daily-calc", type: "calc", gen: CALC[s % CALC.length], rounds: 1, title: "" }, { passed: done, onPass: function () { CA.daily.complete("calc"); CA.router.reload(); } }));
      else if (t.id === "analysis") card.appendChild(CA.renderTask({ id: "daily-trend", type: "trend-id", rounds: 3, need: 3, title: "" }, { passed: done, onPass: function () { CA.daily.complete("analysis"); CA.router.reload(); } }));
      else if (t.id === "cards") card.appendChild(h("p", { class: "small muted", style: { margin: "10px 0 0" } }, "Повторено сегодня: " + ((d.counts && d.counts.cards) || 0) + " из 10. ", h("a", { href: "#/cards" }, "Открыть карточки →")));
      else card.appendChild(h("p", { class: "small muted", style: { margin: "10px 0 0" } }, h("a", { href: t.href }, "Перейти →")));
      list.appendChild(card);
    });
    wrap.appendChild(list);
    return wrap;
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
