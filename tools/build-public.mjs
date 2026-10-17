#!/usr/bin/env node
/*
 * FACE VALUE — сборка публичной версии для РЕЙТИНГОВОГО режима.
 *
 *   node tools/build-public.mjs --api https://face-value-api.<имя>.workers.dev
 *
 * Создаёт папку dist/ — её и нужно публиковать (например, на GitHub Pages),
 * когда подключён сервер рейтинга. Отличия от обычной версии:
 *   • из js/data/questions.js удалены цены и пояснения — их знает только сервер,
 *     поэтому подсмотреть правильный ответ в коде страницы нельзя;
 *   • в js/config.js прописан адрес сервера;
 *   • играть можно только внутри Telegram (сервер проверяет подпись initData).
 *
 * Обычная версия (index.html в корне проекта) не меняется и работает локально как раньше.
 */
import { createRequire } from "node:module";
import { cp, mkdir, rm, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

const apiIdx = process.argv.indexOf("--api");
const API = apiIdx > -1 ? process.argv[apiIdx + 1] : "";
if (!API || !/^https:\/\//.test(API)) {
  console.error("Укажите адрес сервера: node tools/build-public.mjs --api https://...");
  process.exit(1);
}

const data = require(path.join(ROOT, "js", "data", "questions.js"));

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
for (const p of ["index.html", "css", "js", "assets"]) {
  await cp(path.join(ROOT, p), path.join(DIST, p), { recursive: true });
}

const publicQuestions = data.QUESTIONS.map(({ price, note, ...rest }) => rest);
const js = `/* FACE VALUE — публичная сборка: цены и пояснения хранятся только на сервере. */
(function (root) {
  root.FV_DATA = ${JSON.stringify({ PUBLIC_BUILD: true, CATEGORIES: data.CATEGORIES, REGIONS: data.REGIONS, QUESTIONS: publicQuestions, PENDING: [] }, null, 2)};
})(window);
`;
await writeFile(path.join(DIST, "js", "data", "questions.js"), js);

const cfgPath = path.join(DIST, "js", "config.js");
const cfg = await readFile(cfgPath, "utf8");
await writeFile(cfgPath, cfg.replace(/API_BASE:\s*"[^"]*"/, `API_BASE: ${JSON.stringify(API.replace(/\/+$/, ""))}`));

const leaked = (await readFile(path.join(DIST, "js", "data", "questions.js"), "utf8")).match(/"price"\s*:/);
if (leaked) { console.error("Ошибка: цены остались в публичной сборке"); process.exit(1); }
console.log(`Готово: dist/ (вопросов: ${publicQuestions.length}, сервер: ${API})`);
