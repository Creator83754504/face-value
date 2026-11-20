/* Детерминированный генератор случайных чисел (mulberry32) — одинаковый seed даёт одинаковые графики. */
(function (g) {
  "use strict";
  var CA = g.CA || (g.CA = {});

  function hashSeed(s) {
    if (typeof s === "number") return s >>> 0;
    var h = 2166136261;
    s = String(s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function create(seed) {
    var a = hashSeed(seed) || 1;
    function next() {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    var spare = null;
    return {
      next: next,
      range: function (min, max) { return min + (max - min) * next(); },
      int: function (min, max) { return Math.floor(min + (max - min + 1) * next()); },
      pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
      chance: function (p) { return next() < p; },
      normal: function () {
        if (spare !== null) { var s = spare; spare = null; return s; }
        var u = 0, v = 0;
        while (u === 0) u = next();
        while (v === 0) v = next();
        var r = Math.sqrt(-2 * Math.log(u)), th = 2 * Math.PI * v;
        spare = r * Math.sin(th);
        return r * Math.cos(th);
      },
      shuffle: function (arr) {
        var a2 = arr.slice();
        for (var i = a2.length - 1; i > 0; i--) { var j = Math.floor(next() * (i + 1)); var t = a2[i]; a2[i] = a2[j]; a2[j] = t; }
        return a2;
      }
    };
  }

  var api = { create: create, hashSeed: hashSeed };
  CA.rng = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
