/*
 * Обёртка над встроенным node:sqlite, повторяющая API Cloudflare D1 (prepare / bind / first / all / run / batch).
 * Только для тестов и локального стенда.
 *
 * batch() — как в D1: все команды выполняются одной транзакцией; если одна падает, откатываются все.
 * failOn(sql, index) — для тестов сбоя: вернуть true, чтобы «уронить» базу на этой команде пакета.
 * loseAck(statements) — вернуть true, чтобы транзакция СОХРАНИЛАСЬ, но вызывающий код получил ошибку.
 */
export function d1(db, { failOn = null, loseAck = null } = {}) {
  const prepare = (sql) => {
    const st = db.prepare(sql);
    let args = [];
    const api = {
      sql,
      bind(...a) { args = a; return api; },
      async first() { return st.get(...args) ?? null; },
      async all() { return { results: st.all(...args) }; },
      async run() { const r = st.run(...args); return { meta: { changes: Number(r.changes) } }; },
      runSync() { const r = st.run(...args); return { meta: { changes: Number(r.changes) } }; }
    };
    return api;
  };
  return {
    prepare,
    async batch(statements) {
      db.exec("BEGIN");
      let out;
      try {
        out = statements.map((s, i) => {
          if (failOn && failOn(s.sql, i)) throw new Error(`Сбой базы (тест) на команде ${i}`);
          return s.runSync();
        });
        db.exec("COMMIT");
      } catch (err) {
        db.exec("ROLLBACK");
        throw err;
      }
      // «Запись прошла, ответ потерян»: транзакция уже сохранена, но вызывающий код получает ошибку
      if (loseAck && loseAck(statements)) throw new Error("Ответ базы потерян (тест) — запись уже сохранена");
      return out;
    }
  };
}
