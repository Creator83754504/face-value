/*
 * CRYPTO ACADEMY — общее пространство имён.
 * Все модули регистрируются в window.CA (в Node — в globalThis.CA), поэтому приложение
 * открывается двойным кликом по index.html без сборки и без сервера.
 */
(function (g) {
  "use strict";
  var CA = g.CA || (g.CA = {});
  CA.version = "1.0.0";
  CA.course = CA.course || { modules: [] };
  CA.tasks = CA.tasks || {};
  CA.views = CA.views || {};
  if (typeof module !== "undefined" && module.exports) module.exports = CA;
})(typeof globalThis !== "undefined" ? globalThis : this);
