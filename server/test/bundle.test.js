// Проверка собранного файла dist/worker.js — именно его вставляют в веб-панель Cloudflare.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createMemoryStore } from "./memory-store.js";
import { signInitData } from "../src/telegram-auth.js";

const FILE = new URL("../dist/worker.js", import.meta.url);
const skip = !existsSync(FILE) && "нет dist/worker.js — выполните npm run build";

test("dist/worker.js: один файл без внешних импортов и без секретов", { skip }, () => {
  const src = readFileSync(FILE, "utf8");
  assert.ok(!/^\s*import\s/m.test(src), "нет import — файл самодостаточный");
  assert.ok(/export\s*\{[^}]*default/.test(src), "есть export default");
  assert.ok(!/\d{6,}:[A-Za-z0-9_-]{30,}/.test(src), "в файле нет похожего на токен бота");
});

test("dist/worker.js: /start и рейтинговый раунд работают", { skip }, async () => {
  const worker = (await import(FILE)).default;
  const { handle } = await import(FILE);
  const env = { BOT_TOKEN: "123456:TEST", WEBHOOK_SECRET: "bundle_test_secret_123456", WEBAPP_URL: "https://creator83754504.github.io/face-value/", ALLOWED_ORIGIN: "*" };

  const res = await worker.fetch(new Request("https://x.workers.dev/telegram/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Telegram-Bot-Api-Secret-Token": env.WEBHOOK_SECRET },
    body: JSON.stringify({ update_id: 1, message: { text: "/start", chat: { id: 1, type: "private" }, from: { first_name: "Тест" } } })
  }), env);
  const reply = await res.json();
  assert.equal(reply.method, "sendMessage");
  assert.equal(reply.reply_markup.inline_keyboard[0][0].web_app.url, env.WEBAPP_URL);

  const store = createMemoryStore();
  const auth = "tma " + await signInitData({ user: JSON.stringify({ id: 9, first_name: "Тест" }), auth_date: String(Math.floor(Date.now() / 1000)) }, env.BOT_TOKEN);
  const call = async (method, path, body) => (await handle(new Request("https://x.workers.dev" + path, { method, headers: { Authorization: auth, "Content-Type": "application/json" }, body: body && JSON.stringify(body) }), env, { store })).json();
  const start = await call("POST", "/api/round/start");
  assert.equal(start.questionIds.length, 5);
  for (let i = 0; i < 5; i++) await call("POST", "/api/round/answer", { roundId: start.roundId, index: i, guess: 100 });
  const fin = await call("POST", "/api/round/finish", { roundId: start.roundId });
  assert.ok(fin.total >= 0 && fin.total <= 5000);
});
