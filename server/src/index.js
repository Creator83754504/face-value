/*
 * FACE VALUE — сервер рейтинга (Cloudflare Worker).
 *
 * Эндпоинты (все, кроме /api/health, требуют заголовок "Authorization: tma <initData>"):
 *   GET  /api/health          — проверка, что сервер жив
 *   POST /api/round/start     — начать рейтинговый раунд → { roundId, questionIds, expiresAt }
 *   POST /api/round/answer    — { roundId, index, guess } → { price, points, total }
 *   POST /api/round/finish    — { roundId } → { total, best, newBest }
 *   GET  /api/leaderboard     — { top: [{ name, best, isMe }], me: { best, position } | null }
 *
 * Секреты: BOT_TOKEN задаётся через `wrangler secret put BOT_TOKEN` и никогда не попадает в клиент.
 */
import scoringModule from "../../js/scoring.js";
import dataModule from "../../js/data/questions.js";
import { verifyInitData, AuthError } from "./telegram-auth.js";
import { createGame, GameError } from "./game.js";
import { createD1Store } from "./d1-store.js";

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
  const headers = cors(env, request);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");
  try {
    if (path === "/api/health" && request.method === "GET") {
      return json({ ok: true, questions: QUESTIONS.length }, 200, headers);
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
