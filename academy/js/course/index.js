/*
 * Индекс курса: собирает модули в плоский список уроков, проставляет идентификаторы
 * практических заданий и вопросов. Подключается после файлов модулей.
 */
(function (g) {
  "use strict";
  var CA = g.CA;
  var C = CA.course;
  C.modules.sort(function (a, b) { return a.n - b.n; });
  C.lessons = [];
  C.questions = {};
  C.modules.forEach(function (M) {
    M.lessons.forEach(function (L, k) {
      L.module = M.n;
      L.id = L.id || "m" + M.n + "-l" + (k + 1);
      L.practice = (L.practice || []).map(function (t, i) { t.id = t.id || L.id + "-t" + (i + 1); return t; });
      L.quiz = (L.quiz || []).map(function (q, i) { q.id = q.id || L.id + "-q" + (i + 1); C.questions[q.id] = { q: q, lesson: L }; return q; });
      C.lessons.push(L);
    });
  });
  C.find = function (id) { return C.lessons.find(function (l) { return l.id === id; }) || null; };
  C.index = function () { return { lessons: C.lessons.map(function (l) { return { id: l.id, module: l.module, title: l.title, practice: l.practice.map(function (t) { return t.id; }), quiz: l.quiz.length > 0 }; }) }; };
  if (typeof module !== "undefined" && module.exports) module.exports = C;
})(typeof globalThis !== "undefined" ? globalThis : this);
