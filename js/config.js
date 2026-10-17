/*
 * FACE VALUE — настройки клиента.
 *
 * API_BASE — адрес сервера рейтинга, например "https://face-value-api.<имя>.workers.dev".
 *   Пусто ("") — игра работает полностью локально, экран «Рейтинг» показывает,
 *   что сервер ещё не подключён.
 *
 * Здесь НЕТ и не должно быть секретов: токен бота хранится только на сервере
 * (в секретах Cloudflare), а этот файл видит любой игрок.
 */
window.FV_CONFIG = {
  API_BASE: "https://face-value-api.bagdangalimov.workers.dev",
  ROUND_SIZE: 5,
  REQUEST_TIMEOUT_MS: 10000
};
