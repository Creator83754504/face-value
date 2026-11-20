/* CRYPTO ACADEMY — запуск приложения: прогресс, навигация, маршруты. */
(function (g) {
  "use strict";
  var CA = g.CA;
  var h = CA.dom.h;

  var ICONS = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    course: '<path d="M4 5h11a3 3 0 0 1 3 3v12H7a3 3 0 0 1-3-3z"/><path d="M18 8h2v12"/><path d="M8 9h6M8 13h6"/>',
    exam: '<path d="M12 3l8 4-8 4-8-4z"/><path d="M6 9v5c0 2 3 4 6 4s6-2 6-4V9"/><path d="M20 7v6"/>',
    sim: '<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="9" width="3" height="7"/><rect x="12" y="6" width="3" height="8"/><rect x="17" y="10" width="3" height="5"/>',
    lab: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7.5 15h9"/>',
    tools: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 18h2M14 18h2"/>',
    daily: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M9 15l2 2 4-4"/>',
    glossary: '<path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M9 9h7M9 13h5"/>',
    cards: '<rect x="3" y="7" width="14" height="12" rx="2"/><path d="M7 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2"/>',
    mistakes: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>',
    cases: '<path d="M4 7h16v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M4 12h16"/>',
    profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>'
  };
  function icon(name, cls) { return h("span", { class: cls || "nav__icon", "aria-hidden": "true", html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%">' + ICONS[name] + "</svg>" }); }

  var NAV = [
    { group: "Обучение" },
    { id: "home", title: "Главная", icon: "home" },
    { id: "course", title: "Программа курса", icon: "course" },
    { id: "exam", title: "Финальный экзамен", icon: "exam" },
    { group: "Практика" },
    { id: "sim", title: "Paper Trading", icon: "sim" },
    { id: "lab", title: "Лаборатория стратегий", icon: "lab" },
    { id: "tools", title: "Калькуляторы", icon: "tools" },
    { id: "daily", title: "Задания дня", icon: "daily" },
    { group: "Справочник" },
    { id: "glossary", title: "Словарь трейдера", icon: "glossary" },
    { id: "cards", title: "Карточки", icon: "cards" },
    { id: "mistakes", title: "Разбор ошибок", icon: "mistakes" },
    { id: "cases", title: "Исторические кейсы", icon: "cases" },
    { group: "Аккаунт" },
    { id: "profile", title: "Прогресс и профиль", icon: "profile" }
  ];
  var ROUTE_NAV = { lesson: "course", module: "course" };

  var store = CA.progress.createStore({ course: CA.course.index() });
  var leaveFns = [];
  var view, sidebar, scrim, navLinks = {}, tabLinks = {}, titleEl, crumbsEl, xpPill, streakPill, badges = {};

  CA.app = {
    store: store,
    icon: icon,
    onLeave: function (fn) { leaveFns.push(fn); },
    setTitle: function (title, crumbs) {
      titleEl.textContent = title;
      crumbsEl.textContent = crumbs ? crumbs + " / " : "";
      document.title = title + " — Crypto Academy";
    }
  };

  function buildShell() {
    var root = document.getElementById("app");
    root.innerHTML = "";
    var nav = h("nav", { class: "nav", "aria-label": "Основная навигация" });
    NAV.forEach(function (n) {
      if (n.group) { nav.appendChild(h("div", { class: "nav__group" }, n.group)); return; }
      var badge = h("span", { class: "nav__badge", hidden: true });
      badges[n.id] = badge;
      var a = h("a", { href: "#/" + (n.id === "home" ? "" : n.id), onclick: closeMenu }, icon(n.icon), h("span", null, n.title), badge);
      navLinks[n.id] = a;
      nav.appendChild(a);
    });
    sidebar = h("aside", { class: "sidebar", id: "sidebar" },
      h("a", { class: "brand", href: "#/", onclick: closeMenu },
        h("span", { class: "brand__logo", html: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke-width="2"><path d="M6 4v16" stroke="#26a69a"/><rect x="4" y="8" width="4" height="7" fill="#26a69a"/><path d="M12 3v14" stroke="#ef5350"/><rect x="10" y="6" width="4" height="8" fill="#ef5350"/><path d="M18 6v15" stroke="#26a69a"/><rect x="16" y="10" width="4" height="7" fill="#26a69a"/></svg>' }),
        h("span", { class: "brand__name" }, "CRYPTO ACADEMY", h("small", null, "курс трейдинга с нуля"))),
      nav,
      h("div", { class: "sidebar__foot" }, h("div", { class: "sidebar__note" }, "Учебная платформа. Все рыночные данные — синтетические. Не является инвестиционной рекомендацией. Реальные деньги не используются.")));
    scrim = h("div", { class: "scrim", onclick: closeMenu });
    titleEl = h("span"); crumbsEl = h("span", { class: "topbar__crumbs" });
    xpPill = h("a", { class: "xp-pill", href: "#/profile", "aria-label": "Уровень и опыт" });
    streakPill = h("a", { class: "streak-pill", href: "#/daily", title: "Дней подряд с выполненными заданиями", hidden: true });
    var top = h("header", { class: "topbar" },
      h("button", { class: "icon-btn topbar__menu", "aria-label": "Меню", "aria-controls": "sidebar", onclick: openMenu }, icon("menu", "nav__icon")),
      h("div", { class: "topbar__title" }, crumbsEl, titleEl),
      h("div", { class: "topbar__right" }, streakPill, xpPill));
    view = h("main", { class: "view", id: "view", tabindex: "-1" });
    var tabs = h("nav", { class: "tabbar", "aria-label": "Быстрая навигация" });
    [["home", "Главная", "home"], ["course", "Курс", "course"], ["sim", "Симулятор", "sim"], ["glossary", "Словарь", "glossary"]].forEach(function (t) {
      var a = h("a", { href: "#/" + (t[0] === "home" ? "" : t[0]) }, icon(t[2], ""), t[1]);
      tabLinks[t[0]] = a; tabs.appendChild(a);
    });
    tabs.appendChild(h("button", { type: "button", onclick: openMenu, "aria-label": "Все разделы" }, icon("menu", ""), "Ещё"));
    root.appendChild(h("div", { class: "app" }, sidebar, h("div", { class: "main" }, top, view), tabs));
    root.appendChild(scrim);
  }
  function openMenu() { sidebar.classList.add("is-open"); scrim.classList.add("is-open"); }
  function closeMenu() { sidebar.classList.remove("is-open"); scrim.classList.remove("is-open"); }

  function refreshChrome() {
    var lv = store.level();
    xpPill.innerHTML = "";
    xpPill.appendChild(h("span", { class: "xp-pill__lvl" }, String(lv.index)));
    xpPill.appendChild(h("span", { class: "xp-pill__text" }, h("b", null, lv.title), h("small", { class: "muted" }, lv.xp + " XP"), h("span", { class: "xp-pill__bar" }, h("i", { style: { width: lv.pct + "%" } }))));
    var s = store.streak();
    streakPill.hidden = !s;
    streakPill.textContent = "🔥 " + s;
    var cp = store.courseProgress();
    badges.course.hidden = false; badges.course.textContent = Math.round(cp.pct) + "%";
    var mist = Object.keys(store.state.mistakes).filter(function (k) { return !store.state.mistakes[k].fixed; }).length;
    badges.mistakes.hidden = !mist; badges.mistakes.textContent = mist; badges.mistakes.className = "nav__badge nav__badge--warn";
    var d = store.daily(), left = CA.daily ? CA.daily.tasks().length - Object.keys(d.done).length : 0;
    badges.daily.hidden = left <= 0; badges.daily.textContent = left;
    badges.exam.hidden = !(store.state.exam && store.state.exam.passed); badges.exam.textContent = "✓";
  }

  function render(name, routeFn) {
    return function (route) {
      leaveFns.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
      leaveFns = [];
      var active = ROUTE_NAV[name] || name;
      Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.toggle("is-active", k === active); });
      Object.keys(tabLinks).forEach(function (k) { tabLinks[k].classList.toggle("is-active", k === active); });
      var navItem = NAV.find(function (n) { return n.id === active; });
      CA.app.setTitle(navItem ? navItem.title : "Crypto Academy");
      view.className = "view" + (name === "sim" || name === "lab" ? " view--wide" : "");
      view.innerHTML = "";
      var el;
      try { el = routeFn(route); }
      catch (e) { console.error(e); el = h("div", { class: "empty" }, h("h2", null, "Что-то пошло не так"), h("p", null, "Не удалось открыть раздел. Попробуйте обновить страницу.")); }
      view.appendChild(el);
      window.scrollTo(0, 0);
      if (route.name !== "home") store.setLast(route.path, titleEl.textContent);
      refreshChrome();
    };
  }

  CA.views.notFound = function () {
    return h("div", { class: "empty" }, h("div", { class: "empty__icon" }, "🧭"), h("h2", null, "Страница не найдена"), h("a", { class: "btn btn--primary", href: "#/" }, "На главную"));
  };

  function start() {
    buildShell();
    store.on(function (ev) {
      if (ev.type === "xp") CA.dom.toast("+" + ev.amount + " XP · " + ev.reason, "xp", 2200);
      if (ev.type === "achievement") CA.dom.toast(ev.achievement.icon + " Достижение: " + ev.achievement.title, "success", 4500);
      if (ev.type === "level") CA.dom.toast("Новый уровень: " + ev.level.title, "success", 4500);
      if (xpPill) refreshChrome();
    });
    var R = CA.router;
    var routes = { home: "home", course: "course", module: "module", lesson: "lesson", sim: "sim", lab: "lab", tools: "tools", exam: "exam", glossary: "glossary", cards: "cards", mistakes: "mistakes", cases: "cases", daily: "daily", profile: "profile" };
    Object.keys(routes).forEach(function (k) { var v = CA.views[routes[k]]; if (v) R.on(k, render(k, v)); });
    R.otherwise(render("notFound", CA.views.notFound));
    R.start();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})(typeof globalThis !== "undefined" ? globalThis : this);
