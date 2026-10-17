/*
 * FACE VALUE — показ косметических наград в рейтинге (только отображение).
 *
 * Какие награды есть у игрока, решает СЕРВЕР: в ответе /api/leaderboard у строки может быть
 * поле cosmetics: { prefix, banner } с id наград из js/rewards-config.js. Здесь эти id
 * превращаются в префикс перед ником и анимированный фон строки. Ничего не выдаётся и не сохраняется.
 *
 * Анимации — только CSS (сдвиг и прозрачность), без библиотек. Баннеры вне экрана ставятся на паузу.
 * При системной настройке «уменьшить движение» показывается неподвижный кадр (см. css/rewards.css).
 */
(function (root) {
  var CFG = root.FV_REWARDS_CONFIG || { REWARDS: {} };
  var SVG_NS = "http://www.w3.org/2000/svg";

  // ───── Символы префиксов (10×10). g-line — контур, g-fill — заливка; цвет задаёт css/rewards.css ─────
  var GLYPHS = {
    // ◔ циферблат-счётчик хронографа
    "◔": '<circle class="g-line" cx="5" cy="5" r="4.2"/><path class="g-fill" d="M5,5 L5,0.8 A4.2,4.2 0 0 1 9.2,5 Z"/>',
    // ✠ крест пате (как на циферблатах Calatrava)
    "✠": '<path class="g-fill" d="M3.6,0.7 H6.4 L5.6,4.4 L9.3,3.6 V6.4 L5.6,5.6 L6.4,9.3 H3.6 L4.4,5.6 L0.7,6.4 V3.6 L4.4,4.4 Z"/>',
    // ◎ два круга
    "◎": '<circle class="g-line" cx="5" cy="5" r="4.2"/><circle class="g-fill" cx="5" cy="5" r="1.7"/>',
    // ◐ полукруг
    "◐": '<circle class="g-line" cx="5" cy="5" r="4.2"/><path class="g-fill" d="M5,0.8 A4.2,4.2 0 0 0 5,9.2 Z"/>',
    // ❦ цветочное сердце
    "❦": '<path class="g-fill" d="M5,8.8 C1.6,6.4 0.9,4.4 2.2,3 C3.3,1.9 4.5,2.5 5,3.5 C5.5,2.5 6.7,1.9 7.8,3 C9.1,4.4 8.4,6.4 5,8.8 Z"/><path class="g-line" d="M5,3.4 C5.2,2.2 6,1.2 7.2,0.9"/>',
    // ▸ треугольник-стрелка
    "▸": '<path class="g-fill" d="M2.6,1.8 L8.6,5 L2.6,8.2 Z"/>',
    // ❧ веточка лавра
    "❧": '<path class="g-line" d="M1.6,8.8 C3.6,7.4 5.8,5 8.4,1.2"/><path class="g-fill" d="M3.4,7.4 C2.2,7.4 1.4,6.6 1.2,5.6 C2.4,5.6 3.2,6.4 3.4,7.4 Z M5,5.6 C3.8,5.4 3.2,4.4 3.2,3.4 C4.4,3.6 5,4.6 5,5.6 Z M6.6,3.6 C5.6,3.2 5.2,2.2 5.4,1.2 C6.4,1.6 6.8,2.6 6.6,3.6 Z M5.6,6.6 C6.4,5.8 7.6,5.6 8.6,6 C7.8,6.8 6.6,7 5.6,6.6 Z M7.2,4.4 C7.8,3.6 8.8,3.4 9.6,3.8 C9,4.6 8,4.8 7.2,4.4 Z"/>',
    // ◇ ромб
    "◇": '<path class="g-line" d="M5,0.9 L9.1,5 L5,9.1 L0.9,5 Z"/>',
    // ★ звезда
    "★": '<path class="g-fill" d="M5,0.6 L6.3,3.6 L9.5,3.8 L7,5.9 L7.8,9.1 L5,7.4 L2.2,9.1 L3,5.9 L0.5,3.8 L3.7,3.6 Z"/>',
    // ▲ летающее крыло (силуэт с пилообразной задней кромкой)
    "▲": '<path class="g-fill" d="M5,1.8 L9.7,6.8 L8.2,7.5 L6.9,6.6 L5,7.8 L3.1,6.6 L1.8,7.5 L0.3,6.8 Z"/>',
    // ≈ волны
    "≈": '<path class="g-line" d="M0.8,3.6 C2.2,2.4 3.6,2.4 5,3.6 C6.4,4.8 7.8,4.8 9.2,3.6 M0.8,6.8 C2.2,5.6 3.6,5.6 5,6.8 C6.4,8 7.8,8 9.2,6.8"/>'
  };

  // ───── EPIC: префикс ─────
  function prefixEl(rewardId) {
    var def = CFG.REWARDS[rewardId];
    if (!def || def.kind !== "prefix") return null;
    var span = document.createElement("span");
    span.className = "lb-prefix";
    span.setAttribute("data-reward", rewardId);
    span.title = def.title || def.label;
    var g = document.createElement("span");
    g.className = "lb-prefix__glyph";
    g.setAttribute("aria-hidden", "true");
    // Символ рисуется маленьким SVG, а не шрифтом: «◔ ✠ ❦ ❧ ≈» есть не на всех телефонах.
    g.setAttribute("data-glyph", def.glyph || "");
    g.innerHTML = '<svg viewBox="0 0 10 10" focusable="false">' + (GLYPHS[def.glyph] || GLYPHS["◇"]) + "</svg>";
    var t = document.createElement("span");
    t.className = "lb-prefix__label";
    t.textContent = def.label;
    span.appendChild(g);
    span.appendChild(t);
    return span;
  }

  // ───── LEGENDARY: сцены баннеров ─────
  // Каждая сцена — отдельный SVG. Координаты: ширина 600, высота 56; на узкой строке
  // края обрезаются (xMidYMid slice), поэтому машина въезжает и уезжает за пределы видимого.
  var SCENES = {
    /*
     * «Ночной тест в Штутгарте»: серебристое купе 300 SLR проезжает слева направо по мокрому асфальту.
     * Отражение на дороге, блик по кузову, лёгкая дымка позади. Петля 9 с: пустая улица → проезд → пустая улица.
     */
    "uhlenhaut-night": function (uid) {
      var id = function (n) { return "fv-" + uid + "-" + n; };
      // Профиль купе (вид сбоку, нос справа): длинный капот, кабина смещена назад, короткая покатая корма
      var body =
        "M3,-5 C0,-9 1,-13 6,-15.2 C16,-18.2 28,-20.2 38,-21.2 C44,-24 50,-25.6 56,-25.6 " +
        "C62,-25.6 66,-24 70,-21.2 C80,-18.6 98,-16.6 108,-14.6 C116,-13 120,-10.6 120,-7.6 " +
        "C120,-5.2 118.4,-4 115,-4 L104,-4 A8,8 0 0 0 88,-4 L30,-4 A8,8 0 0 0 14,-4 L5,-4 Z";
      var glass = "M46.5,-21.4 C50.5,-23.8 55,-24.2 59.5,-24 C63,-23.6 65.2,-22.6 67.4,-21.2 Z";
      return '' +
        '<svg xmlns="' + SVG_NS + '" viewBox="0 0 600 56" preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true">' +
          '<defs>' +
            '<linearGradient id="' + id("sky") + '" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0" stop-color="#0d0f12"/><stop offset=".72" stop-color="#14171b"/><stop offset="1" stop-color="#0b0c0e"/>' +
            '</linearGradient>' +
            '<radialGradient id="' + id("lamp") + '">' +
              '<stop offset="0" stop-color="#f2dcae" stop-opacity=".30"/><stop offset="1" stop-color="#f2dcae" stop-opacity="0"/>' +
            '</radialGradient>' +
            '<linearGradient id="' + id("streak") + '" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0" stop-color="#f2dcae" stop-opacity=".09"/><stop offset="1" stop-color="#f2dcae" stop-opacity="0"/>' +
            '</linearGradient>' +
            '<linearGradient id="' + id("paint") + '" x1="0" y1="-26" x2="0" y2="-4" gradientUnits="userSpaceOnUse">' +
              '<stop offset="0" stop-color="#c4c9ce"/><stop offset=".45" stop-color="#7f868d"/><stop offset="1" stop-color="#3a3f45"/>' +
            '</linearGradient>' +
            '<linearGradient id="' + id("refl") + '" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0" stop-color="#b9c0c7" stop-opacity=".26"/><stop offset="1" stop-color="#b9c0c7" stop-opacity="0"/>' +
            '</linearGradient>' +
            '<linearGradient id="' + id("sheen") + '" x1="0" y1="0" x2="1" y2="0">' +
              '<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>' +
            '</linearGradient>' +
            '<linearGradient id="' + id("beam") + '" x1="0" y1="0" x2="1" y2="0">' +
              '<stop offset="0" stop-color="#f6e7c4" stop-opacity=".22"/><stop offset="1" stop-color="#f6e7c4" stop-opacity="0"/>' +
            '</linearGradient>' +
            '<radialGradient id="' + id("haze") + '">' +
              '<stop offset="0" stop-color="#c3c9cf" stop-opacity=".22"/><stop offset="1" stop-color="#c3c9cf" stop-opacity="0"/>' +
            '</radialGradient>' +
            '<clipPath id="' + id("clip") + '"><path d="' + body + '"/></clipPath>' +
          '</defs>' +
          // Ночная улица: фонари вдали и их отражения на мокром асфальте
          '<rect width="600" height="56" fill="url(#' + id("sky") + ')"/>' +
          '<g class="rw-lamps">' +
            '<ellipse cx="120" cy="12" rx="34" ry="14" fill="url(#' + id("lamp") + ')"/>' +
            '<ellipse cx="330" cy="9" rx="30" ry="12" fill="url(#' + id("lamp") + ')"/>' +
            '<ellipse cx="520" cy="13" rx="34" ry="14" fill="url(#' + id("lamp") + ')"/>' +
          '</g>' +
          '<g class="rw-streaks">' +
            '<rect x="117" y="43" width="6" height="13" fill="url(#' + id("streak") + ')"/>' +
            '<rect x="327.5" y="43" width="5" height="13" fill="url(#' + id("streak") + ')"/>' +
            '<rect x="517" y="43" width="6" height="13" fill="url(#' + id("streak") + ')"/>' +
          '</g>' +
          '<rect x="0" y="42.4" width="600" height=".6" fill="#ffffff" fill-opacity=".06"/>' +
          // Дымка, которая остаётся на дороге после проезда и тает
          '<ellipse class="rw-haze-world" cx="300" cy="36" rx="90" ry="9" fill="url(#' + id("haze") + ')"/>' +
          // Машина: отражение + кузов + блик. Начало координат — задняя точка на линии дороги
          '<g class="rw-car" opacity=".82">' +
            '<g transform="translate(0 43)">' +
              '<path class="rw-beam" d="M118,-9 L190,-15 L190,-1 Z" fill="url(#' + id("beam") + ')"/>' +
              '<g class="rw-puffs">' +
                '<ellipse cx="-6" cy="-6" rx="12" ry="4.5" fill="url(#' + id("haze") + ')"/>' +
                '<ellipse cx="-22" cy="-8" rx="16" ry="6" fill="url(#' + id("haze") + ')"/>' +
              '</g>' +
              '<g transform="scale(1 -1)" opacity=".9">' +
                '<path d="' + body + '" fill="url(#' + id("refl") + ')"/>' +
              '</g>' +
              '<path d="' + body + '" fill="url(#' + id("paint") + ')"/>' +
              '<path d="' + glass + '" fill="#1b1f24"/>' +
              '<path d="M10,-11.6 C40,-12.6 80,-12 113,-10.4" fill="none" stroke="#ffffff" stroke-opacity=".28" stroke-width=".6"/>' +
              '<path d="M46.2,-21 L47,-6.5" fill="none" stroke="#2d3238" stroke-opacity=".7" stroke-width=".5"/>' +
              '<g clip-path="url(#' + id("clip") + ')">' +
                '<g transform="skewX(-18)"><rect class="rw-sheen" x="-30" y="-30" width="18" height="30" fill="url(#' + id("sheen") + ')"/></g>' +
              '</g>' +
              '<circle cx="96" cy="-5" r="6.4" fill="#0c0e10"/><circle cx="96" cy="-5" r="2.6" fill="#8d949b"/>' +
              '<circle cx="22" cy="-5" r="6.4" fill="#0c0e10"/><circle cx="22" cy="-5" r="2.6" fill="#8d949b"/>' +
              '<ellipse cx="117.6" cy="-9.6" rx="1.6" ry="1.2" fill="#f7e8c6"/>' +
              '<ellipse cx="2.6" cy="-11" rx=".9" ry="1.1" fill="#8b2b25"/>' +
            '</g>' +
          '</g>' +
        '</svg>';
    },

    /*
     * «Аэродинамическая труба» — W196 R Stromlinienwagen. Машина стоит в трубе, обтекаемый кузов
     * медленно проявляется из полумрака; тонкие линии потока огибают его и текут от носа к корме,
     * за кормой — завихрения. Лёгкое зерно и тёплый оттенок архивной плёнки 1950-х. Петля 8 с.
     */
    "w196-wind-tunnel": function (uid) {
      var id = function (n) { return "fv-" + uid + "-" + n; };
      var body =
        "M0,-3 C0,-6 1,-8 4,-9.5 C10,-12 16,-14 24,-15.5 C34,-17 46,-17.6 58,-18 C62,-18.2 64,-19.5 66,-21 " +
        "C68,-23 72,-23.6 76,-23 C79,-22.4 81,-20.5 82,-18.6 C92,-16.8 104,-14 114,-11 C122,-8.5 128,-6 128,-3.5 " +
        "C128,-2.2 127,-1.5 125,-1.5 L3,-1.5 C1,-1.5 0,-2 0,-3 Z";
      var streams = [
        "M0,36 C150,36 200,36 226,35 C238,33 252,29 270,27 C290,25 296,21 306,20 C318,19 330,25 350,30 C362,33 372,35 382,35 C450,36 520,36 600,36",
        "M0,26 C190,26 230,26 258,22 C284,18 300,15 310,15 C326,15 346,20 370,24 C400,27 450,26 600,26",
        "M0,17 C220,17 262,16 290,12 C305,10 318,10 330,12 C360,16 420,17 600,17",
        "M0,9 C240,9 280,8 305,6.5 C320,6 340,7 360,8 C420,9 500,9 600,9",
        "M236,40 C226,38 222,33 214,34 C206,35 208,39 198,38 C186,37 176,36 150,37"
      ];
      return '' +
        '<svg xmlns="' + SVG_NS + '" viewBox="0 0 600 56" preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true">' +
          '<defs>' +
            '<linearGradient id="' + id("bg") + '" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0" stop-color="#0f1215"/><stop offset=".7" stop-color="#171b20"/><stop offset="1" stop-color="#0d0f11"/>' +
            '</linearGradient>' +
            '<linearGradient id="' + id("alu") + '" x1="0" y1="-24" x2="0" y2="-1" gradientUnits="userSpaceOnUse">' +
              '<stop offset="0" stop-color="#d9dee2"/><stop offset=".5" stop-color="#8f979f"/><stop offset="1" stop-color="#454b52"/>' +
            '</linearGradient>' +
            '<linearGradient id="' + id("refl") + '" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0" stop-color="#b9c0c7" stop-opacity=".18"/><stop offset="1" stop-color="#b9c0c7" stop-opacity="0"/>' +
            '</linearGradient>' +
            '<pattern id="' + id("grain") + '" width="7" height="5" patternUnits="userSpaceOnUse">' +
              '<rect x="1" y="1" width=".8" height=".8" fill="#fff" fill-opacity=".07"/><rect x="4.5" y="3.2" width=".7" height=".7" fill="#fff" fill-opacity=".05"/>' +
            '</pattern>' +
          '</defs>' +
          '<rect width="600" height="56" fill="url(#' + id("bg") + ')"/>' +
          '<rect x="0" y="45.6" width="600" height=".6" fill="#fff" fill-opacity=".07"/>' +
          '<g transform="translate(44 0)">' +
          '<g class="rw-flow" fill="none" stroke="#a9bccb" stroke-opacity=".42" stroke-width=".7" stroke-linecap="round">' +
            streams.map(function (d, i) { return '<path class="rw-stream' + (i === 4 ? ' rw-wake' : '') + '" d="' + d + '" stroke-dasharray="7 9"/>'; }).join("") +
          '</g>' +
          '<g class="rw-w196" transform="translate(236 46)">' +
            '<g transform="scale(1 -1)"><path d="' + body + '" fill="url(#' + id("refl") + ')"/></g>' +
            '<path d="' + body + '" fill="url(#' + id("alu") + ')"/>' +
            '<ellipse cx="24" cy="-6.5" rx="11" ry="6" fill="none" stroke="#2a2f35" stroke-opacity=".55" stroke-width=".6"/>' +
            '<ellipse cx="102" cy="-6" rx="11" ry="5.6" fill="none" stroke="#2a2f35" stroke-opacity=".55" stroke-width=".6"/>' +
            '<ellipse cx="72.5" cy="-19.4" rx="4.2" ry="1.4" fill="#1a1e23"/>' +
            '<path d="M8,-10.5 C40,-15.6 80,-15.2 120,-7.5" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width=".55"/>' +
          '</g>' +
          '</g>' +
          '<rect class="rw-grain" width="600" height="56" fill="url(#' + id("grain") + ')"/>' +
          '<rect width="600" height="56" fill="#b0874f" fill-opacity=".05"/>' +
        '</svg>';
    },

    /*
     * «Тосканский закат» — Ferrari 250 GTO #3413GT. Низкое солнце над холмами с кипарисами,
     * красный GTO проходит по дороге, тёплый блик скользит по заднему крылу, из-под колёс
     * поднимается и оседает пыль. Петля 9 с: пустая дорога → проезд → пустая дорога.
     */
    "gto-tuscan-sunset": function (uid) {
      var id = function (n) { return "fv-" + uid + "-" + n; };
      var body =
        "M2,-6 L3,-13 C3,-15 5,-16 8,-16.5 C18,-18 30,-21 40,-23 C46,-25 54,-25 60,-23.5 C64,-22 68,-19.5 72,-18 " +
        "C84,-16.5 100,-14.5 110,-12 C116,-10.5 119,-8.5 119,-6 C119,-4.5 117,-4 114,-4 L104,-4 A8,8 0 0 0 88,-4 " +
        "L30,-4 A8,8 0 0 0 14,-4 L5,-4 Z";
      var glass = "M42,-21.6 C47,-23.6 54,-23.8 59,-22.6 C62,-21.6 64.6,-20.4 66.8,-19 L42,-19 Z";
      return '' +
        '<svg xmlns="' + SVG_NS + '" viewBox="0 0 600 56" preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true">' +
          '<defs>' +
            '<linearGradient id="' + id("sky") + '" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0" stop-color="#1a1310"/><stop offset=".38" stop-color="#3a2317"/><stop offset=".62" stop-color="#7a4b25"/><stop offset=".72" stop-color="#2c2416"/><stop offset="1" stop-color="#14120c"/>' +
            '</linearGradient>' +
            '<radialGradient id="' + id("sun") + '">' +
              '<stop offset="0" stop-color="#ffd59a" stop-opacity=".75"/><stop offset=".25" stop-color="#f3b46a" stop-opacity=".35"/><stop offset="1" stop-color="#f3b46a" stop-opacity="0"/>' +
            '</radialGradient>' +
            '<linearGradient id="' + id("paint") + '" x1="0" y1="-25" x2="0" y2="-4" gradientUnits="userSpaceOnUse">' +
              '<stop offset="0" stop-color="#b8493a"/><stop offset=".5" stop-color="#7f2219"/><stop offset="1" stop-color="#3a0f0b"/>' +
            '</linearGradient>' +
            '<linearGradient id="' + id("sheen") + '" x1="0" y1="0" x2="1" y2="0">' +
              '<stop offset="0" stop-color="#ffd59a" stop-opacity="0"/><stop offset=".5" stop-color="#ffd59a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd59a" stop-opacity="0"/>' +
            '</linearGradient>' +
            '<radialGradient id="' + id("dust") + '">' +
              '<stop offset="0" stop-color="#c9a27a" stop-opacity=".32"/><stop offset="1" stop-color="#c9a27a" stop-opacity="0"/>' +
            '</radialGradient>' +
            '<clipPath id="' + id("clip") + '"><path d="' + body + '"/></clipPath>' +
          '</defs>' +
          '<rect width="600" height="56" fill="url(#' + id("sky") + ')"/>' +
          '<circle class="rw-sun" cx="430" cy="33" r="34" fill="url(#' + id("sun") + ')"/>' +
          '<path d="M0,38 C60,33 120,31 180,34 C240,37 300,32 360,30 C420,28 480,33 540,31 C570,30 590,31 600,32 L600,56 L0,56 Z" fill="#2a2819" fill-opacity=".92"/>' +
          '<g fill="#15140e">' +
            '<ellipse cx="352" cy="24.5" rx="2.1" ry="7.5"/><ellipse cx="359" cy="26" rx="1.8" ry="6"/><ellipse cx="365" cy="27.5" rx="1.5" ry="4.8"/>' +
          '</g>' +
          '<path d="M0,44 C80,40 160,41 240,43 C320,45 400,41 480,42 C540,43 580,42 600,43 L600,56 L0,56 Z" fill="#1b1a12"/>' +
          '<rect x="0" y="47.2" width="600" height=".6" fill="#ffd59a" fill-opacity=".08"/>' +
          '<ellipse class="rw-dust-world" cx="300" cy="44" rx="80" ry="6" fill="url(#' + id("dust") + ')"/>' +
          '<g class="rw-gto">' +
            '<g transform="translate(0 47)">' +
              '<g class="rw-gto-dust">' +
                '<ellipse cx="-8" cy="-4" rx="14" ry="4.5" fill="url(#' + id("dust") + ')"/>' +
                '<ellipse cx="-26" cy="-6" rx="18" ry="6.5" fill="url(#' + id("dust") + ')"/>' +
              '</g>' +
              '<path d="' + body + '" fill="url(#' + id("paint") + ')"/>' +
              '<path d="' + glass + '" fill="#1d1210"/>' +
              '<rect x="80" y="-12" width="1.1" height="4.2" rx=".5" fill="#2a0b08"/><rect x="82.6" y="-12" width="1.1" height="4.2" rx=".5" fill="#2a0b08"/><rect x="85.2" y="-12" width="1.1" height="4.2" rx=".5" fill="#2a0b08"/>' +
              '<path d="M8,-12.4 C40,-13.6 80,-12.6 112,-10" fill="none" stroke="#ffd59a" stroke-opacity=".22" stroke-width=".5"/>' +
              '<g clip-path="url(#' + id("clip") + ')"><g transform="skewX(-18)"><rect class="rw-gto-sheen" x="-30" y="-30" width="16" height="30" fill="url(#' + id("sheen") + ')"/></g></g>' +
              '<circle cx="96" cy="-5" r="6.3" fill="#120d0b"/><circle cx="96" cy="-5" r="4" fill="none" stroke="#b9a58a" stroke-opacity=".6" stroke-width=".6"/>' +
              '<circle cx="22" cy="-5" r="6.3" fill="#120d0b"/><circle cx="22" cy="-5" r="4" fill="none" stroke="#b9a58a" stroke-opacity=".6" stroke-width=".6"/>' +
            '</g>' +
          '</g>' +
        '</svg>';
    },

    /*
     * «Рекорд на рассвете» — Vincent Black Lightning 1951. Бледный рассвет над прямой дорогой,
     * чёрный мотоцикл с гонщиком, лежащим на баке, проносится как длинная выдержка; луч
     * фотоловушки секундомера вспыхивает на долю секунды, пыль медленно гаснет. Петля 8 с.
     */
    "vincent-dawn-record": function (uid) {
      var id = function (n) { return "fv-" + uid + "-" + n; };
      var rider =
        "M8,-11 L18,-14 C24,-16.5 30,-18.5 37,-19.5 C41,-20 44,-20.5 47,-19.6 C50,-18.8 50.5,-17 49,-16 " +
        "L54,-15 L57,-12.5 L52,-11 L44,-10 L42,-7 L22,-7 L18,-9.5 Z";
      return '' +
        '<svg xmlns="' + SVG_NS + '" viewBox="0 0 600 56" preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true">' +
          '<defs>' +
            '<linearGradient id="' + id("sky") + '" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0" stop-color="#11151d"/><stop offset=".45" stop-color="#2a303b"/><stop offset=".7" stop-color="#7d7466"/><stop offset=".72" stop-color="#22232a"/><stop offset="1" stop-color="#131418"/>' +
            '</linearGradient>' +
            '<radialGradient id="' + id("dawn") + '">' +
              '<stop offset="0" stop-color="#f1dcae" stop-opacity=".4"/><stop offset="1" stop-color="#f1dcae" stop-opacity="0"/>' +
            '</radialGradient>' +
            '<linearGradient id="' + id("streak") + '" x1="0" y1="0" x2="1" y2="0">' +
              '<stop offset="0" stop-color="#e8e0cc" stop-opacity="0"/><stop offset="1" stop-color="#e8e0cc" stop-opacity=".28"/>' +
            '</linearGradient>' +
            '<radialGradient id="' + id("dust") + '">' +
              '<stop offset="0" stop-color="#b8ad98" stop-opacity=".28"/><stop offset="1" stop-color="#b8ad98" stop-opacity="0"/>' +
            '</radialGradient>' +
            '<linearGradient id="' + id("beam") + '" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0" stop-color="#f6e6b8" stop-opacity="0"/><stop offset=".5" stop-color="#f6e6b8" stop-opacity=".9"/><stop offset="1" stop-color="#f6e6b8" stop-opacity="0"/>' +
            '</linearGradient>' +
          '</defs>' +
          '<rect width="600" height="56" fill="url(#' + id("sky") + ')"/>' +
          '<ellipse cx="80" cy="39" rx="120" ry="22" fill="url(#' + id("dawn") + ')"/>' +
          '<ellipse class="rw-mist" cx="300" cy="38.5" rx="320" ry="3" fill="#cfc6b3" fill-opacity=".09"/>' +
          '<rect x="0" y="40.2" width="600" height="9" fill="#1c1e23"/>' +
          '<rect x="0" y="40.2" width="600" height=".5" fill="#f1dcae" fill-opacity=".12"/>' +
          '<g fill="#0c0d10">' +
            '<rect x="287" y="27" width="1.2" height="16"/><rect x="312" y="27" width="1.2" height="16"/>' +
            '<rect x="285.5" y="26" width="4.2" height="1.6"/><rect x="310.5" y="26" width="4.2" height="1.6"/>' +
          '</g>' +
          '<rect class="rw-beam" x="288" y="28.2" width="25.4" height="1.1" fill="url(#' + id("beam") + ')"/>' +
          '<ellipse class="rw-trail-dust" cx="300" cy="45" rx="150" ry="4" fill="url(#' + id("dust") + ')"/>' +
          '<g class="rw-bike">' +
            '<g transform="translate(0 47)">' +
              '<ellipse cx="-50" cy="-11" rx="62" ry="5.5" fill="url(#' + id("streak") + ')"/>' +
              '<path d="' + rider + '" fill="#0a0a0c"/>' +
              '<path d="M22,-8 L4,-8.6" fill="none" stroke="#9a948a" stroke-opacity=".7" stroke-width=".7"/>' +
              '<circle cx="10" cy="-6.5" r="6.5" fill="#0a0a0c"/><circle cx="10" cy="-6.5" r="5.6" fill="none" stroke="#b8b2a6" stroke-opacity=".55" stroke-width=".5"/>' +
              '<circle cx="50" cy="-6.5" r="6.5" fill="#0a0a0c"/><circle cx="50" cy="-6.5" r="5.6" fill="none" stroke="#b8b2a6" stroke-opacity=".55" stroke-width=".5"/>' +
            '</g>' +
          '</g>' +
        '</svg>';
    },

    /*
     * «Гоночная траектория» — Mercedes F1 W04 Льюиса Хэмилтона. Едва видимая условная схема
     * трассы (по мотивам Хунгароринга), по ней бежит бирюзовая точка телеметрии со шлейфом;
     * серебристый болид проходит внизу строки, за ним дрожит горячий воздух. Петля 8 с.
     */
    "w04-racing-line": function (uid) {
      var id = function (n) { return "fv-" + uid + "-" + n; };
      var track =
        "M70,33 L298,33 C316,33 324,27 320,21 C316,15 304,15 298,19 C290,24 278,23 274,17 C270,11 278,7 290,7 " +
        "L468,7 C490,7 498,13 492,20 C486,27 474,25 468,29 C462,34 474,37 490,35 L520,33 C538,31 546,25 540,19 " +
        "C534,13 522,13 516,17 L506,9 C500,4 490,3 480,3 L120,3 C96,3 84,8 80,14 L64,24 C60,28 62,33 70,33 Z";
      var car =
        "M2,-4 L2,-15 L5,-15 L5,-12.5 L14,-12.5 L16,-10 C24,-10.5 30,-13 38,-15.5 L46,-16 C50,-16 52,-14.5 54,-12 " +
        "L62,-11.5 C76,-10.8 92,-9.6 104,-8.6 C112,-8 118,-7 122,-5.5 L126,-3.5 L128,-3.5 L128,-1.8 L96,-1.8 L30,-2.2 L4,-2.6 Z";
      return '' +
        '<svg xmlns="' + SVG_NS + '" viewBox="0 0 600 56" preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true">' +
          '<defs>' +
            '<linearGradient id="' + id("bg") + '" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0" stop-color="#0b0d0e"/><stop offset="1" stop-color="#121617"/>' +
            '</linearGradient>' +
            '<linearGradient id="' + id("silver") + '" x1="0" y1="-16" x2="0" y2="-2" gradientUnits="userSpaceOnUse">' +
              '<stop offset="0" stop-color="#cdd3d8"/><stop offset=".55" stop-color="#8a9299"/><stop offset="1" stop-color="#3f454b"/>' +
            '</linearGradient>' +
            '<radialGradient id="' + id("heat") + '">' +
              '<stop offset="0" stop-color="#cfd6da" stop-opacity=".16"/><stop offset="1" stop-color="#cfd6da" stop-opacity="0"/>' +
            '</radialGradient>' +
          '</defs>' +
          '<rect width="600" height="56" fill="url(#' + id("bg") + ')"/>' +
          '<path d="' + track + '" pathLength="100" fill="none" stroke="#9aa3a8" stroke-opacity=".16" stroke-width=".8" stroke-linejoin="round"/>' +
          '<path class="rw-trail" d="' + track + '" pathLength="100" fill="none" stroke="#3fa9a3" stroke-opacity=".38" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="14 86"/>' +
          '<path class="rw-dot" d="' + track + '" pathLength="100" fill="none" stroke="#7fd8d1" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="0.4 99.6"/>' +
          '<rect x="0" y="47.4" width="600" height=".5" fill="#fff" fill-opacity=".06"/>' +
          '<g class="rw-w04">' +
            '<g transform="translate(0 47)">' +
              '<g class="rw-heat"><ellipse cx="-10" cy="-8" rx="16" ry="4" fill="url(#' + id("heat") + ')"/><ellipse cx="-28" cy="-9" rx="14" ry="3.4" fill="url(#' + id("heat") + ')"/></g>' +
              '<path d="' + car + '" fill="url(#' + id("silver") + ')"/>' +
              '<path d="M30,-7.5 C50,-8.6 80,-8.2 104,-6.6" fill="none" stroke="#3fa9a3" stroke-opacity=".8" stroke-width=".9"/>' +
              '<circle cx="50" cy="-13.6" r="2" fill="#cdbb63" fill-opacity=".85"/>' +
              '<circle cx="20" cy="-6.6" r="6.8" fill="#0a0b0c"/><circle cx="20" cy="-6.6" r="3" fill="none" stroke="#5b6268" stroke-width=".5"/>' +
              '<circle cx="98" cy="-5.8" r="5.9" fill="#0a0b0c"/><circle cx="98" cy="-5.8" r="2.6" fill="none" stroke="#5b6268" stroke-width=".5"/>' +
            '</g>' +
          '</g>' +
        '</svg>';
    },

    /*
     * «Сфумато» — Salvator Mundi, Леонардо да Винчи. Тёплая тьма, мягкие складки лазурной ткани
     * и прозрачная хрустальная сфера. Медленный луч музейного света проходит справа налево:
     * сфера вспыхивает преломлением, складки проступают из тени и снова растворяются. Петля 9 с.
     * Это абстрактная сцена по мотивам картины, без изображения лица.
     */
    "salvator-sfumato": function (uid) {
      var id = function (n) { return "fv-" + uid + "-" + n; };
      return '' +
        '<svg xmlns="' + SVG_NS + '" viewBox="0 0 600 56" preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true">' +
          '<defs>' +
            '<radialGradient id="' + id("bg") + '" cx=".5" cy=".5" r=".7">' +
              '<stop offset="0" stop-color="#2a1d14"/><stop offset=".6" stop-color="#1a120c"/><stop offset="1" stop-color="#0e0906"/>' +
            '</radialGradient>' +
            '<linearGradient id="' + id("lapis") + '" x1="0" y1="0" x2="1" y2="1">' +
              '<stop offset="0" stop-color="#2a4c86"/><stop offset=".6" stop-color="#16294f"/><stop offset="1" stop-color="#0c1630"/>' +
            '</linearGradient>' +
            '<radialGradient id="' + id("orb") + '" cx=".42" cy=".38" r=".62">' +
              '<stop offset="0" stop-color="#e3eaee" stop-opacity=".3"/><stop offset=".7" stop-color="#7f909c" stop-opacity=".1"/><stop offset="1" stop-color="#7f909c" stop-opacity=".02"/>' +
            '</radialGradient>' +
            '<radialGradient id="' + id("light") + '">' +
              '<stop offset="0" stop-color="#f1d8a8" stop-opacity=".34"/><stop offset=".5" stop-color="#f1d8a8" stop-opacity=".12"/><stop offset="1" stop-color="#f1d8a8" stop-opacity="0"/>' +
            '</radialGradient>' +
          '</defs>' +
          '<rect width="600" height="56" fill="url(#' + id("bg") + ')"/>' +
          '<g class="rw-drapery" fill="url(#' + id("lapis") + ')">' +
            '<path d="M120,56 C150,36 180,20 230,10 C250,7 262,12 250,18 C220,30 196,44 186,56 Z" fill-opacity=".7"/>' +
            '<path d="M178,56 C200,40 236,26 280,18 C298,15 304,20 292,26 C262,38 244,48 238,56 Z" fill-opacity=".55"/>' +
            '<path d="M232,56 C256,44 290,34 326,30 C340,29 342,34 332,38 C306,46 290,52 286,56 Z" fill-opacity=".45"/>' +
            '<path d="M150,0 C170,8 196,12 236,8 C256,6 262,2 260,0 Z" fill-opacity=".35"/>' +
            '<path d="M196,28 C226,20 252,16 276,17" fill="none" stroke="#9db5dc" stroke-opacity=".18" stroke-width=".6"/>' +
          '</g>' +
          '<g class="rw-orb">' +
            '<circle cx="400" cy="28" r="15" fill="url(#' + id("orb") + ')" stroke="#cfd8de" stroke-opacity=".35" stroke-width=".6"/>' +
            '<ellipse cx="402" cy="32.5" rx="9" ry="3.6" fill="#e6edf1" fill-opacity=".12"/>' +
            '<path d="M391,21 C393,17.5 397,15.6 401,15.6" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width=".7" stroke-linecap="round"/>' +
          '</g>' +
          '<circle class="rw-glint" cx="394" cy="22" r="1.3" fill="#fff"/>' +
          '<ellipse class="rw-light" cx="300" cy="28" rx="150" ry="60" fill="url(#' + id("light") + ')"/>' +
        '</svg>';
    }
  };

  var uidCounter = 0;
  function bannerEl(rewardId) {
    var def = CFG.REWARDS[rewardId];
    if (!def || def.kind !== "banner" || !SCENES[rewardId]) return null;
    var wrap = document.createElement("div");
    wrap.className = "lb-banner";
    wrap.setAttribute("data-reward", rewardId);
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = SCENES[rewardId](++uidCounter); // разметка целиком наша, без данных игрока
    return wrap;
  }

  // Пауза анимации, когда строка не видна на экране — бережём батарею в Telegram WebView
  var observer = null;
  function watch(li) {
    if (typeof IntersectionObserver === "undefined") return;
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.target.classList.toggle("is-offscreen", !e.isIntersecting); });
      });
    }
    observer.observe(li);
  }

  /** Добавляет косметику в готовую строку рейтинга. Без cosmetics строка остаётся как была. */
  function decorateRow(li, nameEl, cosmetics) {
    if (!cosmetics) return;
    var p = cosmetics.prefix && prefixEl(cosmetics.prefix);
    if (p) {
      // Текст ника — в отдельный элемент, чтобы длинный ник обрезался многоточием, а префикс оставался
      var text = document.createElement("span");
      text.className = "lb-name__text";
      while (nameEl.firstChild) text.appendChild(nameEl.firstChild);
      nameEl.classList.add("has-prefix");
      nameEl.appendChild(p);
      nameEl.appendChild(text);
    }
    var b = cosmetics.banner && bannerEl(cosmetics.banner);
    if (b) {
      li.classList.add("has-banner");
      li.insertBefore(b, li.firstChild);
      watch(li);
    }
  }

  /** id LEGENDARY-баннера, привязанного к вопросу (или null). Только существующие привязки из rewards-config.js. */
  function bannerForQuestion(questionId) {
    var ids = Object.keys(CFG.REWARDS);
    for (var i = 0; i < ids.length; i++) {
      var r = CFG.REWARDS[ids[i]];
      if (r.kind === "banner" && r.questionId === questionId) return ids[i];
    }
    return null;
  }

  /** Превью награды вне рейтинга: префикс — как у ника, баннер — узкая полоска со сценой. */
  function previewEl(rewardId) {
    var def = CFG.REWARDS[rewardId];
    if (!def) return null;
    if (def.kind === "prefix") {
      var wrap = document.createElement("span");
      wrap.className = "rw-preview rw-preview--prefix";
      wrap.appendChild(prefixEl(rewardId));
      return wrap;
    }
    var strip = document.createElement("div");
    strip.className = "rw-preview rw-preview--banner";
    var b = bannerEl(rewardId);
    if (b) strip.appendChild(b);
    watch(strip);
    return strip;
  }

  root.FV_REWARDS = {
    decorateRow: decorateRow, prefixEl: prefixEl, bannerEl: bannerEl, previewEl: previewEl,
    bannerForQuestion: bannerForQuestion, watch: watch, SCENES: SCENES, GLYPHS: GLYPHS
  };
})(window);
