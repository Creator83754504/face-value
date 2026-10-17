-- FACE VALUE — миграция 0002: выбор оформления в профиле.
-- Только ДОБАВЛЯЕТ новую таблицу. players, rounds и player_rewards не меняются.
-- Выполнять один раз в консоли D1 ПОСЛЕ миграции 0001 и только после вашего разрешения на перенос.
CREATE TABLE IF NOT EXISTS player_cosmetics (
  user_id      INTEGER PRIMARY KEY,
  prefix       TEXT,
  banner       TEXT,
  updated_at   INTEGER NOT NULL
);
