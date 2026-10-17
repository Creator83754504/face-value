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

  // ───── Редкость (настройки — в js/rarity-config.js) ─────
  var DEFAULT_RARITY = (typeof module !== "undefined" && module.exports)
    ? require("./rarity-config.js")
    : root.FV_RARITY;

  /** Проверяет настройки редкости: все уровни есть, шансы ≥ 0, сумма = 1. Бросает ошибку при нарушении. */
  function validateRarityConfig(cfg) {
    if (!cfg || !Array.isArray(cfg.ORDER) || cfg.ORDER.length === 0 || !cfg.WEIGHTS) {
      throw new Error("Rarity config: нужны ORDER и WEIGHTS");
    }
    var sum = 0;
    cfg.ORDER.forEach(function (r) {
      var w = cfg.WEIGHTS[r];
      if (typeof w !== "number" || !isFinite(w) || w < 0) throw new Error("Rarity config: неверный шанс для " + r);
      sum += w;
    });
    Object.keys(cfg.WEIGHTS).forEach(function (r) {
      if (cfg.ORDER.indexOf(r) === -1) throw new Error("Rarity config: " + r + " нет в ORDER");
    });
    if (Math.abs(sum - 1) > 1e-9) throw new Error("Rarity config: сумма шансов должна быть 1, сейчас " + sum);
    if (cfg.ORDER.indexOf(cfg.DEFAULT) === -1) throw new Error("Rarity config: DEFAULT должен быть в ORDER");
    return true;
  }

  function rarityOf(q, cfg) {
    return q && cfg.ORDER.indexOf(q.rarity) !== -1 ? q.rarity : cfg.DEFAULT;
  }

  /** Разыгрывает редкость строго по шансам из настроек (без каких-либо поправок). */
  function rollRarity(random, cfg) {
    cfg = cfg || DEFAULT_RARITY;
    var x = random();
    var acc = 0;
    for (var i = 0; i < cfg.ORDER.length; i++) {
      acc += cfg.WEIGHTS[cfg.ORDER[i]];
      if (x < acc) return cfg.ORDER[i];
    }
    // x очень близко к 1 из-за округления — последний уровень с ненулевым шансом
    for (var j = cfg.ORDER.length - 1; j >= 0; j--) if (cfg.WEIGHTS[cfg.ORDER[j]] > 0) return cfg.ORDER[j];
    return cfg.DEFAULT;
  }

  /**
   * Порядок запасного выбора, если разыгранной редкости не осталось:
   * сначала более частые уровни (вниз к COMMON), потом — более редкие.
   * Так нехватка товаров никогда не повышает шанс редких предметов.
   */
  function fallbackOrder(rolled, cfg) {
    var i = cfg.ORDER.indexOf(rolled);
    var out = [rolled];
    for (var d = i - 1; d >= 0; d--) out.push(cfg.ORDER[d]);
    for (var u = i + 1; u < cfg.ORDER.length; u++) out.push(cfg.ORDER[u]);
    return out;
  }

  /**
   * Выбирает вопросы для раунда с учётом редкости.
   * Для каждого из count мест:
   *   1) разыгрывается редкость по шансам из rarity-config.js;
   *   2) берётся случайный товар этой редкости, ещё не показанный в ЭТОМ раунде;
   *      при этом по возможности соблюдаются прежние правила: сначала товары, которых
   *      игрок не видел в прошлых раундах, не больше maxPerCategory из одной категории,
   *      разные ценовые уровни. Эти правила мягкие и никогда не меняют редкость;
   *   3) если товаров этой редкости не осталось — запасной вариант (см. fallbackOrder).
   * Повторов внутри раунда не бывает никогда.
   *
   * Возвращает { questions, rolls: [{ rolled, used }] } — rolls нужны для тестов и отчётов.
   */
  function pickRoundDetailed(questions, count, seenIds, random, maxPerCategory, rarityConfig) {
    random = random || Math.random;
    maxPerCategory = maxPerCategory || 2;
    var cfg = rarityConfig || DEFAULT_RARITY;
    validateRarityConfig(cfg);

    var seen = {};
    (seenIds || []).forEach(function (id) { seen[id] = true; });
    var pools = {};
    cfg.ORDER.forEach(function (r) { pools[r] = []; });
    questions.forEach(function (q) { pools[rarityOf(q, cfg)].push(q); });

    var picked = [];
    var pickedIds = {};
    var perCat = {};
    var perTier = {};
    var tierCap = Math.ceil(count / 3) + (count > 3 ? 0 : 1); // для 5 вопросов — не больше 2 на уровень цены
    var rolls = [];

    // Мягкие правила — от самого строгого набора к самому слабому
    var filters = [
      function (q) { return !seen[q.id] && (perCat[q.category] || 0) < maxPerCategory && (perTier[priceTier(q.price)] || 0) < tierCap; },
      function (q) { return !seen[q.id] && (perCat[q.category] || 0) < maxPerCategory; },
      function (q) { return (perCat[q.category] || 0) < maxPerCategory; },
      function () { return true; }
    ];

    function pickFrom(pool) {
      var available = pool.filter(function (q) { return !pickedIds[q.id]; });
      if (available.length === 0) return null;
      for (var f = 0; f < filters.length; f++) {
        var c = available.filter(filters[f]);
        if (c.length) return c[Math.floor(random() * c.length)];
      }
      return null;
    }

    var target = Math.min(count, questions.length);
    while (picked.length < target) {
      var rolled = rollRarity(random, cfg);
      var order = fallbackOrder(rolled, cfg);
      var q = null, used = null;
      for (var k = 0; k < order.length && !q; k++) {
        q = pickFrom(pools[order[k]]);
        if (q) used = order[k];
      }
      if (!q) break; // товаров больше нет совсем
      picked.push(q);
      pickedIds[q.id] = true;
      perCat[q.category] = (perCat[q.category] || 0) + 1;
      perTier[priceTier(q.price)] = (perTier[priceTier(q.price)] || 0) + 1;
      rolls.push({ rolled: rolled, used: used });
    }
    return { questions: picked, rolls: rolls };
  }

  /** То же, но возвращает только список вопросов (как раньше — для игры и сервера). */
  function pickRound(questions, count, seenIds, random, maxPerCategory, rarityConfig) {
    return pickRoundDetailed(questions, count, seenIds, random, maxPerCategory, rarityConfig).questions;
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
  // Уровень цены — только для разнообразия раунда (мягкое правило «не больше 2 одного уровня»).
  // После добавления машин, аукционных лотов и недвижимости дорогой уровень разделён ещё на два,
  // иначе «$1 500» и «$450 млн» считались бы одинаково дорогими. На очки не влияет.
  function priceTier(price) {
    if (price < 100) return "low";
    if (price < 1000) return "mid";
    if (price < 100000) return "high";
    if (price < 10000000) return "luxury";
    return "ultra";
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
    pickRoundDetailed: pickRoundDetailed,
    rollRarity: rollRarity,
    fallbackOrder: fallbackOrder,
    validateRarityConfig: validateRarityConfig,
    rarityOf: function (q, cfg) { return rarityOf(q, cfg || DEFAULT_RARITY); },
    RARITY: DEFAULT_RARITY,
    formatMoney: formatMoney
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.FV_SCORING = api;
})(typeof window !== "undefined" ? window : this);
