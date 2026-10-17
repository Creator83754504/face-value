/*
 * FACE VALUE — Telegram-бот: команда /start и подключение webhook.
 *
 * Как это работает:
 *   Telegram присылает каждое сообщение боту POST-запросом на  /telegram/webhook.
 *   Мы проверяем секретный заголовок X-Telegram-Bot-Api-Secret-Token (его знают только
 *   Telegram и наш сервер), а ответ отправляем прямо в теле ответа на webhook —
 *   так Telegram сам доставит сообщение, и токен бота для этого даже не нужен.
 *
 * Служебные адреса (защищены ключом ?key=<WEBHOOK_SECRET>):
 *   GET /telegram/setup    — один раз подключить webhook (сервер сам вызывает setWebhook)
 *   GET /telegram/status   — посмотреть, подключён ли webhook и были ли ошибки
 *   GET /telegram/disable  — отключить webhook (откат)
 *
 * Нужные настройки Cloudflare:
 *   BOT_TOKEN       — секрет, токен от @BotFather
 *   WEBHOOK_SECRET  — секрет, случайная строка из латинских букв и цифр (16–256 символов)
 *   WEBAPP_URL      — переменная, адрес игры: https://creator83754504.github.io/face-value/
 */

const TG_API = "https://api.telegram.org";
const MAX_UPDATE_BYTES = 64 * 1024;

export const TEXTS = {
  start: (name) =>
    `${name ? `Привет, ${name}!` : "Привет!"} Это FACE VALUE — игра, где нужно угадывать реальные цены товаров.\n\n` +
    "5 вопросов в раунде, до 1000 очков за каждый ответ. Чем точнее — тем больше очков.\n\n" +
    "Нажми «Играть», чтобы начать.",
  help:
    "Как играть: смотришь на товар, вводишь цену в долларах — получаешь очки за точность. " +
    "Все цены официальные, с источником и датой проверки.\n\nНажми «Играть», чтобы открыть игру.",
  other: "Чтобы начать игру, нажми «Играть».",
  button: "Играть"
};

/** Сравнение строк без утечки времени. */
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export function isValidSecret(s) {
  return typeof s === "string" && /^[A-Za-z0-9_-]{16,256}$/.test(s);
}

function webAppUrl(env) {
  const u = String(env.WEBAPP_URL || "");
  return /^https:\/\/[^\s]+$/.test(u) ? u : null;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

/** "/start", "/start@FaceValueGameBot payload" → { cmd: "start", payload: "payload" } */
export function parseCommand(text) {
  const m = /^\/([a-z0-9_]+)(?:@[A-Za-z0-9_]+)?(?:\s+([\s\S]*))?$/i.exec(String(text || "").trim());
  return m ? { cmd: m[1].toLowerCase(), payload: (m[2] || "").trim() } : null;
}

/** Строит ответ бота на одно обновление Telegram. null — ничего не отвечать. */
export function buildReply(update, env) {
  const msg = update && update.message;
  if (!msg || !msg.chat || typeof msg.text !== "string") return null;
  // Кнопки web_app в сообщениях работают только в личных чатах с ботом
  if (msg.chat.type !== "private") return null;
  const url = webAppUrl(env);
  if (!url) return null;

  const command = parseCommand(msg.text);
  const name = msg.from && typeof msg.from.first_name === "string" ? msg.from.first_name.slice(0, 64) : "";
  let text;
  if (command && (command.cmd === "start" || command.cmd === "play")) text = TEXTS.start(name);
  else if (command && command.cmd === "help") text = TEXTS.help;
  else text = TEXTS.other;

  return {
    method: "sendMessage",
    chat_id: msg.chat.id,
    text,
    reply_markup: { inline_keyboard: [[{ text: TEXTS.button, web_app: { url } }]] }
  };
}

/** POST /telegram/webhook */
export async function handleWebhook(request, env) {
  if (request.method !== "POST") return jsonResponse({ error: "method not allowed" }, 405);
  if (!isValidSecret(env.WEBHOOK_SECRET)) return jsonResponse({ error: "webhook is not configured" }, 503);
  const got = request.headers.get("X-Telegram-Bot-Api-Secret-Token") || "";
  if (!safeEqual(got, env.WEBHOOK_SECRET)) return jsonResponse({ error: "forbidden" }, 403);

  const raw = await request.text();
  if (raw.length > MAX_UPDATE_BYTES) return jsonResponse({ ok: true }); // слишком большое — молча игнорируем
  let update;
  try { update = JSON.parse(raw); } catch { return jsonResponse({ ok: true }); }

  const reply = buildReply(update, env);
  // Ответ 200 обязателен, иначе Telegram будет присылать то же обновление снова
  return reply ? jsonResponse(reply) : jsonResponse({ ok: true });
}

async function callTelegram(env, method, body, fetchImpl) {
  const res = await fetchImpl(`${TG_API}/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {})
  });
  let data = {};
  try { data = await res.json(); } catch { /* пусто */ }
  // Возвращаем только безопасные поля — без токена и адресов с токеном
  return { ok: !!data.ok, description: data.description || null, result: data.result };
}

/** GET /telegram/setup | /telegram/status | /telegram/disable  (нужен ?key=WEBHOOK_SECRET) */
export async function handleAdmin(request, env, action, fetchImpl = fetch) {
  if (request.method !== "GET") return jsonResponse({ error: "method not allowed" }, 405);
  if (!isValidSecret(env.WEBHOOK_SECRET)) {
    return jsonResponse({ ok: false, error: "Не задан секрет WEBHOOK_SECRET (16–256 символов: латиница, цифры, _ и -)" }, 503);
  }
  const key = new URL(request.url).searchParams.get("key") || "";
  if (!safeEqual(key, env.WEBHOOK_SECRET)) return jsonResponse({ ok: false, error: "forbidden" }, 403);
  if (!env.BOT_TOKEN) return jsonResponse({ ok: false, error: "Не задан секрет BOT_TOKEN" }, 503);

  if (action === "setup") {
    if (!webAppUrl(env)) return jsonResponse({ ok: false, error: "Не задана переменная WEBAPP_URL (https://…)" }, 503);
    const hookUrl = new URL("/telegram/webhook", request.url).href;
    if (!hookUrl.startsWith("https://")) return jsonResponse({ ok: false, error: "Webhook должен быть на https" }, 400);
    const r = await callTelegram(env, "setWebhook", {
      url: hookUrl,
      secret_token: env.WEBHOOK_SECRET,
      allowed_updates: ["message"],
      drop_pending_updates: true,
      max_connections: 20
    }, fetchImpl);
    return jsonResponse({ ok: r.ok, webhook: hookUrl, telegram: r.description }, r.ok ? 200 : 502);
  }
  if (action === "status") {
    const r = await callTelegram(env, "getWebhookInfo", {}, fetchImpl);
    const i = r.result || {};
    return jsonResponse({
      ok: r.ok,
      connected: !!i.url,
      webhook: i.url || null,
      pending_updates: i.pending_update_count || 0,
      last_error: i.last_error_message || null,
      last_error_at: i.last_error_date ? new Date(i.last_error_date * 1000).toISOString() : null
    }, r.ok ? 200 : 502);
  }
  if (action === "disable") {
    const r = await callTelegram(env, "deleteWebhook", { drop_pending_updates: false }, fetchImpl);
    return jsonResponse({ ok: r.ok, telegram: r.description }, r.ok ? 200 : 502);
  }
  return jsonResponse({ error: "not found" }, 404);
}
