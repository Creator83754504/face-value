#!/usr/bin/env node
/*
 * FACE VALUE — скачивание официальных фото товаров в assets/products/.
 *
 * Запуск (из папки проекта, нужен Node.js 18+):
 *   node tools/download-images.mjs            — скачать недостающие фото
 *   node tools/download-images.mjs --force    — перекачать все
 *   node tools/download-images.mjs --only iphone-air,ps5-pro
 *
 * Что делает:
 *   1) берёт ссылку image.remote каждого вопроса из js/data/questions.js
 *      (это фото с официальной страницы товара, где проверена цена);
 *   2) скачивает и проверяет, что это действительно картинка (по сигнатуре файла);
 *   3) сохраняет как assets/products/<id>.<jpg|png|webp|avif>;
 *   4) записывает assets/products/manifest.js — игра автоматически берёт локальные файлы;
 *   5) печатает отчёт и сохраняет его в assets/products/report.json.
 *
 * Права на фото принадлежат брендам. Перед публичным/коммерческим запуском
 * убедитесь, что использование этих изображений разрешено (см. README).
 */
import { createRequire } from "node:module";
import { mkdir, writeFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "assets", "products");
const { QUESTIONS } = require(path.join(ROOT, "js", "data", "questions.js"));

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const onlyArg = args.find((a) => a.startsWith("--only"));
const ONLY = onlyArg ? (onlyArg.split("=")[1] || args[args.indexOf(onlyArg) + 1] || "").split(",").filter(Boolean) : null;
const CONCURRENCY = 5;
const TIMEOUT_MS = 25000;
const MIN_BYTES = 2000;

function detectType(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buf.toString("ascii", 4, 8) === "ftyp" && /avif|avis/.test(buf.toString("ascii", 8, 12))) return "avif";
  if (buf.toString("ascii", 0, 3) === "GIF") return "gif";
  return null;
}

async function existingFile(id) {
  const files = await readdir(OUT_DIR).catch(() => []);
  const f = files.find((n) => n.startsWith(id + ".") && /\.(jpg|png|webp|avif|gif)$/.test(n));
  if (!f) return null;
  const s = await stat(path.join(OUT_DIR, f));
  return s.size >= MIN_BYTES ? f : null;
}

async function download(q) {
  const url = q.image && q.image.remote;
  if (!url) return { id: q.id, ok: false, reason: "нет ссылки на фото" };
  if (!FORCE) {
    const have = await existingFile(q.id);
    if (have) return { id: q.id, ok: true, file: have, skipped: true };
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
        "Accept": "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8,*/*;q=0.5"
      }
    });
    if (!res.ok) return { id: q.id, ok: false, reason: `HTTP ${res.status}`, url };
    const buf = Buffer.from(await res.arrayBuffer());
    const type = detectType(buf);
    if (!type) return { id: q.id, ok: false, reason: `не картинка (${res.headers.get("content-type") || "?"})`, url };
    if (buf.length < MIN_BYTES) return { id: q.id, ok: false, reason: `слишком маленький файл (${buf.length} байт)`, url };
    const file = `${q.id}.${type}`;
    await writeFile(path.join(OUT_DIR, file), buf);
    return { id: q.id, ok: true, file, bytes: buf.length };
  } catch (e) {
    return { id: q.id, ok: false, reason: e.name === "AbortError" ? "таймаут" : (e.cause && e.cause.code) || e.message, url };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const list = ONLY ? QUESTIONS.filter((q) => ONLY.includes(q.id)) : QUESTIONS;
  console.log(`Фото к скачиванию: ${list.length}. Это может занять 1–2 минуты…\n`);
  const results = [];
  let i = 0;
  async function worker() {
    while (i < list.length) {
      const q = list[i++];
      const r = await download(q);
      results.push(r);
      const mark = r.ok ? (r.skipped ? "·" : "✓") : "✗";
      console.log(`${mark} ${q.id}${r.ok ? "" : "  — " + r.reason}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // Манифест: все локальные файлы, которые реально есть на диске
  const manifest = {};
  for (const q of QUESTIONS) {
    const f = await existingFile(q.id);
    if (f) manifest[q.id] = `assets/products/${f}`;
  }
  const js = `/*\n * Список скачанных локальных фото товаров.\n * Файл перезаписывается командой: node tools/download-images.mjs\n * Создан: ${new Date().toISOString()}\n */\nwindow.FV_IMAGES = ${JSON.stringify(manifest, null, 2)};\n`;
  await writeFile(path.join(OUT_DIR, "manifest.js"), js);

  const failed = results.filter((r) => !r.ok);
  await writeFile(path.join(OUT_DIR, "report.json"), JSON.stringify({ createdAt: new Date().toISOString(), total: QUESTIONS.length, local: Object.keys(manifest).length, failed }, null, 2));

  console.log(`\nГотово. Локальных фото: ${Object.keys(manifest).length} из ${QUESTIONS.length}.`);
  if (failed.length) {
    console.log(`Не скачались (${failed.length}) — для них игра попробует официальную ссылку, а если и она не откроется, покажет «Фото недоступно»:`);
    failed.forEach((f) => console.log(`  • ${f.id}: ${f.reason}`));
  }
  console.log("Отчёт: assets/products/report.json");
}

main().catch((e) => { console.error(e); process.exit(1); });
