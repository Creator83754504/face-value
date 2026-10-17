#!/usr/bin/env node
/*
 * FACE VALUE — ЛОКАЛЬНЫЙ стенд для проверки рейтинга и наград. Только для вашего компьютера.
 *
 *   node tools/dev-server.mjs            — открыть http://localhost:8787
 *   node tools/dev-server.mjs --demo     — то же + демо-игроки (сыграны настоящим серверным кодом)
 *   node tools/dev-server.mjs --demo --demo-all — плюс по игроку на каждую из 20 наград
 *   node tools/dev-server.mjs --reward-pool    — раунды только из вопросов с наградами (проверка уведомления)
 *   node tools/dev-server.mjs --reward-pool legendary — только из 6 LEGENDARY-вопросов
 *   node tools/dev-server.mjs --reset    — удалить локальную базу и начать с нуля
 *   node tools/dev-server.mjs --port 9000
 *
 * Что здесь происходит:
 *   • Сервер — тот самый собранный файл server/dist/worker.js, который вставляется в Cloudflare.
 *   • База — локальный файл SQLite (dev-data/face-value-dev.sqlite) вместо Cloudflare D1.
 *     С реальной базой D1 стенд НЕ соединяется. Данные сохраняются между перезапусками.
 *   • Вход «как в Telegram»: стенд при каждом запуске придумывает СЛУЧАЙНЫЙ тестовый токен
 *     (не токен вашего бота!) и подписывает им initData для тестового игрока. Сервер проверяет
 *     подпись тем же кодом, что и в Telegram. Эта подмена есть только в ответах этого стенда,
 *     файлы игры не меняются.
 *
 * Нужен Node.js 22+ (встроенный node:sqlite). Ничего устанавливать не нужно.
 */
import http from "node:http";
import { readFile, mkdir, rm, stat } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// Обёртка SQLite с тем же API, что у Cloudflare D1 (включая batch = транзакция) — общая с тестами сервера
const { d1 } = await import(new URL("../server/test/sqlite-d1.js", import.meta.url).href);
const { DatabaseSync } = require("node:sqlite");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = process.env.FV_DEV_DATA ? path.resolve(process.env.FV_DEV_DATA) : path.join(ROOT, "dev-data");
const DB_FILE = path.join(DATA_DIR, "face-value-dev.sqlite");

const arg = (n) => process.argv.includes(n);
const portIdx = process.argv.indexOf("--port");
const PORT = portIdx > -1 ? Number(process.argv[portIdx + 1]) : 8787;

// ───── База: локальный SQLite с обёрткой, повторяющей API Cloudflare D1 ─────
if (arg("--reset")) await rm(DATA_DIR, { recursive: true, force: true });
await mkdir(DATA_DIR, { recursive: true });
const db = new DatabaseSync(DB_FILE);
db.exec(readFileSync(path.join(ROOT, "server", "schema.sql"), "utf8")); // CREATE TABLE IF NOT EXISTS — данные не теряются

// ───── Сервер: собранный worker.js ─────
const worker = await import(pathToFileURL(path.join(ROOT, "server", "dist", "worker.js")).href);
const { signInitData } = await import(pathToFileURL(path.join(ROOT, "server", "src", "telegram-auth.js")).href);
const DEV_TOKEN = "0:DEV-" + crypto.randomBytes(18).toString("hex"); // случайный, не настоящий токен
const ENV = { DB: d1(db), BOT_TOKEN: DEV_TOKEN, ALLOWED_ORIGIN: "*", WEBAPP_URL: `http://localhost:${PORT}/` };

const DEV_USER = { id: 900001, first_name: "Виктория", last_name: "Суетина" };
async function initDataFor(user) {
  return signInitData({ query_id: "DEV", user: JSON.stringify(user), auth_date: String(Math.floor(Date.now() / 1000)) }, DEV_TOKEN);
}

