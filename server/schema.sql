-- FACE VALUE — схема базы данных рейтинга (Cloudflare D1 / SQLite)

-- Игроки и их лучший результат
CREATE TABLE IF NOT EXISTS players (
  user_id      INTEGER PRIMARY KEY,          -- Telegram user.id (из проверенной initData)
  name         TEXT    NOT NULL,             -- имя для таблицы рейтинга
  best         INTEGER NOT NULL DEFAULT 0,   -- лучший результат за раунд (0..5000)
  best_at      INTEGER,                      -- когда установлен рекорд (unix, мс)
  rounds       INTEGER NOT NULL DEFAULT 0,   -- сколько рейтинговых раундов завершено
  updated_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_players_best ON players (best DESC, best_at ASC);

-- Раунды: сервер сам выбирает вопросы и сам считает очки
CREATE TABLE IF NOT EXISTS rounds (
  id            TEXT    PRIMARY KEY,         -- случайный UUID
  user_id       INTEGER NOT NULL,
  question_ids  TEXT    NOT NULL,            -- JSON-массив id вопросов
  answers       TEXT    NOT NULL DEFAULT '[]', -- JSON: [{ guess, points }]
  answers_count INTEGER NOT NULL DEFAULT 0,  -- для защиты от двойной отправки
  total         INTEGER NOT NULL DEFAULT 0,
  status        TEXT    NOT NULL DEFAULT 'active', -- active | finished
  created_at    INTEGER NOT NULL,
  finished_at   INTEGER
);
CREATE INDEX IF NOT EXISTS idx_rounds_user_created ON rounds (user_id, created_at);

-- Косметические награды за точные ответы на конкретные вопросы (см. js/rewards-config.js).
-- Выдаёт только сервер после завершения раунда. Одна награда — один раз на игрока.
CREATE TABLE IF NOT EXISTS player_rewards (
  user_id      INTEGER NOT NULL,             -- Telegram user.id
  reward_id    TEXT    NOT NULL,             -- id награды из js/rewards-config.js
  question_id  TEXT    NOT NULL,             -- за какой вопрос
  round_id     TEXT    NOT NULL,             -- в каком раунде получена
  points       INTEGER NOT NULL,             -- сколько очков было за ответ
  earned_at    INTEGER NOT NULL,             -- когда (unix, мс)
  PRIMARY KEY (user_id, reward_id)
);

-- Выбранное игроком оформление в рейтинге (одна строка на игрока).
-- Нет строки — показывается самая новая награда каждого вида (как раньше).
-- NULL в колонке — игрок сам снял оформление этого вида.
-- Сервер принимает выбор только из наград, которые есть у игрока в player_rewards.
CREATE TABLE IF NOT EXISTS player_cosmetics (
  user_id      INTEGER PRIMARY KEY,          -- Telegram user.id
  prefix       TEXT,                         -- id EPIC-награды или NULL
  banner       TEXT,                         -- id LEGENDARY-награды или NULL
  updated_at   INTEGER NOT NULL
);
