#!/usr/bin/env node
/*
 * Браузерная проверка: оформление LEGENDARY-вопросов, уведомление о награде, профиль и выбор оформления.
 *
 *   node tests/browser/profile.browser.mjs
 *
 * Нужен Playwright (или переменная PLAYWRIGHT_PATH). Запускает tools/dev-server.mjs во временной папке
 * в режиме --reward-pool legendary: каждый раунд — только из 6 LEGENDARY-вопросов, выдача наград —
 * настоящим серверным кодом. Ваша локальная база dev-data не трогается.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const RW = require(path.join(ROOT, "js/rewards-config.js"));
const pwMod = await import(process.env.PLAYWRIGHT_PATH ? pathToFileURL(process.env.PLAYWRIGHT_PATH).href : "playwright");
const { chromium, devices } = pwMod.default || pwMod;
const PORT = 8798;
const DATA = mkdtempSync(path.join(tmpdir(), "fv-pf-"));
let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? "ok  " : "FAIL"} - ${msg}`); if (!cond) failures++; };

function startServer(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [path.join(ROOT, "tools/dev-server.mjs"), "--port", String(PORT), ...args], { env: { ...process.env, FV_DEV_DATA: DATA } });
    let out = "";
    p.stdout.on("data", (d) => { out += d; if (out.includes("локальный стенд")) resolve(p); });
    p.on("exit", (c) => reject(new Error("dev-server exited " + c + "\n" + out)));
  });
}
const stop = (p) => new Promise((r) => { p.removeAllListeners("exit"); p.on("exit", r); p.kill(); });

const browser = await chromium.launch();
const errors = [];
async function open({ apiOff = false, ...opts } = {}) {
  const ctx = await browser.newContext({ ...devices["iPhone 13"], ...opts });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  if (apiOff) await page.route("**/js/config.js", (r) => r.fulfill({ contentType: "text/javascript", body: 'window.FV_CONFIG = { API_BASE: "", ROUND_SIZE: 5 };' }));
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForTimeout(250);
  return { ctx, page };
}
/** Играет рейтинговый раунд через интерфейс. exact — ответ точной ценой (из локальных данных стенда). */
async function playRound(page, { exact = true, inspect } = {}) {
  await page.click("#btn-play");
  for (let i = 0; i < 5; i++) {
    await page.waitForSelector("#guess-input:not([disabled])");
    if (inspect) await inspect(i);
    const price = await page.evaluate(() => window.FV_DEBUG.state.questions[window.FV_DEBUG.state.index].price);
    await page.fill("#guess-input", String(exact ? price : price * 3));
    await page.click("#btn-answer");
    await page.waitForSelector("#reveal:not([hidden])");
    await page.waitForTimeout(150);
    await page.click("#btn-next");
  }
  await page.waitForSelector("#final-sync:not([hidden])", { timeout: 15000 });
}
const profileState = (page) => page.evaluate(async () => {
  const res = await fetch("/api/profile", { headers: { Authorization: "tma " + window.Telegram.WebApp.initData } });
  return res.json();
});

