/*
 * Прогресс ученика: уроки, тесты, практика, XP, уровни, достижения, история, избранное,
 * разбор ошибок, карточки (интервальное повторение), ежедневные задания, экзамен.
 * Сохраняется в localStorage. Повреждённые данные не ломают приложение — начинаем с чистого листа.
 */
(function (g) {
  "use strict";
  var CA = g.CA || (g.CA = {});

  var KEY = "ca.progress.v1";
  var PASS = 70;

  var LEVELS = [
    { xp: 0, title: "Новичок" }, { xp: 150, title: "Наблюдатель" }, { xp: 400, title: "Ученик" },
    { xp: 800, title: "Читатель графиков" }, { xp: 1300, title: "Аналитик" }, { xp: 2000, title: "Риск-менеджер" },
    { xp: 3000, title: "Стратег" }, { xp: 4500, title: "Выпускник академии" }
  ];

  var XP = { lesson: 100, quizPerfect: 40, task: 25, daily: 20, card: 2, trade: 5, tradeWithStop: 10, backtest: 20, exam: 400, fixMistake: 5, caseRead: 15 };

  var ACHIEVEMENTS = [
    { id: "first-lesson", icon: "🎓", title: "Первый шаг", text: "Завершить первый урок" },
    { id: "module-1", icon: "🧭", title: "Знаю рынок", text: "Пройти модуль 1" },
    { id: "module-2", icon: "🕯️", title: "Читаю свечи", text: "Пройти модуль 2" },
    { id: "module-3", icon: "📐", title: "Вижу структуру", text: "Пройти модуль 3" },
    { id: "module-4", icon: "📊", title: "Понимаю индикаторы", text: "Пройти модуль 4" },
    { id: "module-5", icon: "🗺️", title: "Есть стратегия", text: "Пройти модуль 5" },
    { id: "module-6", icon: "🛡️", title: "Риск под контролем", text: "Пройти модуль 6" },
    { id: "module-7", icon: "🔬", title: "Практик", text: "Пройти модуль 7" },
    { id: "perfect-quiz", icon: "💯", title: "Без ошибок", text: "Сдать тест урока на 100%" },
    { id: "perfect-5", icon: "🏅", title: "Отличник", text: "Сдать 5 тестов на 100%" },
    { id: "first-trade", icon: "🧪", title: "Первая учебная сделка", text: "Закрыть сделку в симуляторе" },
    { id: "disciplined", icon: "🧱", title: "Дисциплина", text: "Закрыть 10 сделок со Stop Loss" },
    { id: "clean-trade", icon: "✅", title: "Чистое решение", text: "Сделка, в которой тренер не нашёл ошибок" },
    { id: "calc", icon: "🧮", title: "Сначала считаю", text: "Рассчитать размер позиции в калькуляторе" },
    { id: "backtest", icon: "⏪", title: "Проверяю идеи", text: "Запустить первый бэктест" },
    { id: "cards-50", icon: "🗂️", title: "Словарный запас", text: "Повторить 50 карточек" },
    { id: "streak-3", icon: "🔥", title: "Три дня подряд", text: "Выполнять ежедневные задания 3 дня подряд" },
    { id: "streak-7", icon: "🌋", title: "Неделя практики", text: "Выполнять ежедневные задания 7 дней подряд" },
    { id: "fix-10", icon: "🔧", title: "Работа над ошибками", text: "Исправить 10 ошибок из раздела «Разбор ошибок»" },
    { id: "cases", icon: "📜", title: "Знаю историю", text: "Изучить все исторические кейсы" },
    { id: "exam", icon: "🏆", title: "Выпускник", text: "Сдать финальный экзамен" },
    { id: "exam-90", icon: "👑", title: "С отличием", text: "Сдать финальный экзамен на 90% и выше" }
  ];

  function blank() {
    return {
      v: 1, createdAt: Date.now(), xp: 0, lessons: {}, achievements: {}, history: [], last: null,
      favorites: [], mistakes: {}, cards: {}, cardsReviewed: 0, fixed: 0, perfectQuizzes: 0,
      daily: { date: null, done: {}, streak: 0, lastFull: null }, exam: null, casesRead: {},
      counters: { trades: 0, tradesWithStop: 0, calc: 0, backtests: 0 }, settings: { freeMode: false, coach: true }
    };
  }

  function safeStorage(s) {
    var mem = {};
    var real = s || (typeof localStorage !== "undefined" ? (function () { try { return localStorage; } catch (e) { return null; } })() : null);
    return {
      get: function (k) { try { return real ? real.getItem(k) : (k in mem ? mem[k] : null); } catch (e) { return k in mem ? mem[k] : null; } },
      set: function (k, v) { try { if (real) real.setItem(k, v); else mem[k] = v; } catch (e) { mem[k] = v; } },
      remove: function (k) { try { if (real) real.removeItem(k); } catch (e) { /* ignore */ } delete mem[k]; }
    };
  }

  function merge(base, saved) {
    Object.keys(saved || {}).forEach(function (k) {
      if (base[k] && typeof base[k] === "object" && !Array.isArray(base[k]) && saved[k] && typeof saved[k] === "object" && !Array.isArray(saved[k])) merge(base[k], saved[k]);
      else if (saved[k] !== undefined) base[k] = saved[k];
    });
    return base;
  }

  function dayKey(ts) { var d = new Date(ts); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function dayDiff(a, b) { return Math.round((Date.parse(b + "T12:00:00") - Date.parse(a + "T12:00:00")) / 86400000); }

  /*
   * course — { lessons: [{ id, module, practice: [taskId], quiz: bool }] } в порядке прохождения
   */
  function createStore(opts) {
    opts = opts || {};
    var storage = safeStorage(opts.storage);
    var now = opts.now || function () { return Date.now(); };
    var course = opts.course || { lessons: [] };
    var listeners = [];
    var state = blank();
    try {
      var raw = storage.get(KEY);
      if (raw) { var parsed = JSON.parse(raw); if (parsed && parsed.v === 1) state = merge(blank(), parsed); }
    } catch (e) { state = blank(); }

    function save() { storage.set(KEY, JSON.stringify(state)); }
    function emit(ev) { listeners.forEach(function (f) { try { f(ev, state); } catch (e) { if (typeof console !== "undefined") console.error(e); } }); }

    function levelOf(xp) {
      var cur = LEVELS[0], next = null;
      for (var i = 0; i < LEVELS.length; i++) { if (xp >= LEVELS[i].xp) { cur = LEVELS[i]; next = LEVELS[i + 1] || null; } }
      return { index: LEVELS.indexOf(cur) + 1, title: cur.title, xp: xp, from: cur.xp, to: next ? next.xp : null, nextTitle: next ? next.title : null,
        pct: next ? (xp - cur.xp) / (next.xp - cur.xp) * 100 : 100 };
    }

    function log(type, text) {
      state.history.unshift({ ts: now(), type: type, text: text });
      if (state.history.length > 300) state.history.length = 300;
    }

    function addXP(n, reason) {
      if (!n) return;
      var before = levelOf(state.xp);
      state.xp += n;
      var after = levelOf(state.xp);
      emit({ type: "xp", amount: n, reason: reason });
      if (after.index > before.index) { log("level", "Новый уровень: " + after.title); emit({ type: "level", level: after }); }
    }

    function unlock(id) {
      if (state.achievements[id]) return false;
      var a = ACHIEVEMENTS.find(function (x) { return x.id === id; });
      if (!a) return false;
      state.achievements[id] = now();
      log("achievement", "Достижение: " + a.title);
      emit({ type: "achievement", achievement: a });
      return true;
    }

    function lessonRec(id) { return state.lessons[id] || (state.lessons[id] = { status: "new", quizBest: null, quizAttempts: 0, practice: {}, visits: 0 }); }

    function lessonIndex(id) { return course.lessons.findIndex(function (l) { return l.id === id; }); }

    function isDone(id) { var r = state.lessons[id]; return !!(r && r.status === "done"); }

    function isUnlocked(id) {
      if (state.settings.freeMode) return true;
      var i = lessonIndex(id);
      if (i <= 0) return i === 0;
      return isDone(course.lessons[i - 1].id);
    }

    function requirements(id) {
      var l = course.lessons[lessonIndex(id)];
      if (!l) return { practiceDone: 0, practiceTotal: 0, quizOk: false, ready: false };
      var r = lessonRec(id);
      var pd = l.practice.filter(function (t) { return r.practice[t]; }).length;
      var quizOk = !l.quiz || (r.quizBest != null && r.quizBest >= PASS);
      return { practiceDone: pd, practiceTotal: l.practice.length, quizOk: quizOk, quizBest: r.quizBest, ready: pd === l.practice.length && quizOk };
    }

    function moduleDone(mod) {
      var ls = course.lessons.filter(function (l) { return l.module === mod; });
      return ls.length > 0 && ls.every(function (l) { return isDone(l.id); });
    }

    function tryComplete(id) {
      var r = lessonRec(id);
      if (r.status === "done") return false;
      if (!requirements(id).ready) return false;
      r.status = "done"; r.completedAt = now();
      var l = course.lessons[lessonIndex(id)];
      log("lesson", "Урок завершён: " + (l.title || id));
      addXP(XP.lesson, "Урок завершён");
      unlock("first-lesson");
      if (moduleDone(l.module)) { unlock("module-" + l.module); log("module", "Модуль " + l.module + " пройден"); }
      emit({ type: "lesson-done", id: id });
      return true;
    }

    var api = {
      PASS: PASS, LEVELS: LEVELS, ACHIEVEMENTS: ACHIEVEMENTS, XP: XP,
      get state() { return state; },
      on: function (f) { listeners.push(f); return function () { listeners = listeners.filter(function (x) { return x !== f; }); }; },
      save: save,
      level: function () { return levelOf(state.xp); },
      levelOf: levelOf,
      isUnlocked: isUnlocked, isDone: isDone, requirements: requirements, moduleDone: moduleDone,
      lessonStatus: function (id) {
        if (isDone(id)) return "done";
        if (!isUnlocked(id)) return "locked";
        var r = state.lessons[id];
        return r && (r.visits > 0 || r.quizAttempts > 0) ? "progress" : "available";
      },
      lesson: lessonRec,
      courseProgress: function () {
        var total = course.lessons.length, done = course.lessons.filter(function (l) { return isDone(l.id); }).length;
        return { total: total, done: done, pct: total ? done / total * 100 : 0 };
      },
      nextLesson: function () {
        return course.lessons.find(function (l) { return !isDone(l.id) && isUnlocked(l.id); }) || null;
      },
      allLessonsDone: function () { return course.lessons.length > 0 && course.lessons.every(function (l) { return isDone(l.id); }); },
      visit: function (id) { var r = lessonRec(id); r.visits++; r.lastVisit = now(); if (r.status === "new") r.status = "progress"; save(); },
      setLast: function (route, title) { state.last = { route: route, title: title, ts: now() }; save(); },

      recordQuiz: function (id, correct, total, wrong) {
        var r = lessonRec(id), pct = total ? Math.round(correct / total * 100) : 0;
        r.quizAttempts++;
        var first = r.quizBest == null;
        if (first || pct > r.quizBest) r.quizBest = pct;
        r.quizLast = pct;
        log("quiz", "Тест «" + (course.lessons[lessonIndex(id)] || { title: id }).title + "»: " + pct + "%");
        (wrong || []).forEach(function (w) {
          var m = state.mistakes[w.qid] || (state.mistakes[w.qid] = { lessonId: id, count: 0, fixed: false });
          m.count++; m.lastTs = now(); m.fixed = false;
        });
        if (pct === 100 && !r.perfectCounted) {
          r.perfectCounted = true; state.perfectQuizzes++;
          addXP(XP.quizPerfect, "Тест без ошибок");
          unlock("perfect-quiz");
          if (state.perfectQuizzes >= 5) unlock("perfect-5");
        }
        var done = tryComplete(id);
        save();
        return { pct: pct, passed: pct >= PASS, completed: done };
      },

      recordTask: function (id, taskId) {
        var r = lessonRec(id);
        var fresh = !r.practice[taskId];
        r.practice[taskId] = r.practice[taskId] || now();
        if (fresh) { addXP(XP.task, "Практическое задание"); log("task", "Задание выполнено"); }
        var done = tryComplete(id);
        save();
        return { fresh: fresh, completed: done };
      },

      toggleFavorite: function (id) {
        var i = state.favorites.indexOf(id);
        if (i >= 0) state.favorites.splice(i, 1); else state.favorites.push(id);
        save();
        return i < 0;
      },
      isFavorite: function (id) { return state.favorites.indexOf(id) >= 0; },

      fixMistake: function (qid) {
        var m = state.mistakes[qid];
        if (!m || m.fixed) return false;
        m.fixed = true; state.fixed++;
        addXP(XP.fixMistake, "Ошибка исправлена");
        if (state.fixed >= 10) unlock("fix-10");
        save();
        return true;
      },

      // Интервальное повторение по Лейтнеру: коробки 1–5, интервалы 0/1/3/7/14 дней
      reviewCard: function (term, knew) {
        var c = state.cards[term] || { box: 1, due: dayKey(now()) };
        c.box = knew ? Math.min(5, c.box + 1) : 1;
        var days = [0, 1, 3, 7, 14][c.box - 1];
        c.due = dayKey(now() + days * 86400000);
        state.cards[term] = c;
        state.cardsReviewed++;
        addXP(XP.card, "Карточка");
        if (state.cardsReviewed >= 50) unlock("cards-50");
        save();
        return c;
      },
      cardDue: function (term) { var c = state.cards[term]; return !c || c.due <= dayKey(now()); },

      // Ежедневные задания
      today: function () { return dayKey(now()); },
      daily: function () {
        var d = state.daily, t = dayKey(now());
        if (d.date !== t) { d.date = t; d.done = {}; d.counts = {}; save(); }
        if (!d.counts) d.counts = {};
        return d;
      },
      completeDaily: function (taskId, total) {
        var d = api.daily();
        if (d.done[taskId]) return false;
        d.done[taskId] = now();
        addXP(XP.daily, "Ежедневное задание");
        log("daily", "Ежедневное задание выполнено");
        if (Object.keys(d.done).length >= total && d.lastFull !== d.date) {
          d.streak = d.lastFull && dayDiff(d.lastFull, d.date) === 1 ? d.streak + 1 : 1;
          d.lastFull = d.date;
          if (d.streak >= 3) unlock("streak-3");
          if (d.streak >= 7) unlock("streak-7");
        }
        save();
        return true;
      },
      streak: function () {
        var d = state.daily;
        if (!d.lastFull) return 0;
        return dayDiff(d.lastFull, dayKey(now())) <= 1 ? d.streak : 0;
      },

      count: function (name, n) {
        state.counters[name] = (state.counters[name] || 0) + (n || 1);
        if (name === "calc") unlock("calc");
        if (name === "backtests") { if (state.counters.backtests === 1) addXP(XP.backtest, "Первый бэктест"); unlock("backtest"); }
        save();
      },
      recordTrade: function (trade, review) {
        state.counters.trades++;
        if (trade.hadStop) state.counters.tradesWithStop++;
        addXP(trade.hadStop ? XP.tradeWithStop : XP.trade, "Учебная сделка");
        log("trade", "Учебная сделка: " + (trade.pnl >= 0 ? "+" : "") + trade.pnl.toFixed(2) + " USDT");
        unlock("first-trade");
        if (state.counters.tradesWithStop >= 10) unlock("disciplined");
        if (review && !review.items.some(function (x) { return x.kind === "bad" || x.kind === "warn"; })) unlock("clean-trade");
        save();
      },
      readCase: function (id, total) {
        if (state.casesRead[id]) return;
        state.casesRead[id] = now();
        addXP(XP.caseRead, "Исторический кейс");
        if (Object.keys(state.casesRead).length >= total) unlock("cases");
        save();
      },
      recordExam: function (result) {
        var prev = state.exam;
        state.exam = { best: Math.max(prev ? prev.best : 0, result.total), last: result, attempts: (prev ? prev.attempts : 0) + 1, ts: now() };
        log("exam", "Финальный экзамен: " + result.total + "%");
        if (result.passed) {
          if (!prev || !prev.passed) addXP(XP.exam, "Экзамен сдан");
          state.exam.passed = true;
          unlock("exam");
          if (result.total >= 90) unlock("exam-90");
        } else if (prev && prev.passed) state.exam.passed = true;
        save();
      },
      setSetting: function (k, v) { state.settings[k] = v; save(); emit({ type: "settings" }); },
      reset: function () { state = blank(); storage.remove(KEY); save(); emit({ type: "reset" }); },
      exportJSON: function () { return JSON.stringify(state); }
    };
    return api;
  }

  var mod = { createStore: createStore, safeStorage: safeStorage, KEY: KEY, LEVELS: LEVELS, ACHIEVEMENTS: ACHIEVEMENTS, dayKey: dayKey };
  CA.progress = mod;
  if (typeof module !== "undefined" && module.exports) module.exports = mod;
})(typeof globalThis !== "undefined" ? globalThis : this);
