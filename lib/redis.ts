// lib/redis.ts
import { Redis } from '@upstash/redis';

/** ===================== ЛЕНИВЫЙ КЛИЕНТ (без падения на импорте) ===================== */
let _client: Redis | null = null;

/** Возвращает клиент, создавая его при первом обращении (внутри запроса). */
export function getRedis(): Redis {
  if (_client) return _client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Не валим билд: вернём прокси, который бросит понятную ошибку ТОЛЬКО при использовании.
    // Это защищает сборку/пререндер; реальный рантайм без переменных всё равно упадёт по делу.
    return new Proxy({} as unknown as Redis, {
      get() {
        throw new Error('Upstash env missing: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
      },
    }) as unknown as Redis;
  }

  _client = new Redis({ url, token });
  return _client;
}

/** Прокси-объект, который лениво пробрасывает все методы к реальному клиенту. */
export const redis = new Proxy({} as unknown as Redis, {
  get(_t, prop, recv) {
    const inst: any = getRedis();
    const v = Reflect.get(inst, prop, recv);
    return typeof v === 'function' ? v.bind(inst) : v;
  },
}) as unknown as Redis;

/** ===================== ВСПОМОГАТЕЛЬНЫЕ КЛЮЧИ/ХЭШ ===================== */

// Короткий стабильный хэш токена (чтобы не светить реальный токен в ключах)
function stableHashHex(input: string): string {
  let h = 0 >>> 0;
  const bytes = new TextEncoder().encode(input);
  for (let i = 0; i < bytes.length; i++) h = (h * 131 + bytes[i]) >>> 0;
  return h.toString(16).padStart(8, '0');
}

// Канал/неймспейс для оверлея по токену
export function channelNameForToken(token: string): string {
  return `ovl:${stableHashHex(token)}`;
}

// Ключи
const kName       = (t: string) => `u:name:${t}`;               // имя стримера (пример)
const kRecent     = (t: string) => `u:recent:${t}`;             // последние строки/идеи
const kRLMinute   = (t: string) => {
  const d = new Date();
  const bucket =
    d.getUTCFullYear().toString() +
    String(d.getUTCMonth() + 1).padStart(2, '0') +
    String(d.getUTCDate()).padStart(2, '0') +
    String(d.getUTCHours()).padStart(2, '0') +
    String(d.getUTCMinutes()).padStart(2, '0');
  return `rl:${t}:${bucket}`;                                   // rate-limit по минуте (UTC)
};
const kOverlayQueue = (t: string) => `overlay:queue:${t}`;      // очередь событий оверлея

/** ===================== ПРОФИЛЬ (опционально, если используется в коде) ===================== */

export async function setName(token: string, name: string) {
  await redis.set(kName(token), name, { ex: 60 * 60 * 24 * 7 }); // TTL 7 дней
}

export async function getName(token: string): Promise<string | null> {
  return (await redis.get<string | null>(kName(token))) ?? null;
}

/** ===================== RECENT (анти-дубликаты / история) ===================== */

export async function pushRecent(token: string, line: string, keepLast = 24) {
  const key = kRecent(token);
  await redis.lpush(key, line);
  await redis.ltrim(key, 0, keepLast - 1);
  await redis.expire(key, 60 * 60 * 12); // 12 часов
}

export async function getRecent(token: string, limit = 12): Promise<string[]> {
  const key = kRecent(token);
  const raw = (await redis.lrange<string>(key, 0, Math.max(0, limit - 1))) ?? [];
  return raw;
}

/** ===================== SOFT RATE LIMIT (по минутам) ===================== */

export async function rateLimit(
  token: string,
  limitPerMinute = 20
): Promise<{ ok: boolean; retryAfter?: number }> {
  const key = kRLMinute(token);
  const n = Number(await redis.incr(key));
  if (n === 1) await redis.expire(key, 70); // держим ключ ~1 минуту
  if (n > limitPerMinute) {
    const ttl = (await redis.ttl(key)) ?? 60;
    return { ok: false, retryAfter: Math.max(1, ttl) };
  }
  return { ok: true };
}

/** ===================== ОЧЕРЕДЬ СОБЫТИЙ ОВЕРЛЕЯ ===================== */

export type OverlayEvent = { id: string; type: string; payload: unknown; ts: number };

export async function pushOverlayEvent(token: string, event: OverlayEvent, keepLast = 50) {
  const key = kOverlayQueue(channelNameForToken(token));
  const len = await redis.lpush(key, JSON.stringify(event));
  await redis.ltrim(key, 0, keepLast - 1);
  await redis.expire(key, 60 * 60 * 12); // 12 часов
  return Number(len);
}

export async function getOverlayEvents(token: string, limit = 20): Promise<OverlayEvent[]> {
  const key = kOverlayQueue(channelNameForToken(token));
  const raw = (await redis.lrange<string>(key, 0, Math.max(0, limit - 1))) ?? [];
  return raw
    .map((s) => {
      try { return JSON.parse(s) as OverlayEvent; } catch { return null; }
    })
    .filter((x): x is OverlayEvent => x !== null);
}

export async function clearOverlayEvents(token: string) {
  const key = kOverlayQueue(channelNameForToken(token));
  await redis.del(key);
}

/** ===================== KV JSON УТИЛИТЫ ===================== */

export async function setJSON<T>(key: string, value: T, ttlSec?: number) {
  const payload = JSON.stringify(value);
  if (ttlSec && ttlSec > 0) await redis.set(key, payload, { ex: ttlSec });
  else await redis.set(key, payload);
}

export async function getJSON<T>(key: string): Promise<T | null> {
  const raw = (await redis.get<string | null>(key)) ?? null;
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}