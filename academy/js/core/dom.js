/* Небольшие помощники для DOM: создание элементов, форматирование чисел, уведомления. */
(function (g) {
  "use strict";
  var CA = g.CA || (g.CA = {});

  /*
   * h("div", { class: "x", onclick: fn, html: "<b>..</b>" }, child1, "текст", [child2, child3])
   * Строки-потомки вставляются как текст (безопасно). Готовый HTML — только через атрибут html
   * и только из собственного контента курса.
   */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k === "text") el.textContent = v;
      else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (k === "dataset") Object.assign(el.dataset, v);
      else if (v === true) el.setAttribute(k, "");
      else el.setAttribute(k, v);
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    el.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]; }); }

  function fmt(n, d) {
    if (n == null || !isFinite(n)) return n === Infinity ? "∞" : "—";
    if (d == null) d = Math.abs(n) >= 1000 ? 2 : Math.abs(n) >= 1 ? 2 : 5;
    return n.toLocaleString("ru-RU", { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function fmtPrice(n) {
    if (n == null || !isFinite(n)) return "—";
    var a = Math.abs(n), d = a >= 1000 ? 2 : a >= 10 ? 2 : a >= 1 ? 3 : 5;
    return fmt(n, d);
  }
  function signed(n, d) { if (d == null) d = 2; var r = Math.abs(n) < Math.pow(10, -d) / 2 ? 0 : n; return (r > 0 ? "+" : r < 0 ? "−" : "") + fmt(Math.abs(r), d); }
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? few : many;
  }
  function date(ts) { return new Date(ts).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); }

  var toastBox = null;
  function toast(text, kind, ms) {
    if (typeof document === "undefined") return;
    if (!toastBox) { toastBox = h("div", { class: "toasts", "aria-live": "polite" }); document.body.appendChild(toastBox); }
    var t = h("div", { class: "toast toast--" + (kind || "info") }, text);
    toastBox.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("is-in"); });
    setTimeout(function () { t.classList.remove("is-in"); setTimeout(function () { t.remove(); }, 300); }, ms || 3200);
  }

  function modal(content, opts) {
    opts = opts || {};
    var close = function () { back.classList.remove("is-in"); setTimeout(function () { back.remove(); }, 200); document.removeEventListener("keydown", onKey); if (opts.onClose) opts.onClose(); };
    var onKey = function (e) { if (e.key === "Escape") close(); };
    var box = h("div", { class: "modal" + (opts.wide ? " modal--wide" : ""), role: "dialog", "aria-modal": "true", "aria-label": opts.title || "Окно" },
      h("div", { class: "modal__head" }, h("h3", null, opts.title || ""), h("button", { class: "icon-btn", "aria-label": "Закрыть", onclick: close }, "✕")),
      h("div", { class: "modal__body" }, content));
    var back = h("div", { class: "modal-back", onclick: function (e) { if (e.target === back) close(); } }, box);
    document.body.appendChild(back);
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(function () { back.classList.add("is-in"); });
    return { close: close, el: box };
  }

  var api = { h: h, esc: esc, fmt: fmt, fmtPrice: fmtPrice, signed: signed, plural: plural, date: date, toast: toast, modal: modal };
  CA.dom = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
