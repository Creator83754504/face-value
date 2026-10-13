/*
FACE VALUE — сервер рейтинга.
Проверка подписки обязательна для запуска нового раунда. */ import scoringModule from "../../js/scoring.js"; import dataModule from "../../js/data/questions.js"; import { verifyInitData, AuthError } from "./telegram-auth.js"; import { createGame, GameError } from "./game.js"; import { createD1Store } from "./d1-store.js";
const scoring = scoringModule; const QUESTIONS = dataModule.QUESTIONS.filter( (q) => q.status === "verified" && q.price > 0 );
const CHANNEL_URL = "https://t.me/facevalue_updates";
function cors(env, request) { const allowed = env.ALLOWED_ORIGIN || ""; const origin = request.headers.get("Origin") || ""; const allowOrigin = allowed === "" ? "*" : allowed.split(",").map((s) => s.trim()).includes(origin) ? origin : "null";
return { "Access-Control-Allow-Origin": allowOrigin, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Max-Age": "86400", Vary: "Origin" }; }
function json(data, status, headers) { return new Response(JSON.stringify(data), { status: status || 200, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers } }); }
async function readJson(request) { const text = await request.text(); if (text.length > 2048) { throw new GameError("Слишком большой запрос", 413, "too_large"); } try { return text ? JSON.parse(text) : {}; } catch { throw new GameError("Неверный JSON", 400, "bad_json"); } }
async function authenticate(request, env) { const header = request.headers.get("Authorization") || ""; const match = header.match(/^tma (.+)$/);
if (!match) { throw new AuthError("Нет данных авторизации Telegram", "no_init_data"); }
return verifyInitData(match[1], env.BOT_TOKEN, { maxAgeSec: Number(env.INIT_DATA_MAX_AGE || 86400) }); }
async function isSubscribed(user, env) { if (!env.BOT_TOKEN || !env.REQUIRED_CHANNEL_ID) { throw new GameError( "Проверка подписки не настроена на сервере", 503, "subscription_check_unavailable" ); }
const endpoint = https://api.telegram.org/bot${env.BOT_TOKEN}/getChatMember + ?chat_id=${encodeURIComponent(env.REQUIRED_CHANNEL_ID)} + &user_id=${encodeURIComponent(user.id)};
let response; let data;
try { response = await fetch(endpoint); data = await response.json(); } catch { throw new GameError( "Не удалось проверить подписку. Попробуй ещё раз.", 503, "subscription_check_unavailable" ); }
if (!response.ok  !data.ok  !data.result) { console.error("Telegram subscription check failed:", data?.description || response.status); throw new GameError( "Не удалось проверить подписку. Попробуй позже.", 503, "subscription_check_unavailable" ); }
const member = data.result;
return ( member.status === "creator"  member.status === "administrator"  member.status === "member" || (member.status === "restricted" && member.is_member === true) ); }
export async function handle(request, env, deps = {}) { const headers = cors(env, request);
if (request.method === "OPTIONS") { return new Response(null, { status: 204, headers }); }
const url = new URL(request.url); const path = url.pathname.replace(//+$/, "");
try { if (path === "/api/health" && request.method === "GET") { return json({ ok: true, questions: QUESTIONS.length }, 200, headers); }
const user = await authenticate(request, env);

if (path === "/api/subscription" && request.method === "GET") {
  const subscribed = await isSubscribed(user, env);
  return json(
    { subscribed, channelUrl: CHANNEL_URL },
    200,
    headers
  );
}

const store = deps.store || createD1Store(env.DB);
const game = createGame({
  store,
  scoring,
  questions: deps.questions || QUESTIONS,
  now: deps.now,
  random: deps.random
});

if (path === "/api/round/start" && request.method === "POST") {
  const subscribed = await isSubscribed(user, env);

  if (!subscribed) {
    return json(
      {
        error: "Чтобы играть, подпишись на канал обновлений FACE VALUE.",
        code: "subscription_required",
        channelUrl: CHANNEL_URL
      },
      403,
      headers
    );
  }

  return json(await game.
              startRound(user), 200, headers);
}

if (path === "/api/round/answer" && request.method === "POST") {
  const body = await readJson(request);
  return json(
    await game.answer(user, {
      roundId: body.roundId,
      index: body.index,
      guess: body.guess
    }),
    200,
    headers
  );
}

if (path === "/api/round/finish" && request.method === "POST") {
  const body = await readJson(request);
  return json(
    await game.finishRound(user, { roundId: body.roundId }),
    200,
    headers
  );
}

if (path === "/api/leaderboard" && request.method === "GET") {
  return json(await game.leaderboard(user), 200, headers);
}

return json({ error: "Не найдено", code: "not_found" }, 404, headers);
} catch (err) { if (err instanceof AuthError || err instanceof GameError) { return json({ error: err.message, code: err.code }, err.status, headers); }
console.error(err);
return json(
  { error: "Внутренняя ошибка сервера", code: "internal" },
  500,
  headers
);
} }
export default { fetch: (request, env) => handle(request, env) };
