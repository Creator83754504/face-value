-- FACE VALUE — миграция 0001: таблица наград.
-- Только ДОБАВЛЯЕТ новую таблицу. Таблицы players и rounds и их данные не меняются.
-- Выполнять один раз в консоли D1 (вкладка Console) ПОСЛЕ вашего разрешения на перенос.
CREATE TABLE IF NOT EXISTS player_rewards (
  user_id      INTEGER NOT NULL,
  reward_id    TEXT    NOT NULL,
  question_id  TEXT    NOT NULL,
  round_id     TEXT    NOT NULL,
  points       INTEGER NOT NULL,
  earned_at    INTEGER NOT NULL,
  PRIMARY KEY (user_id, reward_id)
);
