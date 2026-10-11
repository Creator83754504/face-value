/*
 * FACE VALUE — разбор ввода и подсчёт очков.
 * Работает и в браузере (window.FV_SCORING), и в Node.js (для тестов).
 */
(function (root) {
  var MAX_POINTS = 1000;          // максимум за один вопрос
  var PERFECT_RATIO = 1.02;       // ошибка до ±2% считается идеальным ответом
  var ZERO_RATIO = 2.5;           // ошибка в 2.5 раза (или больше) = 0 очков
  var MAX_INPUT = 1e9;            // защита от бессмысленно больших чисел

  var ERRORS = {
    empty: "Введите цену",
    invalid: "Нужна цена числом, например 1500 или 1.5k",
    zero: "Цена должна быть больше нуля",
    negative: "Цена не может быть отрицательной",
    too_big: "Слишком большое число"
  };

  /**
   * Превращает то, что ввёл игрок, в число.
   * Понимает: "1500", "1 500", "1,500", "1500.50", "1500,50", "$1,500",
   *           "1.5k", "1,5к", "2 тыс", "1.2m", "1,2 млн".
   * Возвращает { ok: true, value } или { ok: false, error, message }.
   */
  function parsePrice(input) {
    if (input === null || input === undefined) return fail("empty");
    var s = String(input).toLowerCase().trim();
    if (s === "") return fail("empty");

    // Убираем валюту и пробелы (включая неразрывные)
    s = s.replace(/usd|долл\.?|доллар(ов|а)?|\$/g, "").replace(/[\s  ']/g, "");
    if (s === "") return fail("empty");
    if (/^[-−–]/.test(s)) return fail("negative");

    // Множители: k / к / тыс, m / м / млн
    var mult = 1;
    var m = s.match(/(k|к|тыс\.?|m|м|млн\.?)$/);
    if (m) {
      var suf = m[1];
      mult = /^(m|м|млн)/.test(suf) ? 1e6 : 1e3;
      s = s.slice(0, s.length - suf.length);
    }

    if (!/^[0-9.,]+$/.test(s)) return fail("invalid");

    var hasDot = s.indexOf(".") !== -1;
    var hasComma = s.indexOf(",") !== -1;

    if (hasDot && hasComma) {
      // Последний разделитель — дробный, остальные — разряды: "1,299.99" или "1.299,99"
      var lastDot = s.lastIndexOf(".");
      var lastComma = s.lastIndexOf(",");
      if (lastDot > lastComma) s = s.replace(/,/g, "");
      else s = s.replace(/\./g, "").replace(",", ".");
    } else if (hasComma) {
      // "1,500" или "1,500,000" — разряды; "1,5" — дробь
      if (/^\d{1,3}(,\d{3})+$/.test(s) && mult === 1) s = s.replace(/,/g, "");
      else if ((s.match(/,/g) || []).length === 1) s = s.replace(",", ".");
      else return fail("invalid");
    } else if (hasDot) {
      // "1.500.000" — разряды; "1.5" — дробь
      if ((s.match(/\./g) || []).length > 1) {
        if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
        else return fail("invalid");
      }
    }

    if (!/^\d+(\.\d+)?$/.test(s) && !/^\.\d+$/.test(s)) return fail("invalid");

    var value = Math.round(parseFloat(s) * mult * 100) / 100; // до центов
    if (!isFinite(value)) return fail("invalid");
    if (value <= 0) return fail("zero");
    if (value > MAX_INPUT) return fail("too_big");

    return { ok: true, value: value };
  }

  function fail(code) {
    return { ok: false, error: code, message: ERRORS[code] };
  }

  /**
   * Очки за ответ. Считаем ошибку «во сколько раз» (логарифмически),
   * поэтому ошибиться на $50 у кроссовок и на $50 000 у машины —
   * это одинаково честно. Перелёт и недолёт в одно и то же число раз
   * штрафуются одинаково.
   */
  function scoreGuess(guess, actual) {
    if (!(guess > 0) || !(actual > 0)) throw new Error("guess and actual must be positive numbers");
    var ratio = guess / actual;
    var err = Math.abs(Math.log(ratio));
    var points;
    if (err <= Math.log(PERFECT_RATIO)) points = MAX_POINTS;
    else points = Math.round(MAX_POINTS * Math.max(0, 1 - err / Math.log(ZERO_RATIO)));

    var diff = guess - actual;
    return {
      points: points,
      diff: Math.round(diff * 100) / 100,
      diffPercent: Math.round((diff / actual) * 1000) / 10,
      verdict: verdict(points)
    };
  }

  function verdict(points) {
    if (points >= 950) return { key: "perfect", label: "В точку" };
    if (points >= 800) return { key: "close", label: "Очень близко" };
    if (points >= 550) return { key: "good", label: "Неплохо" };
    if (points >= 250) return { key: "off", label: "Мимо" };
    return { key: "far", label: "Далеко" };
  }

  /** Звание по итогам раунда (максимум 5000). */
  function rank(total, max) {
    var p = total / max;
    if (p >= 0.9) return "Оценщик аукционного дома";
    if (p >= 0.75) return "Чувствуешь рынок";
    if (p >= 0.55) return "Знаешь цену вещам";
    if (p >= 0.35) return "Есть над чем поработать";
    return "Новичок в мире цен";
  }

  /**
   * Выбирает вопросы для раунда:
   *  — сначала те, что игрок ещё не видел (seenIds) — так соседние раунды не повторяются;
   *  — не больше maxPerCategory из одной категории;
   *  — старается взять товары разных ценовых уровней (дешёвые, средние, дорогие).
   * random — функция, возвращающая число от 0 до 1 (для тестов можно подменить).
   */
  function pickRound(questions, count, seenIds, random, maxPerCategory) {
    random = random || Math.random;
    maxPerCategory = maxPerCategory || 2;
    var seen = {};
    (seenIds || []).forEach(function (id) { seen[id] = true; });

    var fresh = shuffle(questions.filter(function (q) { return !seen[q.id]; }), random);
    var old = shuffle(questions.filter(function (q) { return seen[q.id]; }), random);
    var ordered = fresh.concat(old);

    var picked = [];
    var perCat = {};
    var perTier = {};
    var tierCap = Math.ceil(count / 3) + (count > 3 ? 0 : 1); // для 5 вопросов — не больше 2 на уровень

    function take(q, checkCat, checkTier) {
      if (picked.length >= count || picked.indexOf(q) !== -1) return;
      var t = priceTier(q.price);
      if (checkCat && (perCat[q.category] || 0) >= maxPerCategory) return;
      if (checkTier && (perTier[t] || 0) >= tierCap) return;
      perCat[q.category] = (perCat[q.category] || 0) + 1;
      perTier[t] = (perTier[t] || 0) + 1;
      picked.push(q);
    }
    // 1) с ограничениями по категориям и уровням цен, только новые вопросы
    fresh.forEach(function (q) { take(q, true, true); });
    // 2) если не хватило — ослабляем ограничения, сначала по уровням
    ordered.forEach(function (q) { take(q, true, false); });
    // 3) если вопросов совсем мало — берём любые
    ordered.forEach(function (q) { take(q, false, false); });
    return shuffle(picked, random);
  }

  function shuffle(arr, random) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /** "$1,099" / "$899.99" */
  function formatMoney(value, currency) {
    var hasCents = Math.round(value * 100) % 100 !== 0;
    var num = Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2
    });
    var symbol = currency === "USD" || !currency ? "$" : currency + " ";
    return (value < 0 ? "−" : "") + symbol + num;
  }

  /** Удачный ответ — ошибка примерно до 25% (750+ очков). */
  var GOOD_POINTS = 750;
  function isGoodAnswer(points) { return points >= GOOD_POINTS; }

  /** Точность ответа в процентах: 100% — точно, 0% — ошибка на 100% цены и больше. */
  function accuracyPercent(guess, actual) {
    if (!(guess > 0) || !(actual > 0)) return 0;
    var err = Math.abs(guess - actual) / actual;
    return Math.max(0, Math.round((1 - Math.min(1, err)) * 100));
  }

  /** Итог раунда: сумма очков, но не больше максимума (защита от ошибок в данных). */
  function roundTotal(pointsList, roundSize) {
    var max = (roundSize || pointsList.length) * MAX_POINTS;
    var sum = 0;
    for (var i = 0; i < pointsList.length; i++) {
      var p = Number(pointsList[i]);
      if (isFinite(p) && p > 0) sum += Math.min(MAX_POINTS, Math.round(p));
    }
    return Math.min(max, sum);
  }

  /** Ценовой уровень товара — чтобы в раунде были и дешёвые, и дорогие вещи. */
  function priceTier(price) {
    if (price < 100) return "low";
    if (price < 1000) return "mid";
    return "high";
  }

  var api = {
    MAX_POINTS: MAX_POINTS,
    GOOD_POINTS: GOOD_POINTS,
    isGoodAnswer: isGoodAnswer,
    accuracyPercent: accuracyPercent,
    roundTotal: roundTotal,
    priceTier: priceTier,
    parsePrice: parsePrice,
    scoreGuess: scoreGuess,
    verdict: verdict,
    rank: rank,
    pickRound: pickRound,
    formatMoney: formatMoney
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.FV_SCORING = api;
})(typeof window !== "undefined" ? window : this);
