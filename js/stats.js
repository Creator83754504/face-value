/*
 * FACE VALUE — личная статистика игрока (только на этом устройстве).
 *
 * Хранится в localStorage под ключом "fv:stats:v1". Это ЛОКАЛЬНЫЕ данные:
 * их видит только этот браузер / этот Telegram на этом телефоне, и их можно
 * изменить вручную. Поэтому для общего рейтинга используется сервер (см. /server).
 *
 * Модуль устойчив к отсутствию и повреждению данных: всё, что не проходит
 * проверку, заменяется значениями по умолчанию.
 */
(function (root) {
  var KEY = "fv:stats:v1";
  var SEEN_KEY = "fv:seen:v1";
  var MAX_SEEN = 400;
  var ROUND_MAX = 5000;

  function emptyStats() {
    return {
      version: 1,
      rounds: 0,          // сыграно раундов
      answers: 0,         // отвечено вопросов
      totalPoints: 0,     // сумма очков за всё время
      bestRound: 0,       // лучший результат за раунд
      goodAnswers: 0,     // удачные ответы (≈ ошибка до 25%)
      perfectAnswers: 0,  // ответы «в точку» (ошибка до 2%)
      accuracySum: 0,     // сумма точностей (для средней)
      lastPlayedAt: null  // ISO-дата последнего раунда
    };
  }

  function nonNegInt(v, max) {
    var n = Math.floor(Number(v));
    if (!isFinite(n) || n < 0) return 0;
    return max ? Math.min(n, max) : n;
  }

  /** Приводит любые данные к правильной форме. Ничего не бросает. */
  function sanitize(raw) {
    var s = emptyStats();
    if (!raw || typeof raw !== "object") return s;
    s.rounds = nonNegInt(raw.rounds);
    s.answers = nonNegInt(raw.answers);
    s.totalPoints = nonNegInt(raw.totalPoints);
    s.bestRound = nonNegInt(raw.bestRound, ROUND_MAX);
    s.goodAnswers = Math.min(nonNegInt(raw.goodAnswers), s.answers);
    s.perfectAnswers = Math.min(nonNegInt(raw.perfectAnswers), s.answers);
    s.accuracySum = Math.min(nonNegInt(raw.accuracySum), s.answers * 100);
    // Сумма очков не может превышать максимум за все ответы
    s.totalPoints = Math.min(s.totalPoints, s.answers * 1000);
    s.bestRound = Math.min(s.bestRound, s.totalPoints);
    s.lastPlayedAt = typeof raw.lastPlayedAt === "string" && !isNaN(Date.parse(raw.lastPlayedAt)) ? raw.lastPlayedAt : null;
    return s;
  }

  function makeStore(storage) {
    function read(key) {
      try {
        var v = storage && storage.getItem(key);
        return v ? JSON.parse(v) : null;
      } catch (e) { return null; } // повреждённый JSON или запрет доступа
    }
    function write(key, value) {
      try { storage && storage.setItem(key, JSON.stringify(value)); return true; }
      catch (e) { return false; } // переполнение или приватный режим
    }

    return {
      load: function () { return sanitize(read(KEY)); },

      /**
       * Добавляет итог раунда. results — массив { points, accuracy }.
       * Возвращает { stats, isRecord, previousBest }.
       */
      addRound: function (results, now) {
        var s = sanitize(read(KEY));
        var prevBest = s.bestRound;
        var total = 0;
        results.forEach(function (r) {
          var p = Math.max(0, Math.min(1000, Math.round(Number(r.points) || 0)));
          var a = Math.max(0, Math.min(100, Math.round(Number(r.accuracy) || 0)));
          total += p;
          s.answers += 1;
          s.accuracySum += a;
          if (p >= 750) s.goodAnswers += 1;
          if (p >= 1000) s.perfectAnswers += 1;
        });
        total = Math.min(total, ROUND_MAX);
        s.rounds += 1;
        s.totalPoints += total;
        var isRecord = total > prevBest;
        if (isRecord) s.bestRound = total;
        s.lastPlayedAt = (now || new Date()).toISOString();
        write(KEY, s);
        return { stats: s, isRecord: isRecord && total > 0, previousBest: prevBest, total: total };
      },

      reset: function () {
        try { storage && storage.removeItem(KEY); storage && storage.removeItem(SEEN_KEY); } catch (e) {}
        return emptyStats();
      },

      /** Вопросы, которые игрок уже видел (чтобы не повторять их в соседних раундах). */
      loadSeen: function () {
        var v = read(SEEN_KEY);
        if (!Array.isArray(v)) return [];
        return v.filter(function (x) { return typeof x === "string" && x.length < 80; }).slice(-MAX_SEEN);
      },
      saveSeen: function (ids) {
        write(SEEN_KEY, (ids || []).slice(-MAX_SEEN));
      }
    };
  }

  /** Средняя точность в процентах. */
  function averageAccuracy(s) {
    return s.answers > 0 ? Math.round(s.accuracySum / s.answers) : 0;
  }

  function safeLocalStorage() {
    try {
      if (typeof localStorage === "undefined") return null;
      var t = "fv:test";
      localStorage.setItem(t, "1");
      localStorage.removeItem(t);
      return localStorage;
    } catch (e) { return null; }
  }

  var api = { makeStore: makeStore, sanitize: sanitize, emptyStats: emptyStats, averageAccuracy: averageAccuracy, safeLocalStorage: safeLocalStorage, KEY: KEY, SEEN_KEY: SEEN_KEY };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.FV_STATS = api;
})(typeof window !== "undefined" ? window : this);
