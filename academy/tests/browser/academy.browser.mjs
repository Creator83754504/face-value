#!/usr/bin/env node
/*
 * Браузерная проверка Crypto Academy (Playwright, открывает index.html напрямую через file://).
 *   node tests/browser/academy.browser.mjs
 * Проверяет: все экраны и уроки без ошибок в консоли и без горизонтальной прокрутки (1280 px и 390 px),
 * прохождение урока через интерфейс, блокировку следующего урока, сохранение прогресса после перезагрузки,
 * сделку в симуляторе со стопом и разбором тренера, карточки, словарь, калькулятор, бэктест.
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const URL0 = pathToFileURL(path.join(ROOT, "index.html")).href;
const require = createRequire(import.meta.url);
const pw = process.env.PLAYWRIGHT_PATH ? await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href) : require("playwright");
const { chromium, devices } = pw.default || pw;
let failures = 0;
const ok = (c, m) => { console.log(`${c ? "ok  " : "FAIL"} - ${m}`); if (!c) failures++; };

const browser = await chromium.launch();
async function open(opts = {}) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(m.text()); });
  page.on("dialog", (d) => d.accept());
  await page.goto(URL0);
  await page.waitForSelector(".sidebar");
  return { ctx, page, errors };
}
const hscroll = (page) => page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
const go = async (page, hash) => { await page.evaluate((h) => { location.hash = h; }, hash); await page.waitForTimeout(250); };

// ───── 1. Обход всех экранов и уроков ─────
for (const [label, opts] of [["1280 px", { viewport: { width: 1280, height: 860 } }], ["iPhone 13", devices["iPhone 13"]]]) {
  const { ctx, page, errors } = await open(opts);
  await page.evaluate(() => CA.app.store.setSetting("freeMode", true));
  const lessons = await page.evaluate(() => CA.course.lessons.map((l) => l.id));
  const routes = ["#/", "#/course", "#/sim", "#/lab", "#/tools", "#/exam", "#/glossary", "#/cards", "#/mistakes", "#/cases", "#/daily", "#/profile"]
    .concat(await page.evaluate(() => CA.cases.map((c) => "#/cases/" + c.id)), lessons.map((id) => "#/lesson/" + id));
  const wide = [];
  for (const r of routes) {
    await go(page, r);
    if (await hscroll(page)) wide.push(r);
  }
  ok(wide.length === 0, `${label}: нет горизонтальной прокрутки (${routes.length} экранов)${wide.length ? " → " + wide.join(", ") : ""}`);
  const sections = await page.evaluate(async (ids) => {
    const miss = [];
    for (const id of ids) {
      location.hash = "#/lesson/" + id;
      await new Promise((r) => setTimeout(r, 60));
      ["theory", "analysis", "mistakes", "practice", "quiz", "summary", "next"].forEach((s) => { if (!document.getElementById("sec-" + s)) miss.push(id + ":" + s); });
      if (!document.querySelector(".lesson-goal")) miss.push(id + ":goal");
    }
    return miss;
  }, lessons);
  ok(sections.length === 0, `${label}: в каждом уроке есть цель и все 7 разделов ${sections.slice(0, 5).join(", ")}`);
  ok(errors.length === 0, `${label}: нет ошибок в консоли ${errors.slice(0, 3).join(" | ")}`);
  await ctx.close();
}

// ───── 2. Прохождение первого урока через интерфейс и сохранение прогресса ─────
{
  const { ctx, page, errors } = await open({ viewport: { width: 1280, height: 860 } });
  await go(page, "#/lesson/m1-l2");
  ok(await page.locator("text=Урок пока закрыт").count() === 1, "второй урок закрыт до прохождения первого");
  await go(page, "#/lesson/m1-l1");
  // классификации: выбираем правильные категории по данным курса
  const tasks = await page.evaluate(() => CA.course.find("m1-l1").practice.map((t) => ({ id: t.id, items: t.items, cats: t.categories })));
  for (const t of tasks) {
    const box = page.locator("#task-" + t.id);
    for (const it of t.items) {
      const row = box.locator(".classify__row", { hasText: it[0] });
      await row.locator(".seg button").nth(it[1]).click();
    }
    await box.locator("button", { hasText: "Проверить" }).click();
    ok(await box.locator(".task__status.is-ok").count() === 1, "задание выполнено: " + t.id);
  }
  // тест: сначала с ошибками
  const quiz = await page.evaluate(() => CA.course.find("m1-l1").quiz.map((q) => ({ id: q.id, a: q.a, c: q.c })));
  async function answer(wrong) {
    for (const q of quiz) {
      const card = page.locator("#q-" + q.id);
      const correct = Array.isArray(q.c) ? q.c : [q.c];
      const pick = wrong ? [correct[0] === 0 ? 1 : 0] : correct;
      for (const idx of pick) await card.locator(".opt", { hasText: q.a[idx].replace(/<[^>]+>/g, "") }).first().click();
    }
    await page.locator("button", { hasText: "Проверить ответы" }).click();
  }
  await answer(true);
  ok(await page.locator(".quiz-result.is-fail").count() === 1, "тест с ошибками не засчитан");
  ok(!(await page.evaluate(() => CA.app.store.isDone("m1-l1"))), "урок не завершён при проваленном тесте");
  ok(await page.evaluate(() => Object.keys(CA.app.store.state.mistakes).length) >= 5, "ошибки сохранены для раздела «Разбор ошибок»");
  await page.locator(".quiz-result button", { hasText: "Пройти заново" }).click();
  await answer(false);
  ok(await page.locator(".quiz-result.is-pass").count() === 1, "тест сдан на 100%");
  ok(await page.evaluate(() => CA.app.store.isDone("m1-l1")), "урок завершён после практики и теста");
  const xp = await page.evaluate(() => CA.app.store.state.xp);
  ok(xp >= 190, "начислен опыт: " + xp);
  await page.reload(); await page.waitForSelector(".sidebar");
  ok(await page.evaluate(() => CA.app.store.isDone("m1-l1") && CA.app.store.state.xp) === xp, "прогресс сохранился после перезагрузки");
  await go(page, "#/");
  ok(await page.locator(".hero a.btn--primary", { hasText: "Что такое блокчейн" }).count() + await page.locator(".hero a.btn--primary", { hasText: "Блокчейн" }).count() >= 1, "главная предлагает продолжить со следующего урока");
  await go(page, "#/lesson/m1-l2");
  ok(await page.locator("text=Урок пока закрыт").count() === 0, "второй урок открылся");
  await go(page, "#/mistakes");
  ok(await page.locator(".q").count() >= 1, "раздел «Разбор ошибок» показывает ошибки теста");
  await go(page, "#/profile");
  ok(await page.locator(".ach:not(.is-locked)").count() >= 2, "в профиле есть полученные достижения");
  ok(errors.length === 0, "нет ошибок в консоли при прохождении урока " + errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ───── 3. Симулятор: сделка со стопом, разбор тренера, сохранение ─────
{
  const { ctx, page, errors } = await open({ viewport: { width: 1280, height: 900 } });
  await go(page, "#/sim");
  await page.waitForTimeout(300);
  ok(await page.locator(".tag-data", { hasText: "Синтетические" }).count() >= 1, "симулятор помечает данные как синтетические");
  const cur = await page.evaluate(() => parseFloat(document.querySelector(".sim-price b").textContent.replace(/\s/g, "").replace(",", ".")));
  await page.fill('input[aria-label="Stop Loss"]', String((cur * 0.98).toFixed(2)));
  await page.locator("button", { hasText: "Рассчитать размер от риска" }).click();
  const usd = await page.inputValue('input[aria-label="Сумма в USDT"]');
  ok(parseFloat(usd) > 10 && parseFloat(usd) < 10000, "размер позиции рассчитан от риска: " + usd + " USDT");
  await page.locator("button.btn--buy", { hasText: "Купить" }).click();
  ok(await page.locator(".pos").count() === 1, "позиция открыта");
  for (let i = 0; i < 400 && (await page.locator(".pos").count()) > 0; i++) {
    await page.locator("button", { hasText: "Следующая свеча" }).click();
    if (await page.locator(".modal").count()) break;
  }
  if (!(await page.locator(".modal").count()) && (await page.locator(".pos").count())) await page.locator(".pos button", { hasText: "Продать" }).click();
  ok(await page.locator(".modal", { hasText: "Разбор сделки" }).count() === 1, "после закрытия сделки показан разбор тренера");
  await page.locator(".modal .icon-btn").click();
  await page.waitForTimeout(250);
  ok(await page.locator("table.table tbody tr").count() === 1, "сделка в истории");
  await page.locator(".seg button", { hasText: "Статистика" }).click();
  ok(await page.locator(".stat", { hasText: "Макс. просадка" }).count() >= 1, "статистика с максимальной просадкой");
  const balance = await page.evaluate(() => JSON.parse(localStorage.getItem("ca.sim.v1")).account.cash);
  await page.reload(); await page.waitForSelector(".sidebar"); await go(page, "#/sim");
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem("ca.sim.v1")).account.cash) === balance, "состояние симулятора сохраняется");
  ok(await page.evaluate(() => CA.app.store.state.counters.tradesWithStop) === 1, "сделка со стопом учтена в прогрессе");
  // автопроигрывание останавливается при уходе со страницы
  await page.locator("button", { hasText: "▶ Авто" }).click();
  await go(page, "#/");
  const c1 = await page.evaluate(() => JSON.parse(localStorage.getItem("ca.sim.v1")).cursor);
  await page.waitForTimeout(700);
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem("ca.sim.v1")).cursor) === c1, "автопроигрывание остановлено при уходе со страницы");
  ok(errors.length === 0, "нет ошибок в консоли в симуляторе " + errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ───── 4. Инструменты, словарь, карточки, бэктест (телефон) ─────
{
  const { ctx, page, errors } = await open(devices["iPhone 13"]);
  await go(page, "#/glossary");
  await page.fill('input[type="search"]', "ликвидац");
  ok(await page.locator(".term mark").count() >= 1, "поиск по словарю подсвечивает совпадения");
  await go(page, "#/cards");
  await page.locator(".flashcard").click();
  await page.locator("button.btn--buy", { hasText: "Знал" }).click();
  ok(await page.evaluate(() => CA.app.store.state.cardsReviewed) === 1, "карточка повторена");
  await go(page, "#/tools");
  ok(await page.locator(".stat", { hasText: "Размер позиции" }).count() >= 1, "калькулятор позиции считает сразу");
  await go(page, "#/lab");
  await page.locator("button", { hasText: "Проверить на обучающем отрезке" }).click();
  await page.waitForTimeout(300);
  ok(await page.locator(".stat", { hasText: "Profit factor" }).count() >= 1, "бэктест выдаёт метрики");
  ok(!(await hscroll(page)), "лаборатория без горизонтальной прокрутки на телефоне");
  await page.locator(".tabbar button").click();
  ok(await page.locator(".sidebar.is-open").count() === 1, "меню открывается на телефоне");
  ok(errors.length === 0, "нет ошибок в консоли (телефон) " + errors.slice(0, 3).join(" | "));
  await ctx.close();
}

await browser.close();
console.log(failures ? `\n${failures} проверок не прошло` : "\nВсе проверки пройдены");
process.exit(failures ? 1 : 0);
