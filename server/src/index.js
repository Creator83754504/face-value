/*
 * FACE VALUE — сервер рейтинга (Cloudflare Worker).
 *
 * Эндпоинты (все, кроме /api/health, требуют заголовок "Authorization: tma <initData>"):
 *   GET  /api/health          — проверка, что сервер жив
 *   POST /api/round/start     — начать рейтинговый раунд → { roundId, questionIds, expiresAt }
 *   POST /api/round/answer    — { roundId, index, guess } → { price, points, total }
 *   POST /api/round/finish    — { roundId } → { total, best, newBest }
 *   GET  /api/leaderboard     — { top: [{ name, best, isMe, cosmetics? }], me: { best, position } | null }
 *   GET  /api/profile         — { rewards: [{ id, earnedAt }], selected: { prefix, banner }, custom }
 *   POST /api/profile/cosmetics — { prefix, banner } (id полученной награды или null) → профиль
 *
 * Telegram-бот (см. bot.js):
 *   POST /telegram/webhook    — сообщения от Telegram (/start → приветствие и кнопка «Играть»)
 *   GET  /telegram/setup|status|disable?key=<WEBHOOK_SECRET> — подключение webhook
 *
 * Секреты BOT_TOKEN и WEBHOOK_SECRET хранятся только в секретах Cloudflare и никогда не попадают в клиент или код.
 */
import scoringModule from "../../js/scoring.js";
import dataModule from "../../js/data/questions.js";
import { verifyInitData, AuthError } from "./telegram-auth.js";
import { createGame, GameError } from "./game.js";
import { createD1Store } from "./d1-store.js";
import { handleWebhook, handleAdmin } from "./bot.js";

const scoring = scoringModule;
const QUESTIONS = dataModule.QUESTIONS.filter((q) => q.status === "verified" && q.price > 0);

function cors(env, request) {
  const allowed = env.ALLOWED_ORIGIN || "*";
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = allowed === "*" ? "*" : (allowed.split(",").map((s) => s.trim()).includes(origin) ? origin : "null");
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers }
  });
}

async function readJson(request) {
  const text = await request.text();
  if (text.length > 2048) throw new GameError("Слишком большой запрос", 413, "too_large");
  try { return text ? JSON.parse(text) : {}; } catch { throw new GameError("Неверный JSON", 400, "bad_json"); }
}

async function authenticate(request, env) {
  const header = request.headers.get("Authorization") || "";
  const m = header.match(/^tma (.+)$/);
  if (!m) throw new AuthError("Нет данных авторизации Telegram", "no_init_data");
  return verifyInitData(m[1], env.BOT_TOKEN, { maxAgeSec: Number(env.INIT_DATA_MAX_AGE || 86400) });
}

export async function handle(request, env, deps = {}) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");

  // Telegram-бот: свои адреса, без CORS (их вызывает Telegram или вы из браузера)
  if (path.startsWith("/telegram/")) {
    try {
      if (path === "/telegram/webhook") return await handleWebhook(request, env);
      const action = path.slice("/telegram/".length);
      if (["setup", "status", "disable"].includes(action)) return await handleAdmin(request, env, action, deps.fetch);
      return json({ error: "Не найдено", code: "not_found" }, 404);
    } catch (err) {
      console.error(err);
      // Для webhook всегда 200, чтобы Telegram не повторял одно и то же сообщение бесконечно
      return path === "/telegram/webhook" ? json({ ok: true }, 200) : json({ error: "Внутренняя ошибка сервера" }, 500);
    }
  }

  const headers = cors(env, request);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });

  try {
    if (path === "/api/health" && request.method === "GET") {
      return json({
        ok: true,
        questions: QUESTIONS.length,
        // Только «настроено / не настроено» — сами значения секретов никогда не показываются
        database: !!env.DB,
        botToken: !!env.BOT_TOKEN,
        webhookSecret: !!env.WEBHOOK_SECRET,
        webAppUrl: env.WEBAPP_URL || null
      }, 200, headers);
    }

    if (!deps.store && !env.DB) {
      return json({ error: "База данных не подключена к серверу", code: "no_database" }, 503, headers);
    }
    const store = deps.store || createD1Store(env.DB);
    const game = createGame({ store, scoring, questions: deps.questions || QUESTIONS, now: deps.now, random: deps.random });
    const user = await authenticate(request, env);

    if (path === "/api/round/start" && request.method === "POST") {
      return json(await game.startRound(user), 200, headers);
    }
    if (path === "/api/round/answer" && request.method === "POST") {
      const body = await readJson(request);
      return json(await game.answer(user, { roundId: body.roundId, index: body.index, guess: body.guess }), 200, headers);
    }
    if (path === "/api/round/finish" && request.method === "POST") {
      const body = await readJson(request);
      return json(await game.finishRound(user, { roundId: body.roundId }), 200, headers);
    }
    if (path === "/api/profile" && request.method === "GET") {
      return json(await game.profile(user), 200, headers);
    }
    if (path === "/api/profile/cosmetics" && request.method === "POST") {
      const body = await readJson(request);
      return json(await game.setCosmetics(user, body), 200, headers);
    }
    if (path === "/api/leaderboard" && request.method === "GET") {
      return json(await game.leaderboard(user), 200, headers);
    }
    return json({ error: "Не найдено", code: "not_found" }, 404, headers);
  } catch (err) {
    if (err instanceof AuthError || err instanceof GameError) {
      return json({ error: err.message, code: err.code }, err.status, headers);
    }
    console.error(err);
    return json({ error: "Внутренняя ошибка сервера", code: "internal" }, 500, headers);
  }
}

export default { fetch: (request, env) => handle(request, env) };
