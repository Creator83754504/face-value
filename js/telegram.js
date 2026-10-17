/*
 * FACE VALUE — связка с Telegram Mini Apps.
 *
 * Режимы:
 *  • Обычный браузер — всё ниже тихо пропускается, игра работает как сайт.
 *  • Внутри Telegram — разворачиваем на весь экран, красим шапку в цвет фона,
 *    включаем вибрацию, системную кнопку «Назад» и подтверждения Telegram.
 *
 * Никаких токенов здесь нет и быть не должно: токен бота хранится только на сервере.
 * initData (подпись Telegram) отправляется на сервер, и проверяется ТАМ.
 */
(function (root) {
  var BG = "#0a0a0b";
  var tg = root.Telegram && root.Telegram.WebApp;
  // Скрипт Telegram загружается и в браузере, но initData есть только внутри Telegram
  var inside = !!(tg && tg.initData);
  var backHandler = null;

  function call(fn) {
    try { return fn(); } catch (e) { /* старые версии Telegram не знают некоторые методы */ }
  }
  function atLeast(v) {
    return inside && typeof tg.isVersionAtLeast === "function" && tg.isVersionAtLeast(v);
  }

  function init() {
    var html = document.documentElement;
    if (!inside) { html.classList.add("is-browser"); return; }
    html.classList.add("is-telegram");
    if (tg.platform) html.setAttribute("data-tg-platform", tg.platform);
    call(function () { tg.ready(); });
    call(function () { tg.expand(); });
    if (atLeast("6.1")) {
      call(function () { tg.setHeaderColor(BG); });
      call(function () { tg.setBackgroundColor(BG); });
    }
    if (atLeast("7.10")) call(function () { tg.setBottomBarColor(BG); });
    if (atLeast("7.7")) call(function () { tg.disableVerticalSwipes(); });
    if (atLeast("6.1") && tg.BackButton) {
      call(function () {
        tg.BackButton.onClick(function () { if (backHandler) backHandler(); });
      });
    }
  }

  /** Показать/скрыть системную кнопку «Назад» Telegram. */
  function setBack(handler) {
    backHandler = handler || null;
    if (!(atLeast("6.1") && tg.BackButton)) return;
    call(function () { handler ? tg.BackButton.show() : tg.BackButton.hide(); });
  }

  var haptic = {
    tap: function () {
      if (atLeast("6.1")) call(function () { tg.HapticFeedback.impactOccurred("light"); });
    },
    select: function () {
      if (atLeast("6.1")) call(function () { tg.HapticFeedback.selectionChanged(); });
    },
    result: function (good) {
      if (atLeast("6.1")) call(function () { tg.HapticFeedback.notificationOccurred(good ? "success" : "warning"); });
    },
    error: function () {
      if (atLeast("6.1")) call(function () { tg.HapticFeedback.notificationOccurred("error"); });
    }
  };

  /** Подтверждение: в Telegram — системное окно, иначе — null (приложение покажет своё). */
  function confirm(text, cb) {
    if (atLeast("6.2") && tg.showConfirm) {
      call(function () { tg.showConfirm(text, function (ok) { cb(!!ok); }); });
      return true;
    }
    return false;
  }

  /** Открыть ссылку-источник: в Telegram — встроенным браузером, иначе — новой вкладкой. */
  function openLink(url) {
    if (inside && tg.openLink) call(function () { tg.openLink(url); });
    else root.open(url, "_blank", "noopener,noreferrer");
  }

  /** Имя игрока из Telegram — только для приветствия. Серверу не доверяем этим данным. */
  function firstName() {
    try { return (inside && tg.initDataUnsafe.user && tg.initDataUnsafe.user.first_name) || ""; }
    catch (e) { return ""; }
  }

  /** Подписанная строка initData — отправляется на сервер для проверки. */
  function initData() { return inside ? tg.initData : ""; }

  root.FV_TG = {
    init: init, inside: inside, haptic: haptic, openLink: openLink,
    firstName: firstName, initData: initData, setBack: setBack, confirm: confirm
  };
})(window);
