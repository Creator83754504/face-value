// Тесты Telegram-бота: /start, проверка секрета webhook, служебные адреса.
import test from "node:test";
import assert from "node:assert/strict";
import { handle } from "../src/index.js";
import { parseCommand, buildReply } from "../src/bot.js";

const SECRET = "test_webhook_secret_0123456789";
const ENV = {
  BOT_TOKEN: "123456:TEST-TOKEN",
  WEBHOOK_SECRET: SECRET,
  WEBAPP_URL: "https://creator83754504.github.io/face-value/",
  ALLOWED_ORIGIN: "https://creator83754504.github.io"
};
const BASE = "https://face-value-api.example.workers.dev";

function update(text, chatType = "private") {
  return { update_id: 1, message: { message_id: 1, date: 1, text, chat: { id: 4242, type: chatType }, from: { id: 4242, first_name: "Анна" } } };
}
async function webhook(body, { secret = SECRET, env = ENV, raw } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (secret !== null) headers["X-Telegram-Bot-Api-Secret-Token"] = secret;
  const res = await handle(new Request(BASE + "/telegram/webhook", { method: "POST", headers, body: raw ?? JSON.stringify(body) }), env);
  return { status: res.status, data: await res.json() };
}

test("parseCommand", () => {
  assert.deepEqual(parseCommand("/start"), { cmd: "start", payload: "" });
  assert.deepEqual(parseCommand("/start@FaceValueGameBot"), { cmd: "start", payload: "" });
  assert.deepEqual(parseCommand("/START promo_tiktok"), { cmd: "start", payload: "promo_tiktok" });
  assert.equal(parseCommand("привет"), null);
  assert.equal(parseCommand(""), null);
});

test("/start → приветствие и кнопка «Играть», открывающая Mini App", async () => {
  const r = await webhook(update("/start"));
  assert.equal(r.status, 200);
  assert.equal(r.data.method, "sendMessage");
  assert.equal(r.data.chat_id, 4242);
  assert.match(r.data.text, /Привет, Анна!/);
  assert.match(r.data.text, /FACE VALUE/);
  const btn = r.data.reply_markup.inline_keyboard[0][0];
  assert.equal(btn.text, "Играть");
  assert.deepEqual(btn.web_app, { url: ENV.WEBAPP_URL });
  assert.ok(!JSON.stringify(r.data).includes(ENV.BOT_TOKEN), "токен не попадает в ответ");
});

test("/start с параметром, /help и обычный текст тоже получают кнопку", async () => {
  for (const t of ["/start ref123", "/help", "/play", "привет"]) {
    const r = await webhook(update(t));
    assert.equal(r.data.method, "sendMessage", t);
    assert.ok(r.data.reply_markup.inline_keyboard[0][0].web_app.url, t);
  }
});

test("webhook без секрета или с чужим секретом — 403, ничего не отправляется", async () => {
  assert.equal((await webhook(update("/start"), { secret: null })).status, 403);
  assert.equal((await webhook(update("/start"), { secret: "wrong_secret_wrong_secret" })).status, 403);
  const get = await handle(new Request(BASE + "/telegram/webhook"), ENV);
  assert.equal(get.status, 405);
});

test("webhook не настроен (нет WEBHOOK_SECRET) — 503", async () => {
  const r = await webhook(update("/start"), { env: { ...ENV, WEBHOOK_SECRET: "" } });
  assert.equal(r.status, 503);
});

test("группы, пустые и битые обновления — 200 без ответа", async () => {
  for (const [body, raw] of [[update("/start", "group")], [{ update_id: 2 }], [null, "{not json"], [{ message: { chat: { id: 1, type: "private" } } }]]) {
    const r = await webhook(body, { raw });
    assert.equal(r.status, 200);
    assert.deepEqual(r.data, { ok: true });
  }
});

test("без WEBAPP_URL бот молчит, а не отправляет сломанную кнопку", () => {
  assert.equal(buildReply(update("/start"), { ...ENV, WEBAPP_URL: "" }), null);
  assert.equal(buildReply(update("/start"), { ...ENV, WEBAPP_URL: "http://insecure" }), null);
});

// ───── Служебные адреса ─────
function fakeTelegram() {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    const method = url.split("/").pop();
    const result = method === "getWebhookInfo"
      ? { url: BASE + "/telegram/webhook", pending_update_count: 0, last_error_message: "Wrong response", last_error_date: 1760000000 }
      : true;
    return new Response(JSON.stringify({ ok: true, result, description: "Webhook was set" }));
  };
  return { calls, fetchImpl };
}
async function admin(action, key, env = ENV, tg = fakeTelegram()) {
  const res = await handle(new Request(`${BASE}/telegram/${action}${key === undefined ? "" : "?key=" + key}`), env, { fetch: tg.fetchImpl });
  return { status: res.status, data: await res.json(), tg };
}

test("setup: без ключа или с неверным ключом — 403, Telegram не вызывается", async () => {
  const tg = fakeTelegram();
  assert.equal((await admin("setup", undefined, ENV, tg)).status, 403);
  assert.equal((await admin("setup", "nope", ENV, tg)).status, 403);
  assert.equal(tg.calls.length, 0);
});

test("setup: подключает webhook с секретом и только на сообщения", async () => {
  const tg = fakeTelegram();
  const r = await admin("setup", SECRET, ENV, tg);
  assert.equal(r.status, 200);
  assert.equal(r.data.ok, true);
  assert.equal(r.data.webhook, BASE + "/telegram/webhook");
  assert.equal(tg.calls.length, 1);
  assert.match(tg.calls[0].url, /\/setWebhook$/);
  assert.deepEqual(tg.calls[0].body, {
    url: BASE + "/telegram/webhook", secret_token: SECRET, allowed_updates: ["message"], drop_pending_updates: true, max_connections: 20
  });
  assert.ok(!JSON.stringify(r.data).includes(ENV.BOT_TOKEN), "токен не показывается в ответе");
});

test("status и disable", async () => {
  const s = await admin("status", SECRET);
  assert.equal(s.data.connected, true);
  assert.equal(s.data.last_error, "Wrong response");
  const d = await admin("disable", SECRET);
  assert.equal(d.data.ok, true);
  assert.match(d.tg.calls[0].url, /\/deleteWebhook$/);
});

test("health показывает, что настроено, но не раскрывает секреты", async () => {
  const res = await handle(new Request(BASE + "/api/health"), ENV);
  const data = await res.json();
  assert.equal(data.botToken, true);
  assert.equal(data.webhookSecret, true);
  assert.equal(data.database, false);
  const text = JSON.stringify(data);
  assert.ok(!text.includes(ENV.BOT_TOKEN) && !text.includes(SECRET));
});

test("рейтинг без подключённой базы — понятная ошибка 503", async () => {
  const res = await handle(new Request(BASE + "/api/leaderboard"), ENV);
  assert.equal(res.status, 503);
  assert.equal((await res.json()).code, "no_database");
});
