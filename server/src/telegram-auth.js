/*
 * Проверка Telegram WebApp initData на сервере.
 * Алгоритм из документации Telegram (core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app):
 *   secret_key        = HMAC_SHA256(key = "WebAppData", data = BOT_TOKEN)
 *   data_check_string = все поля, кроме hash, в виде key=value, отсортированные по ключу, через \n
 *   hash              = hex(HMAC_SHA256(key = secret_key, data = data_check_string))
 *
 * Работает и в Cloudflare Workers, и в Node.js 18+ (через WebCrypto).
 */

const enc = new TextEncoder();

async function hmac(keyBytes, data) {
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

function toHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Сравнение без утечки времени. */
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export class AuthError extends Error {
  constructor(message, code) { super(message); this.code = code; this.status = 401; }
}

/**
 * Проверяет initData и возвращает проверенного пользователя.
 * @returns {Promise<{ id:number, firstName:string, lastName:string, username:string, authDate:number }>}
 */
export async function verifyInitData(initData, botToken, { maxAgeSec = 86400, now = Date.now() } = {}) {
  if (!botToken) throw new AuthError("Сервер не настроен: нет BOT_TOKEN", "server_misconfigured");
  if (typeof initData !== "string" || initData.length === 0 || initData.length > 4096) {
    throw new AuthError("Нет данных авторизации Telegram", "no_init_data");
  }
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash || !/^[0-9a-f]{64}$/.test(hash)) throw new AuthError("Неверная подпись Telegram", "bad_hash");
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = await hmac(enc.encode("WebAppData"), botToken);
  const expected = toHex(await hmac(secretKey, dataCheckString));
  if (!safeEqual(expected, hash)) throw new AuthError("Неверная подпись Telegram", "bad_hash");

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate) || authDate <= 0) throw new AuthError("Нет даты авторизации", "bad_auth_date");
  const ageSec = now / 1000 - authDate;
  if (ageSec > maxAgeSec) throw new AuthError("Сессия Telegram устарела, перезапустите игру", "expired");
  if (ageSec < -300) throw new AuthError("Неверная дата авторизации", "bad_auth_date");

  let user;
  try { user = JSON.parse(params.get("user") || "null"); } catch { user = null; }
  if (!user || !Number.isSafeInteger(user.id) || user.id <= 0) throw new AuthError("Нет данных пользователя", "no_user");

  return {
    id: user.id,
    firstName: String(user.first_name || "").slice(0, 64),
    lastName: String(user.last_name || "").slice(0, 64),
    username: String(user.username || "").slice(0, 64),
    authDate
  };
}

/** Для тестов и локальной разработки: создаёт корректно подписанную initData. */
export async function signInitData(fields, botToken) {
  const params = new URLSearchParams(fields);
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  const secretKey = await hmac(enc.encode("WebAppData"), botToken);
  params.set("hash", toHex(await hmac(secretKey, dataCheckString)));
  return params.toString();
}
