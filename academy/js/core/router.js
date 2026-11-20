/* Hash-роутер: #/lesson/m1-l2 → { name: "lesson", params: ["m1-l2"] }. Работает и с file://. */
(function (g) {
  "use strict";
  var CA = g.CA || (g.CA = {});
  var handlers = {}, fallback = null, current = null;

  function parse(hash) {
    var path = (hash || "").replace(/^#\/?/, "").split("?")[0];
    var parts = path.split("/").filter(Boolean).map(decodeURIComponent);
    return { name: parts[0] || "home", params: parts.slice(1), path: "#/" + path };
  }

  function resolve() {
    var r = parse(location.hash);
    var fn = handlers[r.name] || fallback;
    current = r;
    if (fn) fn(r);
  }

  var api = {
    on: function (name, fn) { handlers[name] = fn; return api; },
    otherwise: function (fn) { fallback = fn; return api; },
    start: function () { window.addEventListener("hashchange", resolve); resolve(); },
    go: function (path) { if (location.hash === path) resolve(); else location.hash = path; },
    reload: resolve,
    current: function () { return current; },
    parse: parse
  };
  CA.router = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