// ───── Демо-игроки: играют НАСТОЯЩИЕ раунды через HTTP-API сервера ─────
// Чтобы нужные вопросы точно попали в раунд, демо-раунды идут через game.js с маленьким
// набором вопросов — сам подсчёт очков, завершение и выдача наград те же, что в игре.
async function seedDemo() {
  const { createGame } = await import(pathToFileURL(path.join(ROOT, "server", "src", "game.js")).href);
  const { createD1Store } = await import(pathToFileURL(path.join(ROOT, "server", "src", "d1-store.js")).href);
  const scoring = require(path.join(ROOT, "js", "scoring.js"));
  const { QUESTIONS } = require(path.join(ROOT, "js", "data", "questions.js"));
  const byId = (id) => QUESTIONS.find((q) => q.id === id);
  const POOL = ["rolex-daytona-steel", "car-mercedes-300-slr-uhlenhaut", "iphone-18-pro", "airtag", "lego-titanic"].map(byId);
  const game = createGame({ store: createD1Store(d1(db)), scoring, questions: POOL });
  const players = [
    // [пользователь, во сколько раз ошибиться на Daytona, на 300 SLR, на остальных]
    [{ id: 900001, firstName: "Виктория", lastName: "Суетина" }, 1.00, 1.01, 1.03],  // обе награды
    [{ id: 900002, firstName: "Александр-Максимилиан", lastName: "Константинопольский" }, 1.05, 1.6, 1.02], // только «Космограф», длинный ник
    [{ id: 900003, firstName: "Марк", lastName: "Д" }, 1.3, 1.03, 1.15],              // только баннер
    [{ id: 900004, firstName: "Ольга", lastName: "" }, 1.2, 1.4, 1.05],               // без наград
    [{ id: 900005, firstName: "Игорь", lastName: "П" }, 1.5, 1.8, 1.3]                // без наград
  ];
  for (const [user, kDay, kSlr, kOther] of players) {
    const r = await game.startRound(user);
    for (let i = 0; i < r.questionIds.length; i++) {
      const id = r.questionIds[i];
      const k = id === "rolex-daytona-steel" ? kDay : id === "car-mercedes-300-slr-uhlenhaut" ? kSlr : kOther;
      await game.answer(user, { roundId: r.roundId, index: i, guess: byId(id).price * k });
    }
    const fin = await game.finishRound(user, { roundId: r.roundId });
    console.log(`  демо: ${user.firstName} — ${fin.total} очков, новые награды: ${(fin.rewards || []).join(", ") || "нет"}`);
  }
  // --demo-all: ещё по одному игроку на КАЖДУЮ из 20 наград — чтобы увидеть все префиксы и баннеры в рейтинге.
  // Каждый играет настоящий раунд, где вопрос награды отвечен точно, остальные — с ошибкой.
  if (arg("--demo-all")) {
    const RW = require(path.join(ROOT, "js", "rewards-config.js"));
    const NAMES = ["Алиса К.", "Борис Н.", "Вера Л.", "Глеб С.", "Дарья М.", "Егор Т.", "Жанна Р.", "Захар В.", "Инна Б.", "Кирилл Ф.",
      "Лада Г.", "Максим Ю.", "Нина Ц.", "Олег Ш.", "Полина Э.", "Роман Я.", "Софья Е.", "Тимур Ч.", "Ульяна Щ.", "Фёдор Х."];
    const FILLERS = ["iphone-18-pro", "airtag", "lego-titanic", "ps5-pro"].map(byId);
    const entries = Object.entries(RW.REWARDS);
    for (let n = 0; n < entries.length; n++) {
      const [rewardId, def] = entries[n];
      const q = byId(def.questionId);
      const g = createGame({ store: createD1Store(d1(db)), scoring, questions: [q, ...FILLERS] });
      const [first, last] = NAMES[n].split(" ");
      const user = { id: 910001 + n, firstName: first, lastName: last.replace(".", "") };
      const r = await g.startRound(user);
      for (let i = 0; i < r.questionIds.length; i++) {
        const id = r.questionIds[i];
        await g.answer(user, { roundId: r.roundId, index: i, guess: byId(id).price * (id === q.id ? 1 : 1.12 + n * 0.02) });
      }
      const fin = await g.finishRound(user, { roundId: r.roundId });
      console.log(`  демо: ${NAMES[n]} — ${fin.total} очков, награда: ${(fin.rewards || []).join(", ") || "нет"} (${def.label})`);
    }
  }
}
if (arg("--demo")) await seedDemo();

