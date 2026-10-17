/*
 * FACE VALUE — косметические награды за конкретные вопросы. ЕДИНСТВЕННОЕ место, где они описаны.
 *
 * Этот файл читают и сервер (решает, выдать ли награду), и игра (как её показать).
 * Награда привязана к id вопроса, а не к уровню редкости: если редкость вопроса
 * когда-нибудь поменяется, полученная награда останется у игрока.
 *
 * Выдаёт награды ТОЛЬКО сервер — после завершения рейтингового раунда, по очкам,
 * которые он сам посчитал (server/src/game.js). Клиент награды не отправляет и не назначает.
 *
 * Пороги (формула очков не менялась, js/scoring.js):
 *   900 очков — ответ отличается от цены не больше чем на −8,8 % … +9,65 %
 *   950 очков — не больше чем на −4,52 % … +4,73 %
 *
 * kind:
 *   "prefix" — небольшой префикс перед ником в рейтинге (EPIC)
 *   "banner" — анимированный фон строки рейтинга (LEGENDARY)
 */
(function (root) {
  // id награды хранится в базе (player_rewards.reward_id) — НЕ переименовывать после запуска.
  // EPIC — 14 префиксов (от 900 очков), LEGENDARY — 6 баннеров (от 950 очков).
  var REWARDS = {
    "cosmograph": { tier: "EPIC", kind: "prefix", questionId: "rolex-daytona-steel", minPoints: 900, glyph: "◔", label: "Космограф", title: "Точный ответ на вопрос: Rolex Cosmograph Daytona" },
    "perpetual-calendar": { tier: "EPIC", kind: "prefix", questionId: "jw-patek-1518-steel", minPoints: 900, glyph: "✠", label: "Вечный календарь", title: "Точный ответ на вопрос: Patek Philippe 1518 в стали" },
    "golden-adele": { tier: "EPIC", kind: "prefix", questionId: "art-klimt-adele-bloch-bauer-i", minPoints: 900, glyph: "◎", label: "Золотая Адель", title: "Точный ответ на вопрос: «Портрет Адели Блох-Бауэр I» Густава Климта" },
    "montparnasse": { tier: "EPIC", kind: "prefix", questionId: "art-modigliani-nu-couche-2018", minPoints: 900, glyph: "◐", label: "Монпарнас", title: "Точный ответ на вопрос: Nu couché Амедео Модильяни" },
    "auvers-1890": { tier: "EPIC", kind: "prefix", questionId: "art-van-gogh-dr-gachet", minPoints: 900, glyph: "❦", label: "Овер, 1890", title: "Точный ответ на вопрос: «Портрет доктора Гаше» Винсента ван Гога" },
    "berlinetta-lm": { tier: "EPIC", kind: "prefix", questionId: "car-ferrari-250-lm-5893", minPoints: 900, glyph: "▸", label: "Berlinetta LM", title: "Точный ответ на вопрос: Ferrari 250 LM #5893" },
    "nart-spider": { tier: "EPIC", kind: "prefix", questionId: "car-ferrari-275-gtb4-nart-spider", minPoints: 900, glyph: "▸", label: "Спайдер NART", title: "Точный ответ на вопрос: Ferrari 275 GTB/4*S NART Spider" },
    "british-green": { tier: "EPIC", kind: "prefix", questionId: "car-aston-martin-dbr1-1", minPoints: 900, glyph: "▸", label: "Британский зелёный", title: "Точный ответ на вопрос: Aston Martin DBR1/1" },
    "sixth-title": { tier: "EPIC", kind: "prefix", questionId: "tr-ferrari-f2003-ga-schumacher", minPoints: 900, glyph: "❧", label: "Шестой титул", title: "Точный ответ на вопрос: Ferrari F2003-GA Михаэля Шумахера" },
    "monaco-2001": { tier: "EPIC", kind: "prefix", questionId: "tr-ferrari-f2001-schumacher-monaco", minPoints: 900, glyph: "◇", label: "Монако 2001", title: "Точный ответ на вопрос: Ferrari F2001 Михаэля Шумахера" },
    "king-of-monaco": { tier: "EPIC", kind: "prefix", questionId: "tr-mclaren-mp4-8a-senna", minPoints: 900, glyph: "◇", label: "Король Монако", title: "Точный ответ на вопрос: McLaren MP4/8A Айртона Сенны" },
    "easy-rider": { tier: "EPIC", kind: "prefix", questionId: "tr-easy-rider-captain-america", minPoints: 900, glyph: "★", label: "Беспечный ездок", title: "Точный ответ на вопрос: чоппер Captain America" },
    "flying-wing": { tier: "EPIC", kind: "prefix", questionId: "tr-b-2-spirit", minPoints: 900, glyph: "▲", label: "Летающее крыло", title: "Точный ответ на вопрос: B-2 Spirit" },
    "submarine-esprit": { tier: "EPIC", kind: "prefix", questionId: "tr-lotus-esprit-wet-nellie", minPoints: 900, glyph: "≈", label: "Подводный Esprit", title: "Точный ответ на вопрос: Lotus Esprit «Wet Nellie»" },
    "uhlenhaut-night": { tier: "LEGENDARY", kind: "banner", questionId: "car-mercedes-300-slr-uhlenhaut", minPoints: 950, label: "Ночной тест в Штутгарте", title: "Точный ответ на вопрос: Mercedes-Benz 300 SLR Uhlenhaut Coupé" },
    "w196-wind-tunnel": { tier: "LEGENDARY", kind: "banner", questionId: "car-mercedes-w196r-stromlinienwagen", minPoints: 950, label: "Аэродинамическая труба", title: "Точный ответ на вопрос: Mercedes-Benz W196 R Stromlinienwagen" },
    "gto-tuscan-sunset": { tier: "LEGENDARY", kind: "banner", questionId: "car-ferrari-250-gto-3413gt", minPoints: 950, label: "Тосканский закат", title: "Точный ответ на вопрос: Ferrari 250 GTO #3413GT" },
    "vincent-dawn-record": { tier: "LEGENDARY", kind: "banner", questionId: "tr-vincent-black-lightning-1951", minPoints: 950, label: "Рекорд на рассвете", title: "Точный ответ на вопрос: Vincent Black Lightning 1951" },
    "w04-racing-line": { tier: "LEGENDARY", kind: "banner", questionId: "tr-mercedes-w04-hamilton", minPoints: 950, label: "Гоночная траектория", title: "Точный ответ на вопрос: Mercedes F1 W04 Льюиса Хэмилтона" },
    "salvator-sfumato": { tier: "LEGENDARY", kind: "banner", questionId: "art-salvator-mundi", minPoints: 950, label: "Сфумато", title: "Точный ответ на вопрос: Salvator Mundi Леонардо да Винчи" }
  };

  /** Какие награды заслужены ответами раунда: [{ rewardId, questionId, points }]. */
  function earnedFor(questionIds, answers) {
    var out = [];
    Object.keys(REWARDS).forEach(function (id) {
      var r = REWARDS[id];
      for (var i = 0; i < questionIds.length; i++) {
        var a = answers[i];
        if (questionIds[i] === r.questionId && a && typeof a.points === "number" && a.points >= r.minPoints) {
          out.push({ rewardId: id, questionId: r.questionId, points: a.points });
          break;
        }
      }
    });
    return out;
  }

  var api = { REWARDS: REWARDS, earnedFor: earnedFor };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.FV_REWARDS_CONFIG = api;
})(typeof window !== "undefined" ? window : this);
