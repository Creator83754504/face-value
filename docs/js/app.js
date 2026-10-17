/*
 * FACE VALUE — интерфейс приложения.
 * Экраны: меню → игра (5 вопросов) → итоги; плюс «Моя статистика», «Рейтинг», «Как играть».
 */
(function () {
  "use strict";

  var CFG = window.FV_CONFIG || {};
  var ROUND_SIZE = CFG.ROUND_SIZE || 5;
  var S = window.FV_SCORING;
  var DATA = window.FV_DATA || { QUESTIONS: [], CATEGORIES: {}, REGIONS: {} };
  var TG = window.FV_TG;
  var API = window.FV_API;
  var STATS = window.FV_STATS;
  var ENGINE = window.FV_ENGINE;
  var LOCAL_IMAGES = window.FV_IMAGES || {};

  var store = STATS.makeStore(STATS.safeLocalStorage());

  // ───── Данные: в игре участвуют только корректные вопросы с фото ─────
  // В публичной сборке для рейтинга (tools/build-public.mjs) цен в приложении нет —
  // их знает только сервер. Тогда играть можно только в рейтинговом режиме внутри Telegram.
  var PUBLIC_BUILD = !!DATA.PUBLIC_BUILD;
  var QUESTIONS = (DATA.QUESTIONS || []).filter(function (q) {
    // Объекты, для которых ещё не найдено подходящее фото, в игре не участвуют (так же решает сервер)
    if (q && q.status === "needs-image") return false;
    var hasPrice = typeof q.price === "number" && q.price > 0;
    var ok = q && q.id && q.title && (hasPrice || PUBLIC_BUILD) &&
      q.image && (q.image.remote || LOCAL_IMAGES[q.id]);
    if (!ok) console.warn("[FACE VALUE] Вопрос пропущен (нет цены или фото):", q && q.id);
    return ok;
  });

  // Подписи для типа цены (поле priceType у новых объектов). Старые товары — розничные цены в США.
  var PRICE_TYPES = {
    new_msrp:          { chip: "Новый, цена производителя", question: "Сколько стоит новый?" },
    used_market:       { chip: "Рыночная цена", question: "Сколько стоит на рынке?", big: true },
    auction:           { chip: "Аукцион", question: "За сколько продали на аукционе?", big: true },
    private_sale:      { chip: "Частная сделка", question: "За сколько продали?", big: true },
    listing_ask:       { chip: "Цена в объявлении", question: "Сколько просят?", big: true },
    estimate:          { chip: "Оценка", question: "Во сколько оценивают?", big: true },
    unit_cost:         { chip: "Цена одной машины", question: "Сколько стоит одна машина?", big: true },
    construction_cost: { chip: "Стоимость постройки", question: "Сколько стоила постройка?", big: true }
  };

  // ───── Состояние ─────
  var state = {
    screen: "menu",
    engine: null,
    questions: [],
    index: 0,
    total: 0,
    results: [],
    phase: "idle", // idle | question | pending | revealed | finishing | results
    lastRanked: false
  };

  // ───── Элементы ─────
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    screens: {
      menu: $("screen-menu"), game: $("screen-game"), results: $("screen-results"),
      stats: $("screen-stats"), leaderboard: $("screen-leaderboard"), howto: $("screen-howto"),
      profile: $("screen-profile")
    },
    legendStrip: $("legend-strip"), rewardSheet: $("reward-sheet"), rewardSheetList: $("reward-sheet-list"),
    rewardSheetTitle: $("reward-sheet-title"),
    greeting: $("greeting"), menuRecord: $("menu-record"), menuRecordValue: $("menu-record-value"),
    menuStatsHint: $("menu-stats-hint"), menuLbHint: $("menu-leaderboard-hint"),
    progress: $("progress"), counter: $("counter"), scoreTotal: $("score-total"),
    body: $("question-body"), photo: $("photo"), photoImg: $("photo-img"),
    photoFallback: $("photo-fallback"), photoSkeleton: $("photo-skeleton"),
    category: $("product-category"), guessLabel: $("guess-label"), guessHint: $("guess-hint"), region: $("product-region"), testTag: $("product-test"), rarity: $("product-rarity"),
    brand: $("product-brand"), title: $("product-title"), subtitle: $("product-subtitle"),
    form: $("guess-form"), field: $("guess-field"), input: $("guess-input"), error: $("guess-error"),
    answerBtn: $("btn-answer"),
    reveal: $("reveal"), verdict: $("reveal-verdict"), points: $("reveal-points"),
    actual: $("reveal-actual"), guess: $("reveal-guess"), diff: $("reveal-diff"),
    note: $("reveal-note"), source: $("reveal-source"), date: $("reveal-date"), next: $("btn-next"),
    finalScore: $("final-score"), finalMax: $("final-max"), finalRecord: $("final-record"),
    finalRank: $("final-rank"), finalGood: $("final-good"), finalAccuracy: $("final-accuracy"),
    finalBest: $("final-best"), breakdown: $("breakdown"), finalSync: $("final-sync"),
    sheet: $("sheet"), sheetTitle: $("sheet-title"), sheetText: $("sheet-text"), sheetOk: $("sheet-ok")
  };

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  // ───── Навигация ─────
  function show(name) {
    state.screen = name;
    Object.keys(el.screens).forEach(function (key) {
      var s = el.screens[key];
      var active = key === name;
      s.classList.toggle("is-active", active);
      s.setAttribute("aria-hidden", active ? "false" : "true");
      if (active) s.scrollTop = 0;
    });
    // Системная кнопка «Назад» в Telegram
    if (name === "menu") TG.setBack(null);
    else if (name === "game") TG.setBack(confirmQuit);
    else TG.setBack(function () { go("menu"); });
  }

  function go(name) {
    TG.haptic.select();
    if (name === "menu") renderMenu();
    if (name === "stats") renderStats();
    if (name === "leaderboard") renderLeaderboard();
    if (name === "profile") renderProfile();
    show(name);
  }

  // ───── Подтверждение (Telegram или своё окно) ─────
  var sheetCb = null;
  function askConfirm(title, text, okLabel, cb) {
    if (TG.confirm(title + "\n\n" + text, cb)) return;
    el.sheetTitle.textContent = title;
    el.sheetText.textContent = text;
    el.sheetOk.textContent = okLabel || "Да";
    sheetCb = cb;
    el.sheet.hidden = false;
    setTimeout(function () { el.sheetOk.focus(); }, 30);
  }
  function closeSheet(result) {
    el.sheet.hidden = true;
    var cb = sheetCb;
    sheetCb = null;
    if (cb) cb(result);
  }

  // ───── Форматирование ─────
  function money(v) { return S.formatMoney(v, "USD"); }
  function num(v) { return Number(v || 0).toLocaleString("ru-RU"); }
  function formatDate(iso) {
    var p = String(iso || "").split("-");
    return p.length === 3 ? p[2] + "." + p[1] + "." + p[0] : "—";
  }

  // ───── Меню ─────
  function renderMenu() {
    var name = TG.firstName();
    el.greeting.textContent = name ? "Привет, " + name : "Игра на знание реальных цен";
    var s = store.load();
    el.menuRecord.hidden = s.bestRound <= 0;
    el.menuRecordValue.textContent = num(s.bestRound);
    el.menuStatsHint.textContent = s.rounds > 0 ? s.rounds + " " + plural(s.rounds, "раунд", "раунда", "раундов") : "";
    el.menuLbHint.textContent = API.enabled() ? "Топ игроков" : "Скоро";
  }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  // ───── Старт раунда ─────
  function startRound() {
    if (QUESTIONS.length < ROUND_SIZE) {
      askConfirm("Нет вопросов", "Проверьте файл js/data/questions.js", "Понятно", function () {});
      return;
    }
    TG.haptic.tap();
    var useServer = API.enabled();
    if (PUBLIC_BUILD && !useServer) {
      askConfirm("Откройте игру в Telegram", "В этой версии цены проверяет сервер, поэтому играть можно только внутри Telegram.", "Понятно", function () {});
      return;
    }
    state.engine = useServer
      ? ENGINE.RemoteEngine({ scoring: S, api: API, questions: QUESTIONS })
      : ENGINE.LocalEngine({ scoring: S, questions: QUESTIONS, store: store, roundSize: ROUND_SIZE });

    state.engine.start().then(function (r) {
      state.questions = r.questions;
      state.index = 0;
      state.total = 0;
      state.results = [];
      buildProgress();
      renderQuestion();
      show("game");
    }).catch(function (err) {
      if (useServer && !PUBLIC_BUILD) {
        askConfirm("Сервер недоступен", (err && err.message ? err.message + ". " : "") + "Сыграть без рейтинга?", "Играть", function (ok) {
          if (!ok) return;
          state.engine = ENGINE.LocalEngine({ scoring: S, questions: QUESTIONS, store: store, roundSize: ROUND_SIZE });
          state.engine.start().then(function (r) {
            state.questions = r.questions; state.index = 0; state.total = 0; state.results = [];
            buildProgress(); renderQuestion(); show("game");
          });
        });
      } else {
        console.error(err);
        askConfirm("Не удалось начать раунд", (err && err.message) || "Попробуйте ещё раз чуть позже.", "Понятно", function () {});
      }
    });
  }

  function buildProgress() {
    el.progress.innerHTML = "";
    state.questions.forEach(function () { el.progress.appendChild(document.createElement("i")); });
  }

  // ───── Фото товара: локальный файл → официальная ссылка → заглушка ─────
  function imageCandidates(q) {
    var list = [];
    if (LOCAL_IMAGES[q.id]) list.push(LOCAL_IMAGES[q.id]);
    if (q.image && q.image.remote) list.push(q.image.remote);
    return list;
  }

  var imgToken = 0;
  function showPhoto(q) {
    var token = ++imgToken;
    var list = imageCandidates(q);
    var i = 0;
    el.photo.classList.remove("is-loaded", "is-failed");
    el.photoFallback.hidden = true;
    el.photoSkeleton.hidden = false;
    el.photoImg.alt = q.title;
    el.photoImg.removeAttribute("src");

    function tryNext() {
      if (token !== imgToken) return;
      if (i >= list.length) {
        el.photo.classList.add("is-failed");
        el.photoSkeleton.hidden = true;
        el.photoFallback.hidden = false;
        return;
      }
      var src = list[i++];
      el.photoImg.onload = function () {
        if (token !== imgToken) return;
        el.photoSkeleton.hidden = true;
        el.photo.classList.add("is-loaded");
      };
      el.photoImg.onerror = function () { tryNext(); };
      el.photoImg.src = src;
    }
    tryNext();
  }

  function preload(q) {
    if (!q) return;
    var src = imageCandidates(q)[0];
    if (src) { var im = new Image(); im.referrerPolicy = "no-referrer"; im.src = src; }
  }

  // ───── Экран вопроса ─────
  function renderQuestion() {
    var q = state.questions[state.index];
    state.phase = "question";

    Array.prototype.forEach.call(el.progress.children, function (bar, i) {
      bar.className = i < state.index ? "is-done" : i === state.index ? "is-current" : "";
      if (i === state.index) bar.setAttribute("data-rarity", S.rarityOf(q)); else bar.removeAttribute("data-rarity");
    });
    el.counter.textContent = (state.index + 1) + "/" + state.questions.length;
    el.scoreTotal.textContent = num(state.total);

    showPhoto(q);
    preload(state.questions[state.index + 1]);

    el.category.textContent = (DATA.CATEGORIES && DATA.CATEGORIES[q.category]) || q.category;
    el.region.textContent = ((DATA.REGIONS && DATA.REGIONS[q.region]) || q.region || "США") + " · " + (q.currency || "USD");
    // Новые объекты (машины, аукционные лоты, недвижимость…) подсказывают, какая именно это цена
    var pt = q.priceType && PRICE_TYPES[q.priceType];
    if (pt) el.region.textContent = pt.chip + (q.priceDate ? " · " + String(q.priceDate).slice(0, 4) : "") + " · " + (q.currency || "USD");
    el.guessLabel.textContent = pt ? pt.question : "Сколько стоит в США?";
    el.guessHint.textContent = q.price >= 1e6 || (pt && pt.big) ? "Можно так: 2500000, 2.5m или 2,5 млн" : "Можно так: 1500, 1 500 или 1.5k";
    el.testTag.hidden = q.status === "verified";
    // Метка редкости — только для необычных товаров (COMMON не подписываем)
    var rar = S.rarityOf(q);
    el.rarity.hidden = rar === S.RARITY.DEFAULT;
    el.rarity.textContent = rar === "LEGENDARY" ? "LEGENDARY" : ((S.RARITY.LABELS && S.RARITY.LABELS[rar]) || rar);
    el.rarity.setAttribute("data-rarity", rar);
    // Оформление карточки по редкости (рамка, свечение, блик) — только CSS, очки не меняются
    el.body.setAttribute("data-rarity", rar);
    // LEGENDARY-вопрос с баннером: тематические цвета рамки и полоска со сценой этого баннера.
    // Берётся только существующая привязка вопрос → баннер; о цене ничего не говорит.
    var legend = rar === "LEGENDARY" && window.FV_REWARDS ? window.FV_REWARDS.bannerForQuestion(q.id) : null;
    if (legend) el.body.setAttribute("data-legend", legend); else el.body.removeAttribute("data-legend");
    el.legendStrip.innerHTML = "";
    el.legendStrip.hidden = !legend;
    if (legend) { var scene = window.FV_REWARDS.bannerEl(legend); if (scene) el.legendStrip.appendChild(scene); }
    el.brand.textContent = q.brand || "";
    el.title.textContent = q.model || q.title;
    el.subtitle.textContent = q.subtitle || "";

    el.form.classList.remove("is-locked");
    el.input.disabled = false;
    el.answerBtn.disabled = false;
    el.answerBtn.textContent = "Ответить";
    el.input.value = "";
    clearError();
    el.reveal.hidden = true;

    el.body.classList.remove("is-entering");
    void el.body.offsetWidth;
    el.body.classList.add("is-entering");

    // На компьютере сразу ставим курсор в поле. На телефоне — нет, чтобы клавиатура не закрыла фото.
    if (finePointer) setTimeout(function () { el.input.focus(); }, 60);
  }

  function showError(message) {
    el.error.textContent = message;
    el.field.classList.remove("has-error");
    void el.field.offsetWidth;
    el.field.classList.add("has-error");
    TG.haptic.error();
  }
  function clearError() {
    el.error.textContent = "";
    el.field.classList.remove("has-error");
  }

  function submitAnswer(event) {
    event.preventDefault();
    if (state.phase !== "question") return; // защита от двойного нажатия

    var parsed = S.parsePrice(el.input.value);
    if (!parsed.ok) { showError(parsed.message); return; }

    state.phase = "pending";
    el.answerBtn.disabled = true;
    el.answerBtn.textContent = "Проверяем…";
    el.input.blur();

    state.engine.answer(state.index, parsed.value).then(function (res) {
      state.results.push({ question: state.questions[state.index], result: res });
      state.total = res.total;
      state.phase = "revealed";
      el.form.classList.add("is-locked");
      el.input.disabled = true;
      renderReveal(state.questions[state.index], res);
      TG.haptic.result(S.isGoodAnswer(res.points));
    }).catch(function (err) {
      state.phase = "question";
      el.answerBtn.disabled = false;
      el.answerBtn.textContent = "Ответить";
      showError((err && err.message) || "Не удалось отправить ответ");
    });
  }

  function renderReveal(q, res) {
    var good = S.isGoodAnswer(res.points);
    el.verdict.textContent = res.verdict.label;
    el.verdict.classList.toggle("is-good", good);
    el.points.textContent = "+" + num(res.points);
    el.points.classList.toggle("is-good", good);
    el.points.classList.remove("pop");
    void el.points.offsetWidth;
    el.points.classList.add("pop");

    countUp(el.actual, res.price);
    el.guess.textContent = money(res.guess);
    if (res.diff === 0) {
      el.diff.textContent = "0 — точно";
    } else {
      var sign = res.diff > 0 ? "+" : "−";
      el.diff.textContent = sign + money(Math.abs(res.diff)) + " (" + sign + String(Math.abs(res.diffPercent)).replace(".", ",") + "%)";
    }
    el.diff.className = res.diff > 0 ? "is-over" : res.diff < 0 ? "is-under" : "";

    var note = res.note || q.note || "";
    el.note.textContent = note;
    el.note.hidden = !note;
    if (q.source && q.source.url) {
      el.source.textContent = "Источник: " + (q.source.label || q.source.url);
      el.source.href = q.source.url;
    } else {
      el.source.textContent = "Источник не указан (тестовые данные)";
      el.source.removeAttribute("href");
    }
    el.date.textContent = formatDate(q.checkedAt);

    el.next.textContent = state.index === state.questions.length - 1 ? "Итоги" : "Дальше";
    el.scoreTotal.textContent = num(state.total);
    el.reveal.hidden = false;

    setTimeout(function () {
      el.reveal.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    }, 80);
  }

  function countUp(node, target) {
    if (reduceMotion) { node.textContent = money(target); return; }
    var start = null, duration = 650;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = p < 1 ? money(Math.round(target * eased)) : money(target);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function nextQuestion() {
    if (state.phase !== "revealed") return;
    TG.haptic.tap();
    if (state.index < state.questions.length - 1) {
      state.index += 1;
      renderQuestion();
      el.screens.game.scrollTop = 0;
    } else {
      finishRound();
    }
  }

  function confirmQuit() {
    if (state.phase === "finishing") return;
    askConfirm("Выйти из раунда?", "Результат этого раунда не сохранится.", "Выйти", function (ok) {
      if (!ok) return;
      state.phase = "idle";
      state.engine = null;
      go("menu");
    });
  }

  // ───── Итоги ─────
  function finishRound() {
    state.phase = "finishing";
    el.next.disabled = true;
    state.engine.finish().then(function (fin) {
      var results = fin.results;
      // Личная статистика — всегда локально
      var rec = store.addRound(results.map(function (r) { return { points: r.points, accuracy: r.accuracy }; }));
      renderResults(fin, rec);
      // Награды присылает только сервер: новые за этот раунд (или те же — при повторе после потерянного ответа)
      if (fin.server && fin.server.rewards && fin.server.rewards.length) showRewardSheet(fin.server.rewards);
    }).catch(function (err) {
      // Если сервер не принял результат, всё равно показываем локальные итоги
      var results = state.results.map(function (x) { return x.result; });
      var total = S.roundTotal(results.map(function (r) { return r.points; }), ROUND_SIZE);
      var rec = store.addRound(results.map(function (r) { return { points: r.points, accuracy: r.accuracy }; }));
      renderResults({ total: total, results: results, ranked: false, error: err }, rec);
    }).then(function () { el.next.disabled = false; });
  }

  function renderResults(fin, rec) {
    state.phase = "results";
    var max = state.questions.length * S.MAX_POINTS;
    var results = fin.results;
    var good = results.filter(function (r) { return S.isGoodAnswer(r.points); }).length;
    var acc = results.length ? Math.round(results.reduce(function (a, r) { return a + r.accuracy; }, 0) / results.length) : 0;

    el.finalScore.textContent = num(fin.total);
    el.finalMax.textContent = "/ " + num(max);
    el.finalRank.textContent = S.rank(fin.total, max);
    el.finalGood.textContent = good + "/" + results.length;
    el.finalAccuracy.textContent = acc + "%";
    el.finalBest.textContent = num(rec.stats.bestRound);
    el.finalRecord.hidden = !rec.isRecord;

    el.finalSync.hidden = true;
    if (fin.ranked && fin.server) {
      el.finalSync.hidden = false;
      el.finalSync.textContent = (fin.server.newBest || fin.server.best === fin.total)
        ? "Результат засчитан в общий рейтинг."
        : "Раунд засчитан. В рейтинге остаётся твой лучший результат: " + num(fin.server.best) + ".";
    } else if (fin.error) {
      el.finalSync.hidden = false;
      // uncertain: ответа нет (сеть или сбой сервера) — запись могла пройти, утверждать «не сохранён» нельзя
      el.finalSync.textContent = fin.error.uncertain
        ? "Сервер не ответил. Результат мог быть засчитан — проверь рейтинг позже."
        : "Сервер не принял результат, он сохранён только на этом устройстве.";
    }

    el.breakdown.innerHTML = "";
    state.results.forEach(function (x, i) {
      var q = x.question, r = x.result;
      var li = document.createElement("li");
      li.style.animationDelay = (0.06 * i + 0.08) + "s";
      var t = document.createElement("span"); t.className = "bd-title"; t.textContent = q.title;
      var qr = S.rarityOf(q);
      if (qr !== S.RARITY.DEFAULT) {
        li.setAttribute("data-rarity", qr);
        var badge = document.createElement("span"); badge.className = "bd-rarity";
        badge.setAttribute("data-rarity", qr);
        badge.textContent = (S.RARITY.LABELS && S.RARITY.LABELS[qr]) || qr;
        t.appendChild(document.createTextNode(" ")); t.appendChild(badge);
      }
      var p = document.createElement("span"); p.className = "bd-points" + (S.isGoodAnswer(r.points) ? " is-good" : ""); p.textContent = "+" + num(r.points);
      var m = document.createElement("span"); m.className = "bd-meta";
      m.textContent = "Цена " + money(r.price) + " · твой ответ " + money(r.guess);
      li.appendChild(t); li.appendChild(p); li.appendChild(m);
      el.breakdown.appendChild(li);
    });

    TG.haptic.result(fin.total >= max * 0.55);
    show("results");
  }

  // ───── Статистика ─────
  function renderStats() {
    var s = store.load();
    $("stats-empty").hidden = s.rounds > 0;
    $("stats-body").hidden = s.rounds === 0;
    $("st-best").textContent = num(s.bestRound);
    $("st-rounds").textContent = num(s.rounds);
    $("st-answers").textContent = num(s.answers);
    $("st-total").textContent = num(s.totalPoints);
    $("st-accuracy").textContent = STATS.averageAccuracy(s) + "%";
    $("st-good").textContent = num(s.goodAnswers);
    $("st-perfect").textContent = num(s.perfectAnswers);
  }

  // ───── Рейтинг ─────
  function lbState(name) {
    ["lb-offline", "lb-loading", "lb-error", "lb-table-wrap"].forEach(function (id) { $(id).hidden = id !== name; });
  }

  function renderLeaderboard() {
    var s = store.load();
    $("lb-local-best").textContent = s.bestRound > 0 ? num(s.bestRound) : "—";
    if (!API.enabled()) {
      var p = document.querySelector("#lb-offline p");
      if (API.configured() && !TG.inside) p.textContent = "Рейтинг работает только внутри Telegram: там сервер может проверить, кто играет.";
      lbState("lb-offline");
      return;
    }
    lbState("lb-loading");
    API.leaderboard().then(function (data) {
      var list = $("lb-table");
      list.innerHTML = "";
      (data.top || []).forEach(function (row, i) {
        var li = document.createElement("li");
        if (data.me && row.isMe) li.className = "is-me";
        var pos = document.createElement("span"); pos.className = "lb-pos"; pos.textContent = String(i + 1);
        var nm = document.createElement("span"); nm.className = "lb-name"; nm.textContent = row.name || "Игрок";
        var sc = document.createElement("span"); sc.className = "lb-score"; sc.textContent = num(row.best);
        li.appendChild(pos); li.appendChild(nm); li.appendChild(sc);
        // Косметика (префикс EPIC, баннер LEGENDARY) — только если сервер прислал её для этого игрока
        if (row.cosmetics && window.FV_REWARDS) window.FV_REWARDS.decorateRow(li, nm, row.cosmetics);
        list.appendChild(li);
      });
      $("lb-empty").hidden = (data.top || []).length > 0;
      var me = $("lb-me");
      if (data.me && data.me.best > 0) {
        me.hidden = false;
        me.innerHTML = "";
        var a = document.createElement("span"); a.textContent = "Твоё место: " + data.me.position;
        var b = document.createElement("b"); b.textContent = num(data.me.best);
        me.appendChild(a); me.appendChild(b);
      } else me.hidden = true;
      lbState("lb-table-wrap");
    }).catch(function (err) {
      $("lb-error-text").textContent = (err && err.message) || "Проверь интернет и попробуй ещё раз.";
      lbState("lb-error");
    });
  }

  // ───── Новая награда ─────
  var RW = window.FV_REWARDS_CONFIG || { REWARDS: {} };
  var TIER_LABEL = { EPIC: "EPIC", LEGENDARY: "LEGENDARY" };
  function rewardTag(def) {
    var t = document.createElement("span");
    t.className = "rw-tier";
    t.setAttribute("data-tier", def.tier);
    t.textContent = TIER_LABEL[def.tier] || def.tier;
    return t;
  }
  function showRewardSheet(ids) {
    var list = ids.filter(function (id) { return RW.REWARDS[id]; });
    if (!list.length) return;
    el.rewardSheetTitle.textContent = list.length > 1 ? "Новые награды" : "Новая награда получена";
    el.rewardSheetList.innerHTML = "";
    // Сначала LEGENDARY
    list.sort(function (a, b) { return (RW.REWARDS[a].tier === "LEGENDARY" ? 0 : 1) - (RW.REWARDS[b].tier === "LEGENDARY" ? 0 : 1); });
    list.forEach(function (id) {
      var def = RW.REWARDS[id];
      var item = document.createElement("div");
      item.className = "reward-item";
      item.setAttribute("data-reward", id);
      var head = document.createElement("div");
      head.className = "reward-item__head";
      head.appendChild(rewardTag(def));
      var name = document.createElement("b");
      name.textContent = def.label;
      head.appendChild(name);
      item.appendChild(head);
      var pv = window.FV_REWARDS && window.FV_REWARDS.previewEl(id);
      if (pv) item.appendChild(pv);
      el.rewardSheetList.appendChild(item);
    });
    el.rewardSheet.hidden = false;
    TG.haptic.result(true);
  }
  function closeRewardSheet() {
    el.rewardSheet.hidden = true;
    el.rewardSheetList.innerHTML = "";
  }

  // ───── Профиль: коллекция и выбор оформления ─────
  var profileState = null;
  function pfState(name) {
    ["pf-offline", "pf-loading", "pf-error"].forEach(function (id) { $(id).hidden = id !== name; });
    $("pf-design").hidden = name !== "ready";
  }
  function questionTitle(id) {
    for (var i = 0; i < DATA.QUESTIONS.length; i++) if (DATA.QUESTIONS[i].id === id) return DATA.QUESTIONS[i].title;
    return null;
  }
  function formatDay(ms) {
    var d = new Date(ms);
    return isNaN(d) ? "" : d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function renderCollection(owned) {
    var box = $("pf-collection");
    box.innerHTML = "";
    var ids = Object.keys(RW.REWARDS).sort(function (a, b) {
      return (RW.REWARDS[a].tier === "LEGENDARY" ? 0 : 1) - (RW.REWARDS[b].tier === "LEGENDARY" ? 0 : 1);
    });
    var count = 0;
    ids.forEach(function (id) {
      var def = RW.REWARDS[id];
      var got = owned[id];
      if (got) count++;
      var card = document.createElement("div");
      card.className = "pf-card" + (got ? " is-owned" : " is-locked");
      card.setAttribute("data-reward", id);
      card.setAttribute("data-tier", def.tier);
      var head = document.createElement("div");
      head.className = "pf-card__head";
      head.appendChild(rewardTag(def));
      var name = document.createElement("b");
      name.className = "pf-card__name";
      name.textContent = def.label;
      head.appendChild(name);
      card.appendChild(head);
      var pv = window.FV_REWARDS && window.FV_REWARDS.previewEl(id);
      if (pv) card.appendChild(pv);
      var info = document.createElement("p");
      info.className = "pf-card__info";
      if (got) {
        info.textContent = "Получена" + (got.earnedAt ? " " + formatDay(got.earnedAt) : "");
      } else {
        // Условие — только то, что точно известно из rewards-config.js: вопрос и порог очков
        var qt = questionTitle(def.questionId);
        info.textContent = "Не открыта. Точный ответ на вопрос" + (qt ? " «" + qt + "»" : "") +
          ": от " + def.minPoints + " из " + S.MAX_POINTS + " очков.";
      }
      card.appendChild(info);
      box.appendChild(card);
    });
    $("pf-count").textContent = count + " из " + ids.length;
  }

  function choiceBtn(kind, id, selected, label, content) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "pf-choice";
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", selected ? "true" : "false");
    b.setAttribute("data-kind", kind);
    b.setAttribute("data-id", id || "");
    if (content) b.appendChild(content);
    b.setAttribute("aria-label", label);
    // У префикса подпись уже внутри самого префикса — второй раз не повторяем
    if (!(content && kind === "prefix")) {
      var t = document.createElement("span");
      t.className = "pf-choice__label";
      t.textContent = label;
      b.appendChild(t);
    }
    b.addEventListener("click", function () { chooseCosmetic(kind, id); });
    return b;
  }

  function renderDesign() {
    var p = profileState;
    var owned = {};
    p.rewards.forEach(function (r) { owned[r.id] = r; });
    renderCollection(owned);
    // Превью строки рейтинга с текущим оформлением (то же, что видят другие игроки)
    var list = $("pf-preview");
    list.innerHTML = "";
    var li = document.createElement("li");
    li.className = "is-me";
    var pos = document.createElement("span"); pos.className = "lb-pos"; pos.textContent = "·";
    var nm = document.createElement("span"); nm.className = "lb-name"; nm.textContent = TG.firstName() || "Ты";
    var sc = document.createElement("span"); sc.className = "lb-score"; sc.textContent = "";
    li.appendChild(pos); li.appendChild(nm); li.appendChild(sc);
    if (window.FV_REWARDS && (p.selected.prefix || p.selected.banner)) window.FV_REWARDS.decorateRow(li, nm, p.selected);
    list.appendChild(li);

    var prefixes = p.rewards.filter(function (r) { return RW.REWARDS[r.id] && RW.REWARDS[r.id].kind === "prefix"; });
    var banners = p.rewards.filter(function (r) { return RW.REWARDS[r.id] && RW.REWARDS[r.id].kind === "banner"; });
    $("pf-empty").hidden = p.rewards.length > 0;
    $("pf-pickers").hidden = p.rewards.length === 0;
    var pc = $("pf-prefix-choices"), bc = $("pf-banner-choices");
    pc.innerHTML = ""; bc.innerHTML = "";
    pc.appendChild(choiceBtn("prefix", null, !p.selected.prefix, "Без префикса"));
    prefixes.forEach(function (r) {
      pc.appendChild(choiceBtn("prefix", r.id, p.selected.prefix === r.id, RW.REWARDS[r.id].label, window.FV_REWARDS.prefixEl(r.id)));
    });
    bc.appendChild(choiceBtn("banner", null, !p.selected.banner, "Без баннера"));
    banners.forEach(function (r) {
      bc.appendChild(choiceBtn("banner", r.id, p.selected.banner === r.id, RW.REWARDS[r.id].label, window.FV_REWARDS.previewEl(r.id)));
    });
    if (!prefixes.length) pc.appendChild(Object.assign(document.createElement("p"), { className: "pf-hint", textContent: "EPIC-префиксов пока нет." }));
    if (!banners.length) bc.appendChild(Object.assign(document.createElement("p"), { className: "pf-hint", textContent: "LEGENDARY-баннеров пока нет." }));
  }

  var saving = false;
  function chooseCosmetic(kind, id) {
    if (!profileState || saving) return;
    var next = { prefix: profileState.selected.prefix, banner: profileState.selected.banner };
    next[kind] = id;
    saving = true;
    var status = $("pf-status");
    status.textContent = "Сохраняю…";
    document.querySelectorAll(".pf-choice").forEach(function (b) { b.disabled = true; });
    // Сервер проверит, что награда действительно получена; в ответ — актуальный профиль
    API.setCosmetics(next.prefix, next.banner).then(function (p) {
      profileState = p;
      renderDesign();
      status.textContent = "Сохранено. Так тебя видят в рейтинге.";
    }).catch(function (err) {
      status.textContent = (err && err.message) || "Не удалось сохранить. Попробуй ещё раз.";
      document.querySelectorAll(".pf-choice").forEach(function (b) { b.disabled = false; });
    }).then(function () { saving = false; });
  }

  function renderProfile() {
    $("pf-status").textContent = "";
    if (!API.enabled()) {
      profileState = null;
      pfState("pf-offline");
      renderCollection({});
      return;
    }
    pfState("pf-loading");
    renderCollection({});
    API.profile().then(function (p) {
      profileState = p;
      pfState("ready");
      renderDesign();
    }).catch(function (err) {
      $("pf-error-text").textContent = (err && err.message) || "Проверь интернет и попробуй ещё раз.";
      pfState("pf-error");
    });
  }

  // ───── Обработчики ─────
  function bind() {
    $("btn-play").addEventListener("click", startRound);
    $("btn-again").addEventListener("click", startRound);
    $("btn-quit").addEventListener("click", confirmQuit);
    $("btn-lb-retry").addEventListener("click", renderLeaderboard);
    $("btn-pf-retry").addEventListener("click", renderProfile);
    $("btn-reward-profile").addEventListener("click", function () { closeRewardSheet(); go("profile"); });
    document.querySelectorAll("[data-reward-close]").forEach(function (b) { b.addEventListener("click", closeRewardSheet); });
    $("btn-reset-stats").addEventListener("click", function () {
      askConfirm("Сбросить статистику?", "Рекорд и все показатели на этом устройстве будут удалены.", "Сбросить", function (ok) {
        if (!ok) return;
        store.reset();
        renderStats();
        renderMenu();
      });
    });
    document.querySelectorAll("[data-go]").forEach(function (b) {
      b.addEventListener("click", function () { go(b.getAttribute("data-go")); });
    });
    document.querySelectorAll("[data-action=play]").forEach(function (b) { b.addEventListener("click", startRound); });
    document.querySelectorAll("[data-sheet]").forEach(function (b) {
      b.addEventListener("click", function () { closeSheet(b.getAttribute("data-sheet") === "ok"); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !el.sheet.hidden) closeSheet(false);
    });

    el.form.addEventListener("submit", submitAnswer);
    el.next.addEventListener("click", nextQuestion);
    el.input.addEventListener("input", function () { if (el.error.textContent) clearError(); });
    el.input.addEventListener("focus", function () {
      // На iPhone при открытии клавиатуры прокручиваем так, чтобы поле и кнопка были видны
      setTimeout(function () { el.form.scrollIntoView({ block: "end", behavior: "smooth" }); }, 320);
    });
    el.source.addEventListener("click", function (e) {
      if (!el.source.getAttribute("href")) return;
      e.preventDefault();
      TG.openLink(el.source.href);
    });
  }

  TG.init();
  bind();
  renderMenu();
  show("menu");

  // Для отладки в консоли браузера
  window.FV_DEBUG = { state: state, questions: QUESTIONS, store: store };
})();
