/*
 * FACE VALUE — «движок» раунда.
 *
 * Два варианта с одинаковым интерфейсом (все методы возвращают Promise):
 *
 *   LocalEngine  — всё считается на устройстве. Используется в браузере и пока
 *                  сервер не подключён. Результаты попадают только в личную статистику.
 *   RemoteEngine — рейтинговый режим: сервер выбирает вопросы, хранит раунд,
 *                  сам считает очки и не даёт ответить дважды. Клиент только показывает.
 *
 * Интерфейс:
 *   start()               → { questions: [вопрос × 5] }
 *   answer(index, guess)  → { price, points, diff, diffPercent, verdict, accuracy, total }
 *   finish()              → { total, results, ranked, server? }
 */
(function (root) {
  function LocalEngine(opts) {
    var S = opts.scoring;
    var questions = opts.questions;
    var store = opts.store;
    var size = opts.roundSize || 5;
    var random = opts.random || Math.random;
    var round = null;

    return {
      ranked: false,
      start: function () {
        var seen = store.loadSeen();
        var unseen = questions.filter(function (q) { return seen.indexOf(q.id) === -1; }).length;
        if (unseen < size) seen = []; // все вопросы уже показаны — начинаем круг заново
        var picked = S.pickRound(questions, Math.min(size, questions.length), seen, random);
        round = { questions: picked, answers: [], finished: false };
        return Promise.resolve({ questions: picked });
      },
      answer: function (index, guess) {
        if (!round || round.finished) return Promise.reject(new Error("Раунд не начат"));
        if (index !== round.answers.length) return Promise.reject(new Error("Неверный номер вопроса"));
        if (!(guess > 0)) return Promise.reject(new Error("Некорректный ответ"));
        var q = round.questions[index];
        var r = S.scoreGuess(guess, q.price);
        var res = {
          price: q.price, guess: guess, points: r.points, diff: r.diff, diffPercent: r.diffPercent,
          verdict: r.verdict, accuracy: S.accuracyPercent(guess, q.price)
        };
        round.answers.push(res);
        res.total = S.roundTotal(round.answers.map(function (a) { return a.points; }), size);
        return Promise.resolve(res);
      },
      finish: function () {
        if (!round || round.finished) return Promise.reject(new Error("Раунд уже завершён"));
        if (round.answers.length !== round.questions.length) return Promise.reject(new Error("Есть неотвеченные вопросы"));
        round.finished = true;
        var seen = store.loadSeen();
        round.questions.forEach(function (q) { if (seen.indexOf(q.id) === -1) seen.push(q.id); });
        store.saveSeen(seen);
        var total = S.roundTotal(round.answers.map(function (a) { return a.points; }), size);
        return Promise.resolve({ total: total, results: round.answers.slice(), ranked: false });
      }
    };
  }

  /** Неизвестен ли исход запроса: сеть/таймаут (status 0) или ошибка сервера 5xx. */
  function isUncertain(err) {
    if (!err) return false;
    if (err.code === "network" || err.status === 0 || err.status === undefined) return true;
    return err.status >= 500;
  }

  function RemoteEngine(opts) {
    var S = opts.scoring;
    var api = opts.api;
    // Повтор завершения раунда: всего 3 попытки, паузы 0,8 с и 2 с (для тестов можно задать свои)
    var retry = opts.finishRetry || { attempts: 3, delays: [800, 2000] };
    var sleep = opts.sleep || function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    var byId = {};
    opts.questions.forEach(function (q) { byId[q.id] = q; });
    var round = null;

    return {
      ranked: true,
      start: function () {
        return api.startRound().then(function (data) {
          var qs = (data.questionIds || []).map(function (id) { return byId[id]; });
          if (!data.roundId || qs.length === 0 || qs.some(function (q) { return !q; })) {
            throw new Error("Версии вопросов на сервере и в приложении не совпадают. Обнови приложение.");
          }
          round = { id: data.roundId, questions: qs, answers: [] };
          return { questions: qs };
        });
      },
      answer: function (index, guess) {
        if (!round) return Promise.reject(new Error("Раунд не начат"));
        return api.answer(round.id, index, guess).then(function (data) {
          // Цену и очки присылает сервер — клиент их только показывает
          var r = S.scoreGuess(guess, data.price);
          var res = {
            price: data.price, guess: guess, points: data.points, diff: r.diff, diffPercent: r.diffPercent,
            verdict: S.verdict(data.points), accuracy: S.accuracyPercent(guess, data.price), total: data.total,
            note: data.note
          };
          round.answers.push(res);
          return res;
        });
      },
      /*
       * Завершение раунда с ограниченным повтором.
       * Сервер отвечает на повторное завершение уже сохранённым итогом (repeated: true) и ничего
       * не начисляет второй раз, поэтому повторять запрос безопасно. Повторяем только когда
       * результат НЕИЗВЕСТЕН: нет соединения / таймаут или ошибка сервера 5xx (например, запись
       * прошла, а ответ потерялся). На ответы 4xx (сервер точно отказал) не повторяем.
       * Если все попытки неудачны, ошибка помечается uncertain = true: результат МОГ сохраниться.
       */
      finish: function () {
        if (!round) return Promise.reject(new Error("Раунд не начат"));
        var answers = round.answers.slice();
        var id = round.id;
        round = null;
        var delays = retry.delays;
        var attempt = 0;
        function tryOnce() {
          attempt++;
          return api.finishRound(id).then(function (data) {
            return { total: data.total, results: answers, ranked: true, server: data, attempts: attempt };
          }, function (err) {
            var unknown = isUncertain(err);
            if (unknown && attempt < retry.attempts) {
              return sleep(delays[Math.min(attempt - 1, delays.length - 1)]).then(tryOnce);
            }
            if (err && typeof err === "object") { err.uncertain = unknown; err.attempts = attempt; }
            throw err;
          });
        }
        return tryOnce();
      }
    };
  }

  var api = { LocalEngine: LocalEngine, RemoteEngine: RemoteEngine, isUncertain: isUncertain };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.FV_ENGINE = api;
})(typeof window !== "undefined" ? window : this);