let server = await startServer(["--reset", "--reward-pool", "legendary"]);
try {
  console.log("# профиль без наград");
  {
    const { ctx, page } = await open();
    await page.click('[data-go="profile"]');
    await page.waitForSelector("#pf-design:not([hidden])");
    const s = await page.evaluate(() => ({
      empty: !document.getElementById("pf-empty").hidden, pickers: !document.getElementById("pf-pickers").hidden,
      cards: document.querySelectorAll(".pf-card").length, owned: document.querySelectorAll(".pf-card.is-owned").length,
      locked: [...document.querySelectorAll(".pf-card.is-locked .pf-card__info")].every((p) => /^Не открыта\. Точный ответ на вопрос «.+»: от (900|950) из 1000 очков\.$/.test(p.textContent)),
      count: document.getElementById("pf-count").textContent, hscroll: document.documentElement.scrollWidth > innerWidth
    }));
    ok(s.empty && !s.pickers, "пустое состояние с объяснением, выбора нет");
    ok(s.cards === 20 && s.owned === 0 && s.count === "0 из 20", `коллекция: 20 наград, все закрыты (${s.count})`);
    ok(s.locked, "у закрытых наград — условие из конфигурации (вопрос и порог)");
    ok(!s.hscroll, "без горизонтальной прокрутки");
    await ctx.close();
  }

  console.log("\n# LEGENDARY-вопросы до ответа");
  let earned = [];
  {
    const { ctx, page } = await open();
    const seen = [];
    await playRound(page, {
      inspect: async () => {
        await page.waitForTimeout(250);
        seen.push(await page.evaluate(() => {
          const q = window.FV_DEBUG.state.questions[window.FV_DEBUG.state.index];
          const body = document.getElementById("question-body");
          const strip = document.getElementById("legend-strip");
          const frame = getComputedStyle(document.getElementById("photo"), "::before").backgroundImage;
          const fmt = (v) => v.toLocaleString("en-US");
          return {
            id: q.id, rarity: body.dataset.rarity, legend: body.dataset.legend || null, expected: window.FV_REWARDS.bannerForQuestion(q.id),
            chip: document.getElementById("product-rarity").textContent, chipShown: !document.getElementById("product-rarity").hidden,
            strip: !strip.hidden && !!strip.querySelector(`.lb-banner[data-reward="${body.dataset.legend}"] svg`),
            stripH: Math.round(strip.getBoundingClientRect().height), frameGold: frame.includes("rgb(226, 169, 59)"),
            priceLeak: body.innerText.includes(fmt(q.price)) || body.innerText.includes(String(q.price)),
            btnInView: document.getElementById("btn-answer").getBoundingClientRect().bottom <= innerHeight + 140
          };
        }));
      }
    });
    ok(seen.length === 5 && seen.every((s) => s.rarity === "LEGENDARY" && s.chipShown && s.chip === "LEGENDARY"), "метка «LEGENDARY» на каждом LEGENDARY-вопросе");
    ok(seen.every((s) => s.legend && s.legend === s.expected), `тема = баннер этого вопроса (${seen.map((s) => s.legend).join(", ")})`);
    ok(seen.every((s) => s.strip && s.stripH === 24), "полоска со сценой своего баннера, 24 px");
    ok(seen.every((s) => !s.frameGold), "рамка в цветах баннера, а не общая золотая");
    ok(seen.every((s) => !s.priceLeak), "цена до ответа нигде не показана");
    // Новые награды: уведомление после раунда
    await page.waitForSelector("#reward-sheet:not([hidden])", { timeout: 5000 }).catch(() => {});
    const sheet = await page.evaluate(() => ({
      shown: !document.getElementById("reward-sheet").hidden,
      items: [...document.querySelectorAll("#reward-sheet-list .reward-item")].map((x) => ({
        id: x.dataset.reward, tier: x.querySelector(".rw-tier").textContent, name: x.querySelector("b").textContent,
        banner: !!x.querySelector(`.rw-preview--banner .lb-banner[data-reward="${x.dataset.reward}"]`)
      }))
    }));
    earned = sheet.items.map((x) => x.id);
    const prof = await profileState(page);
    ok(sheet.shown && sheet.items.length >= 1, `уведомление о новых наградах (${earned.join(", ")})`);
    ok(sheet.items.every((x) => x.tier === "LEGENDARY" && x.name === RW.REWARDS[x.id].label && x.banner), "в уведомлении — редкость, название и превью баннера");
    ok(JSON.stringify(prof.rewards.map((r) => r.id).sort()) === JSON.stringify([...earned].sort()), "уведомление = награды, сохранённые на сервере");
    await page.click("#btn-reward-profile");
    await page.waitForSelector("#pf-design:not([hidden])");
    const pf = await page.evaluate(() => ({
      owned: [...document.querySelectorAll(".pf-card.is-owned")].map((c) => c.dataset.reward).sort(),
      bannerChoices: [...document.querySelectorAll('.pf-choice[data-kind="banner"]')].map((b) => b.dataset.id || "none"),
      prefixChoices: [...document.querySelectorAll('.pf-choice[data-kind="prefix"]')].map((b) => b.dataset.id || "none")
    }));
    ok(JSON.stringify(pf.owned) === JSON.stringify([...earned].sort()), "«В профиль» → в коллекции открыты именно полученные награды");
    ok(pf.bannerChoices.length === earned.length + 1 && pf.prefixChoices.length === 1, "выбрать можно только полученные баннеры (+ «Без баннера»)");
    await ctx.close();
  }

  console.log("\n# выбор оформления");
  {
    const { ctx, page } = await open();
    await page.click('[data-go="profile"]');
    await page.waitForSelector("#pf-design:not([hidden])");
    const pick = earned[earned.length - 1];
    await page.click(`.pf-choice[data-kind="banner"][data-id="${pick}"]`);
    await page.waitForFunction(() => /Сохранено/.test(document.getElementById("pf-status").textContent));
    ok(await page.evaluate((id) => document.querySelector(`.pf-choice[data-id="${id}"]`).getAttribute("aria-checked") === "true" && !!document.querySelector(`#pf-preview .lb-banner[data-reward="${id}"]`), pick), `выбран «${RW.REWARDS[pick].label}», превью строки обновилось`);
    await page.click('#screen-profile [data-go="menu"]'); await page.click('[data-go="leaderboard"]'); await page.waitForSelector("#lb-table li");
    const lb1 = await page.evaluate(() => document.querySelector("#lb-table li.is-me .lb-banner")?.dataset.reward || null);
    ok(lb1 === pick, "в рейтинге показан выбранный баннер");
    await page.click('#screen-leaderboard [data-go="menu"]'); await page.click('[data-go="profile"]'); await page.waitForSelector("#pf-design:not([hidden])");
    await page.click('.pf-choice[data-kind="banner"][data-id=""]');
    await page.waitForFunction(() => /Сохранено/.test(document.getElementById("pf-status").textContent));
    await page.click('#screen-profile [data-go="menu"]'); await page.click('[data-go="leaderboard"]'); await page.waitForSelector("#lb-table li");
    const lb2 = await page.evaluate(() => { const li = document.querySelector("#lb-table li.is-me"); return { banner: !!li.querySelector(".lb-banner"), cls: li.className }; });
    ok(!lb2.banner && lb2.cls === "is-me", "оформление снято — строка как у игрока без наград");
    // Попытка назначить невыданную награду прямо через API
    const forged = await page.evaluate(async () => {
      const res = await fetch("/api/profile/cosmetics", { method: "POST", headers: { Authorization: "tma " + window.Telegram.WebApp.initData, "Content-Type": "application/json" }, body: JSON.stringify({ prefix: "golden-adele", banner: null }) });
      return res.status;
    });
    ok(forged === 403, `невыданную награду назначить нельзя (ответ ${forged})`);
    // Снова выбираем баннер — для проверки сохранения после перезапуска
    await page.click('#screen-leaderboard [data-go="menu"]'); await page.click('[data-go="profile"]'); await page.waitForSelector("#pf-design:not([hidden])");
    await page.click(`.pf-choice[data-kind="banner"][data-id="${earned[0]}"]`);
    await page.waitForFunction(() => /Сохранено/.test(document.getElementById("pf-status").textContent));
    await ctx.close();
  }

  console.log("\n# повтор после потерянного ответа");
  {
    const before = (await (async () => { const { ctx, page } = await open(); const p = await profileState(page); await ctx.close(); return p; })()).rewards.length;
    const { ctx, page } = await open();
    let first = true, statuses = [];
    await page.route("**/api/round/finish", async (route) => {
      const real = await route.fetch(); statuses.push(real.status());
      if (first) { first = false; await route.abort("connectionreset"); } else await route.fulfill({ response: real });
    });
    await playRound(page);
    await page.waitForSelector("#reward-sheet:not([hidden])", { timeout: 5000 }).catch(() => {});
    const shown = await page.evaluate(() => [...document.querySelectorAll("#reward-sheet-list .reward-item")].map((x) => x.dataset.reward));
    const after = (await profileState(page)).rewards.length;
    const sync = await page.textContent("#final-sync");
    ok(statuses.length === 2 && /засчитан/.test(sync), `игра повторила запрос и показала засчитанный итог (${statuses.join(", ")})`);
    ok(after - before === shown.length, `уведомление после повтора = новые награды раунда (${shown.length}), дубликатов нет (${before} → ${after})`);
    await ctx.close();
  }

  console.log("\n# сохранение выбора после перезапуска сервера");
  await stop(server);
  server = await startServer(["--reward-pool", "legendary"]);
  {
    const { ctx, page } = await open();
    const p = await profileState(page);
    ok(p.custom === true && p.selected.banner === earned[0] && p.selected.prefix === null, `выбор сохранился (${p.selected.banner})`);
    await ctx.close();
  }

  console.log("\n# уменьшить движение и локальный режим");
  {
    const { ctx, page } = await open({ reducedMotion: "reduce" });
    await page.click('[data-go="profile"]'); await page.waitForSelector("#pf-design:not([hidden])");
    const n = await page.evaluate(() => [...document.querySelectorAll("#screen-profile .lb-banner *")].flatMap((el) => el.getAnimations()).length);
    ok(n === 0, `в профиле при «уменьшить движение» анимаций нет (${n})`);
    await page.click('#screen-profile [data-go="menu"]');
    await page.click("#btn-play"); await page.waitForSelector("#guess-input:not([disabled])"); await page.waitForTimeout(300);
    const m = await page.evaluate(() => [...document.querySelectorAll("#legend-strip *, #photo")].flatMap((el) => el.getAnimations()).length);
    ok(m === 0, `LEGENDARY-вопрос при «уменьшить движение»: анимаций нет (${m})`);
    await ctx.close();
  }
  {
    const { ctx, page } = await open({ apiOff: true }); // адрес сервера не указан — игра в локальном режиме
    await page.click('[data-go="profile"]'); await page.waitForTimeout(300);
    const s = await page.evaluate(() => ({ note: !document.getElementById("pf-offline").hidden, design: document.getElementById("pf-design").hidden, owned: document.querySelectorAll(".pf-card.is-owned").length, cards: document.querySelectorAll(".pf-card").length }));
    ok(s.note && s.design && s.owned === 0 && s.cards === 20, "без сервера: пояснение, коллекция закрыта, выбора нет");
    await ctx.close();
  }
  console.log("");
  ok(errors.length === 0, "нет ошибок JavaScript" + (errors.length ? ": " + errors.join(" | ") : ""));
} finally {
  await stop(server).catch(() => {});
  await browser.close();
  rmSync(DATA, { recursive: true, force: true });
}
console.log(`\n${failures === 0 ? "ВСЁ ПРОШЛО" : "ОШИБОК: " + failures}`);
process.exit(failures ? 1 : 0);
