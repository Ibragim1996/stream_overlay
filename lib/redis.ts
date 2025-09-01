// lib/redis.ts
import { Redis } from "@upstash/redis";

// === client ===
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
  throw new Error(
    "UPSTASH_REDIS_REST_URL или UPSTASH_REDIS_REST_TOKEN не заданы. Проверь .env.local и перезапусти dev-сервер."
  );
}
export const redis = new Redis({ url, token });

// === keys ===
const kName     = (t: string) => `u:name:${t}`;
const kRecent   = (t: string) => `u:recent:${t}`;          // LPUSH последние N
const kRLMinute = (t: string) => {
  const d = new Date();
  const bucket =
    d.getUTCFullYear().toString() +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    String(d.getUTCDate()).padStart(2, "0") +
    String(d.getUTCHours()).padStart(2, "0") +
    String(d.getUTCMinutes()).padStart(2, "0");
  return `rl:${t}:${bucket}`;
};

// === profile ===
export async function setName(token: string, name: string) {
  await redis.set(kName(token), name, { ex: 60 * 60 * 24 * 7 });
}
export async function getName(token: string): Promise<string | null> {
  return (await redis.get<string>(kName(token))) ?? null;
}

// === recent tasks ===
export async function pushRecent(token: string, task: string, keepLast = 20) {
  const key = kRecent(token);
  await redis.lpush(key, task);
  await redis.ltrim(key, 0, keepLast - 1);
}
export async function getRecent(token: string, limit = 20): Promise<string[]> {
  const key = kRecent(token);
  return (await redis.lrange<string>(key, 0, Math.max(0, limit - 1))) ?? [];
}

// === rate limit (per-minute) ===
export async function rateLimit(
  token: string,
  limitPerMinute = 20
): Promise<{ ok: boolean; retryAfter?: number }> {
  const key = kRLMinute(token);
  const n = await redis.incr(key);
  // держим ключ 70 сек, чтобы минутное окно само гасло
  if (n === 1) await redis.expire(key, 70);
  if (n > limitPerMinute) {
    const ttl = (await redis.ttl(key)) ?? 60;
    return { ok: false, retryAfter: ttl > 0 ? ttl : 60 };
  }
  return { ok: true };
}

// === overlay events queue (для тестов и будущих фич) ===
function kOverlayQueue(t: string) { return `overlay:queue:${t}`; }

export type OverlayEvent = {
  id: string;       // nanoid/uuid
  type: string;     // "task" | "friend" | "tts" | ...
  payload: unknown; // произвольные данные
  ts: number;       // ms
};

export async function pushOverlayEvent(
  token: string,
  event: OverlayEvent,
  keepLast = 50
) {
  const key = kOverlayQueue(token);
  const len = await redis.lpush(key, JSON.stringify(event));
  await redis.ltrim(key, 0, keepLast - 1);
  return len;
}

export async function getOverlayEvents(token: string, limit = 20): Promise<OverlayEvent[]> {
  const key = kOverlayQueue(token);
  const raw = await redis.lrange<string>(key, 0, Math.max(0, limit - 1));
  return raw
    .map((s) => { try { return JSON.parse(s) as OverlayEvent; } catch { return null; } })
    .filter((x): x is OverlayEvent => x !== null);
}

export async function clearOverlayEvents(token: string) {
  await redis.del(kOverlayQueue(token));
}

// === generic JSON helpers ===
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