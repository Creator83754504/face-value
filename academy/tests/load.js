// Загружает чистые модули и контент курса в Node (без DOM).
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const files = ["core/ns", "lib/rng", "lib/indicators", "lib/risk", "lib/market-data", "lib/trading-engine", "lib/coach", "lib/backtest", "core/progress",
  "course/m1", "course/m2", "course/m3", "course/m4", "course/m5", "course/m6", "course/m7", "course/index", "course/glossary", "course/cases", "course/exam-bank"];
if (!globalThis.CA || !globalThis.CA.course || !globalThis.CA.course.lessons) files.forEach((f) => require(path.join(ROOT, "js", f + ".js")));
module.exports = globalThis.CA;
