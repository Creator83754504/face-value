/*
 * FACE VALUE — клиент серверного API (рейтинг и рейтинговые раунды).
 *
 * Работает только если:
 *   1) в js/config.js указан API_BASE (адрес сервера), и
 *   2) игра открыта внутри Telegram (есть подписанная initData).
 * Иначе FV_API.enabled() === false и игра работает локально.
 *
 * Авторизация: заголовок "Authorization: tma <initData>".
 * Сервер сам проверяет подпись Telegram — user_id от клиента не принимается.
 */
(function (root) {
  var CFG = root.FV_CONFIG || {};
  var TG = root.FV_TG;

  function base() { return String(CFG.API_BASE || "").replace(/\/+$/, ""); }
  function configured() { return base() !== ""; }
  function enabled() { return configured() && !!(TG && TG.inside); }

  function ApiError(message, status, code) {
    this.name = "ApiError";
    this.message = message;
    this.status = status || 0;
    this.code = code || "network";
  }
  ApiError.prototype = Object.create(Error.prototype);

  function request(method, path, body) {
    if (!enabled()) return Promise.reject(new ApiError("Сервер не подключён", 0, "disabled"));
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, CFG.REQUEST_TIMEOUT_MS || 10000) : null;
    return fetch(base() + path, {
      method: method,
      headers: { "Content-Type": "application/json", "Authorization": "tma " + TG.initData() },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      if (timer) clearTimeout(timer);
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new ApiError(data.error || ("Ошибка сервера " + res.status), res.status, data.code || "http");
        return data;
      });
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw new ApiError(err && err.name === "AbortError" ? "Сервер не ответил вовремя" : "Нет соединения с сервером", 0, "network");
    });
  }

  root.FV_API = {
    configured: configured,
    enabled: enabled,
    subscription: function () { return request("GET", "/api/subscription"); },
    startRound: function () { return request("POST", "/api/round/start"); },
    answer: function (roundId, index, guess) { return request("POST", "/api/round/answer", { roundId: roundId, index: index, guess: guess }); },
    finishRound: function (roundId) { return request("POST", "/api/round/finish", { roundId: roundId }); },
    leaderboard: function () { return request("GET", "/api/leaderboard"); },
    ApiError: ApiError
  };
})(window);
