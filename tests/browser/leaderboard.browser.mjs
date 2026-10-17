#!/usr/bin/env node
/*
 * Проверка рейтинга с наградами в настоящем браузере (Playwright + локальный стенд).
 *
 *   node tests/browser/leaderboard.browser.mjs
 *
 * Нужен установленный Playwright (npm i -D playwright && npx playwright install chromium)
 * или переменная PLAYWRIGHT_PATH с путём к нему. Запускает tools/dev-server.mjs во временной
 * папке (ваша локальная база dev-data не трогается), открывает экран «Рейтинг» и проверяет:
 * строки без наград не изменились, префикс и баннер на месте, высота строк одинакова,
 * ник и очки поверх баннера, нет горизонтальной прокрутки, петля анимации, «уменьшить движение»,
 * сохранение наград после перезапуска сервера, отсутствие ошибок JavaScript.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const pwMod = await import(process.env.PLAYWRIGHT_PATH ? pathToFileURL(process.env.PLAYWRIGHT_PATH).href : "playwright");
const { chromium, devices } = pwMod.default || pwMod;
const PORT = 8799;
const DATA = mkdtempSync(path.join(tmpdir(), "fv-lb-"));
let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? "ok  " : "FAIL"} - ${msg}`); if (!cond) failures++; };

function startServer(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [path.join(ROOT, "tools/dev-server.mjs"), "--port", String(PORT), ...args], { env: { ...process.env, FV_DEV_DATA: DATA } });
    let out = "";
    p.stdout.on("data", (d) => { out += d; if (out.includes("локальный стенд")) resolve(p); });
    p.stderr.on("data", (d) => { if (!String(d).includes("ExperimentalWarning") && !String(d).includes("trace-warnings")) process.stderr.write(d); });
    p.on("exit", (c) => reject(new Error("dev-server exited " + c + "\n" + out)));
  });
}
const stop = (p) => new Promise((r) => { p.removeAllListeners("exit"); p.on("exit", r); p.kill(); });

const browser = await chromium.launch();
const errors = [];
async function openLb(device, opts = {}) {
  const ctx = await browser.newContext({ ...device, ...opts });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.goto(`http://localhost:${PORT}/`);
  await page.click('[data-go="leaderboard"]');
  await page.waitForSelector("#lb-table li");
  await page.waitForTimeout(300);
  return { ctx, page };
}
const rowsInfo = (page) => page.evaluate(() => [...document.querySelectorAll("#lb-table li")].map((li) => {
  li.scrollIntoView({ block: "center" }); // elementFromPoint работает только для видимой части экрана
  const r = li.getBoundingClientRect();
  const name = li.querySelector(".lb-name"), score = li.querySelector(".lb-score"), pos = li.querySelector(".lb-pos");
  const text = li.querySelector(".lb-name__text") || name;
  const sr = score.getBoundingClientRect(), nr = text.getBoundingClientRect();
  const topAt = (x, y) => { const el = document.elementFromPoint(x, y); return el && (el === score || score.contains(el) ? "score" : el === text || text.contains(el) ? "name" : el.closest(".lb-banner") ? "banner" : el.className); };
  const prefix = li.querySelector(".lb-prefix");
  return {
    name: text.textContent, height: Math.round(r.height), top: Math.round(r.top), border: getComputedStyle(li).borderTopWidth,
    children: [...li.children].map((c) => c.className), nameChildNodes: [...name.childNodes].map((n) => n.nodeType === 3 ? "#text" : n.className),
    liClass: li.className, meBar: li.classList.contains("is-me") ? getComputedStyle(li, "::before").width : null, prefix: prefix ? prefix.querySelector(".lb-prefix__label").textContent : null,
    prefixPx: prefix ? parseFloat(getComputedStyle(prefix).fontSize) : null, namePx: parseFloat(getComputedStyle(text).fontSize),
    banner: li.querySelector(".lb-banner")?.dataset.reward || null,
    bannerInside: (() => { const b = li.querySelector(".lb-banner"); if (!b) return null; const br = b.getBoundingClientRect(); return br.left >= r.left - 0.5 && br.right <= r.right + 0.5 && br.top >= r.top - 0.5 && br.bottom <= r.bottom + 0.5; })(),
    scoreOnTop: topAt(sr.left + sr.width / 2, sr.top + sr.height / 2), nameOnTop: topAt(nr.left + Math.min(10, nr.width / 2), nr.top + nr.height / 2),
    scoreInRow: sr.right <= r.right && sr.left >= r.left
  };
}));

let server = await startServer(["--reset", "--demo", "--demo-all"]);
try {
  for (const [label, dev] of [["320 px (iPhone SE)", devices["iPhone SE"]], ["390 px (iPhone 13)", devices["iPhone 13"]], ["1280 px", { viewport: { width: 1280, height: 800 } }]]) {
    const { ctx, page } = await openLb(dev);
    const rows = await rowsInfo(page);
    const by = Object.fromEntries(rows.map((r) => [r.name.split(" ")[0], r]));
    const hscroll = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    console.log(`\n# ${label}`);
    ok(!hscroll, "нет горизонтальной прокрутки");
    for (const n of ["Ольга", "Игорь"]) {
      const r = by[n];
      ok(JSON.stringify(r.children) === JSON.stringify(["lb-pos", "lb-name", "lb-score"]) && JSON.stringify(r.nameChildNodes) === '["#text"]' && r.liClass === "",
        `${n}: строка без наград устроена как раньше (место, ник, очки)`);
    }
    const plain = by["Ольга"].height;
    ok(rows.every((r) => Math.abs(r.height - (r.border === "0px" ? plain - 1 : plain)) <= 0.5), `высота всех строк одинакова (${rows.map((r) => r.height).join(", ")})`);
    ok(by["Виктория"].prefix === "Космограф" && by["Виктория"].banner === "uhlenhaut-night", "Виктория: префикс «Космограф» и баннер Uhlenhaut");
    ok(by["Виктория"].liClass.includes("is-me") && by["Виктория"].meBar === "3px", "своя строка с баннером отмечена полосой слева");
    ok(by["Александр-Максимилиан"].prefix === "Космограф" && !by["Александр-Максимилиан"].banner, "длинный ник: только префикс");
    ok(!by["Марк"].prefix && by["Марк"].banner === "uhlenhaut-night", "Марк: только баннер");
    ok(rows.filter((r) => r.prefix).every((r) => r.prefixPx < r.namePx), "префикс меньше ника");
    ok(rows.filter((r) => r.banner).every((r) => r.bannerInside), "баннер не выходит за границы строки");
    const notTop = rows.filter((r) => !(r.scoreOnTop === "score" && r.nameOnTop === "name"));
    ok(notTop.length === 0, "ник и очки поверх баннера" + (notTop.length ? ": " + notTop.map((r) => `${r.name} → ${r.nameOnTop}/${r.scoreOnTop}`).join("; ") : ""));
    ok(rows.every((r) => r.scoreInRow), "очки целиком внутри строки");
    await ctx.close();
  }

  console.log("\n# все 20 наград в рейтинге");
  {
    const RW = (await import(pathToFileURL(path.join(ROOT, "js/rewards-config.js")).href)).default;
    const ids = Object.keys(RW.REWARDS);
    for (const [label, dev] of [["320 px", devices["iPhone SE"]], ["390 px", devices["iPhone 13"]]]) {
      const { ctx, page } = await openLb(dev);
      const seen = await page.evaluate(() => ({
        prefixes: [...document.querySelectorAll("#lb-table .lb-prefix")].map((p) => ({
          id: p.dataset.reward, label: p.querySelector(".lb-prefix__label").textContent,
          glyphShapes: p.querySelectorAll(".lb-prefix__glyph svg path, .lb-prefix__glyph svg circle").length,
          labelShown: getComputedStyle(p.querySelector(".lb-prefix__label")).display !== "none",
          px: parseFloat(getComputedStyle(p).fontSize), namePx: parseFloat(getComputedStyle(p.closest("li").querySelector(".lb-name__text")).fontSize),
          color: getComputedStyle(p).color })),
        banners: [...document.querySelectorAll("#lb-table .lb-banner")].map((b) => b.dataset.reward),
        heights: [...document.querySelectorAll("#lb-table li")].map((li) => Math.round(li.getBoundingClientRect().height)),
        hscroll: document.documentElement.scrollWidth > innerWidth
      }));
      const prefixIds = ids.filter((id) => RW.REWARDS[id].kind === "prefix");
      const bannerIds = ids.filter((id) => RW.REWARDS[id].kind === "banner");
      const shownP = new Set(seen.prefixes.map((p) => p.id)), shownB = new Set(seen.banners);
      ok(prefixIds.every((id) => shownP.has(id)), `${label}: все 14 префиксов показаны (${shownP.size})`);
      ok(bannerIds.every((id) => shownB.has(id)), `${label}: все 6 баннеров показаны (${shownB.size})`);
      ok(seen.prefixes.every((p) => p.label === RW.REWARDS[p.id].label && p.glyphShapes > 0 && p.px < p.namePx), `${label}: у префиксов верная подпись, SVG-символ и размер меньше ника`);
      ok(new Set(seen.prefixes.filter((p) => p.id !== "cosmograph").map((p) => p.color)).size >= 10, `${label}: у префиксов свои тона (${new Set(seen.prefixes.map((p) => p.color)).size} разных)`);
      ok(label === "320 px" ? seen.prefixes.every((p) => !p.labelShown) : seen.prefixes.every((p) => p.labelShown), `${label}: подписи префиксов ${label === "320 px" ? "скрыты, остаётся символ" : "видны"}`);
      const base = seen.heights[1];
      ok(seen.heights.slice(1).every((h) => Math.abs(h - base) <= 0.5) && !seen.hscroll, `${label}: ${seen.heights.length} строк одной высоты (${base}px), без горизонтальной прокрутки`);
      await ctx.close();
    }

    // Петли без шва: кадр в начале и в конце цикла совпадают попиксельно; длительность 7–9 с
    const { ctx, page } = await openLb(devices["iPhone 13"]);
    const bannerIds = ids.filter((id) => RW.REWARDS[id].kind === "banner");
    const diffPixels = (a, b) => page.evaluate(async ([a, b]) => {
      const load = (src) => new Promise((r) => { const im = new Image(); im.onload = () => r(im); im.src = "data:image/png;base64," + src; });
      const [ia, ib] = [await load(a), await load(b)];
      const c = document.createElement("canvas"); c.width = ia.width; c.height = ia.height;
      const x = c.getContext("2d"); x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, c.width, c.height).data;
      x.clearRect(0, 0, c.width, c.height); x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, c.width, c.height).data;
      let n = 0; for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 24) n++;
      return n / (da.length / 4);
    }, [a, b]);
    for (const id of bannerIds) {
      const row = page.locator(`#lb-table li:has(.lb-banner[data-reward="${id}"])`).last();
      const info = await page.evaluate((id) => {
        const els = [...document.querySelectorAll(`#lb-table .lb-banner[data-reward="${id}"] *`)];
        const anims = els.flatMap((el) => el.getAnimations());
        return { count: anims.length, durations: [...new Set(anims.map((a) => a.effect.getTiming().duration))] };
      }, id);
      const setAt = (end) => page.evaluate(([id, end]) => {
        document.querySelectorAll(`#lb-table .lb-banner[data-reward="${id}"] *`).forEach((el) => el.getAnimations().forEach((a) => {
          const t = a.effect.getTiming(); const period = t.duration * (String(t.direction).includes("alternate") ? 2 : 1);
          a.pause(); a.currentTime = end ? period - 1 : 0;
        }));
      }, [id, end]);
      await setAt(false); const a = (await row.screenshot()).toString("base64");
      await setAt(true); const b = (await row.screenshot()).toString("base64");
      const d = await diffPixels(a, b);
      const main = Math.max(...info.durations);
      ok(info.count > 0 && main >= 7000 && main <= 9000, `${id}: петля ${main / 1000} с, анимаций ${info.count}`);
      ok(d < 0.01, `${id}: начало и конец петли совпадают (отличается ${(d * 100).toFixed(2)}% пикселей)`);
    }
    // Вне экрана — пауза, у всех баннеров
    const paused = await page.evaluate(() => [...document.querySelectorAll("#lb-table li.has-banner")].every((li) => {
      li.classList.add("is-offscreen");
      const all = [...li.querySelectorAll(".lb-banner *")].filter((el) => getComputedStyle(el).animationName !== "none");
      const res = all.length > 0 && all.every((el) => getComputedStyle(el).animationPlayState.split(",").every((s) => s.trim() === "paused"));
      li.classList.remove("is-offscreen"); return res;
    }));
    ok(paused, "все баннеры встают на паузу вне экрана");
    await ctx.close();
    // «Уменьшить движение» — у всех баннеров неподвижный кадр
    {
      const { ctx, page } = await openLb(devices["iPhone 13"], { reducedMotion: "reduce" });
      const n = await page.evaluate(() => [...document.querySelectorAll("#lb-table .lb-banner *")].flatMap((el) => el.getAnimations()).length);
      ok(n === 0, `«уменьшить движение»: анимаций в баннерах ${n}`);
      for (const id of bannerIds) await page.locator(`#lb-table li:has(.lb-banner[data-reward="${id}"])`).last().screenshot({ path: path.join(DATA, `static-${id}.png`) });
      await ctx.close();
    }
  }

  console.log("\n# анимация");
  {
    const { ctx, page } = await openLb(devices["iPhone 13"]);
    const a = await page.evaluate(() => {
      const car = document.querySelector(".lb-banner .rw-car");
      const set = (ms) => { document.querySelectorAll(".lb-banner *").forEach((el) => el.getAnimations().forEach((x) => { x.pause(); x.currentTime = ms; })); };
      const x = () => new DOMMatrix(getComputedStyle(car).transform).m41;
      const puffs = () => Number(getComputedStyle(document.querySelector(".lb-banner .rw-puffs")).opacity);
      const haze = () => Number(getComputedStyle(document.querySelector(".lb-banner .rw-haze-world")).opacity);
      set(0); const s = { x: x(), puffs: puffs(), haze: haze() };
      set(8999); const e = { x: x(), puffs: puffs(), haze: haze() };
      set(3600); const m = { x: x() };
      const names = [...new Set([...document.querySelectorAll(".lb-banner[data-reward=\"uhlenhaut-night\"] *")].flatMap((el) => el.getAnimations().map((x) => x.animationName)))];
      const durations = [...new Set([...document.querySelectorAll(".lb-banner[data-reward=\"uhlenhaut-night\"] *")].flatMap((el) => el.getAnimations().map((x) => x.effect.getTiming().duration)))];
      return { s, e, m, names, durations };
    });
    ok(a.s.x < -120 && a.e.x > 600 && a.s.puffs === 0 && a.e.puffs === 0 && a.s.haze === 0 && a.e.haze === 0,
      `петля без шва: в начале и в конце пустая улица (машина ${a.s.x} → ${a.e.x}, дымка 0)`);
    ok(a.m.x > 0 && a.m.x < 600, `в середине петли машина в кадре (x = ${Math.round(a.m.x)})`);
    ok(a.names.length === 5 && a.durations.every((d) => d === 9000 || d === 4500), `анимации: ${a.names.join(", ")}`);
    const paused = await page.evaluate(async () => {
      const li = document.querySelector("#lb-table li.has-banner");
      li.classList.add("is-offscreen");
      const st = getComputedStyle(li.querySelector(".rw-car")).animationPlayState;
      li.classList.remove("is-offscreen");
      return st;
    });
    ok(paused === "paused", "строка вне экрана — анимация на паузе");
    await ctx.close();
  }
  {
    const { ctx, page } = await openLb(devices["iPhone 13"], { reducedMotion: "reduce" });
    const r = await page.evaluate(() => ({
      running: [...document.querySelectorAll(".lb-banner *")].flatMap((el) => el.getAnimations()).length,
      x: new DOMMatrix(getComputedStyle(document.querySelector(".lb-banner .rw-car")).transform).m41
    }));
    ok(r.running === 0 && r.x === 260, `«уменьшить движение»: анимаций нет, неподвижный кадр (машина x = ${r.x})`);
    await ctx.close();
  }

  console.log("\n# рейтинговый раунд через интерфейс (сохранение результата не сломано)");
  {
    const { ctx, page } = await openLb(devices["iPhone 13"]);
    await page.evaluate(() => document.querySelector('[data-go="menu"], #btn-lb-back, .screen--leaderboard [data-go]')?.click());
    await page.waitForTimeout(300);
    await page.click("#btn-play");
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector("#guess-input:not([disabled])");
      await page.fill("#guess-input", "1500");
      await page.click("#btn-answer");
      await page.waitForSelector("#reveal:not([hidden])");
      await page.waitForTimeout(250);
      if (i < 4) await page.click("#btn-next");
    }
    await page.click("#btn-next");
    await page.waitForSelector("#final-sync:not([hidden])", { timeout: 5000 }).catch(() => {});
    const sync = await page.evaluate(() => document.getElementById("final-sync")?.textContent || "");
    ok(/рейтинг|Раунд засчитан/.test(sync), `сервер принял раунд: «${sync.trim()}»`);
    await ctx.close();
  }

  console.log("\n# неопределённый результат завершения раунда");
  async function playRoundUI(page) {
    await page.click("#btn-play");
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector("#guess-input:not([disabled])");
      await page.fill("#guess-input", "1500");
      await page.click("#btn-answer");
      await page.waitForSelector("#reveal:not([hidden])");
      await page.waitForTimeout(200);
      if (i < 4) await page.click("#btn-next");
    }
    await page.click("#btn-next");
    await page.waitForSelector("#final-sync:not([hidden])", { timeout: 15000 });
    return (await page.textContent("#final-sync")).trim();
  }
  async function menuPage() {
    const ctx = await browser.newContext({ ...devices["iPhone 13"] });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`http://localhost:${PORT}/`);
    return { ctx, page };
  }
  {
    // Сервер ЗАПИСАЛ завершение, но ответ до игры не дошёл (соединение оборвано после записи)
    const { ctx, page } = await menuPage();
    const seen = [];
    let first = true;
    await page.route("**/api/round/finish", async (route) => {
      if (first) {
        first = false;
        const real = await route.fetch();          // запрос дошёл до сервера, запись прошла
        seen.push("записано, ответ потерян: " + real.status());
        await route.abort("connectionreset");      // а игре — обрыв соединения
      } else {
        const res = await route.fetch(); seen.push("повтор: " + res.status());
        await route.fulfill({ response: res });
      }
    });
    const msg = await playRoundUI(page);
    ok(seen.length === 2 && /200/.test(seen[0]) && /200/.test(seen[1]), `игра повторила запрос сама (${seen.join("; ")})`);
    ok(/засчитан/.test(msg) && !/не принял/.test(msg), `после повтора — сообщение об успехе: «${msg}»`);
    await ctx.close();
  }
  {
    // Сервер недоступен совсем — игра не утверждает, что результат не сохранён
    const { ctx, page } = await menuPage();
    let n = 0;
    await page.route("**/api/round/finish", (route) => { n++; return route.abort("connectionrefused"); });
    const msg = await playRoundUI(page);
    ok(n === 3, `попыток ровно 3 (было ${n})`);
    ok(/мог быть засчитан/.test(msg) && !/не принял/.test(msg), `честное сообщение «результат неизвестен»: «${msg}»`);
    await ctx.close();
  }

  console.log("\n# сохранение после перезапуска сервера");
  await stop(server);
  server = await startServer([]); // без --reset и без --demo: та же база
  {
    const { ctx, page } = await openLb(devices["iPhone 13"]);
    const rows = await rowsInfo(page);
    const v = rows.find((r) => r.name.startsWith("Виктория"));
    ok(v && v.prefix === "Космограф" && v.banner === "uhlenhaut-night", "награды на месте после перезапуска");
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