// --reward-pool: раунды стенда составляются только из 20 вопросов с наградами — чтобы вручную
// проверить получение награды и уведомление. Только для локальной проверки; выдача — тем же серверным кодом.
const DEPS = {};
if (arg("--reward-pool")) {
  const RW = require(path.join(ROOT, "js", "rewards-config.js"));
  const { QUESTIONS } = require(path.join(ROOT, "js", "data", "questions.js"));
  const onlyLegendary = process.argv[process.argv.indexOf("--reward-pool") + 1] === "legendary";
  const ids = new Set(Object.values(RW.REWARDS).filter((r) => !onlyLegendary || r.tier === "LEGENDARY").map((r) => r.questionId));
  DEPS.questions = QUESTIONS.filter((q) => ids.has(q.id) && q.status === "verified" && q.price > 0);
  console.log(`Режим --reward-pool: в раундах только ${DEPS.questions.length} вопросов с наградами`);
}

// ───── Статические файлы + подмена config.js и заглушки Telegram ─────
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".json": "application/json", ".webp": "image/webp" };

async function serveIndex(res) {
  let html = await readFile(path.join(ROOT, "index.html"), "utf8");
  const initData = await initDataFor(DEV_USER);
  const stub = `<script>/* ЛОКАЛЬНЫЙ СТЕНД: имитация Telegram с тестовой подписью */
window.Telegram = { WebApp: { initData: ${JSON.stringify(initData)}, initDataUnsafe: { user: ${JSON.stringify(DEV_USER)} },
  platform: "dev", isVersionAtLeast: function () { return false; }, ready: function () {}, expand: function () {} } };</script>`;
  html = html.replace(/<script src="https:\/\/telegram\.org\/js\/telegram-web-app\.js[^"]*"><\/script>/, stub);
  res.writeHead(200, { "Content-Type": TYPES[".html"], "Cache-Control": "no-store" });
  res.end(html);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname.startsWith("/api/")) {
      const body = req.method === "GET" || req.method === "HEAD" ? undefined : await new Promise((ok) => {
        const chunks = []; req.on("data", (c) => chunks.push(c)); req.on("end", () => ok(Buffer.concat(chunks)));
      });
      const r = await worker.handle(new Request(url, { method: req.method, headers: req.headers, body }), ENV, DEPS);
      res.writeHead(r.status, Object.fromEntries(r.headers));
      res.end(Buffer.from(await r.arrayBuffer()));
      return;
    }
    if (url.pathname === "/" || url.pathname === "/index.html") return await serveIndex(res);
    if (url.pathname === "/js/config.js") {
      res.writeHead(200, { "Content-Type": TYPES[".js"], "Cache-Control": "no-store" });
      res.end(`window.FV_CONFIG = { API_BASE: "http://localhost:${PORT}", ROUND_SIZE: 5, REQUEST_TIMEOUT_MS: 10000 };`);
      return;
    }
    const file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)));
    if (!file.startsWith(ROOT + path.sep) || file.includes(`${path.sep}dev-data${path.sep}`)) { res.writeHead(403); res.end(); return; }
    if (!(await stat(file).catch(() => null))?.isFile()) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(await readFile(file));
  } catch (err) {
    console.error(err);
    res.writeHead(500); res.end("dev server error");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`\nFACE VALUE — локальный стенд: http://localhost:${PORT}`);
  console.log(`База: ${path.relative(ROOT, DB_FILE)} (локальный SQLite, НЕ Cloudflare D1)`);
  console.log("Тестовый игрок: Виктория С. Подпись Telegram — случайный тестовый токен этого запуска.");
  console.log("Остановить: Ctrl + C\n");
});
