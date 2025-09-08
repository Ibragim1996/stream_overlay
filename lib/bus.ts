// lib/bus.ts
import { getRedis, channelNameForToken } from '@/lib/redis';
import type { Mode, TaskType, StreamKind } from '@/lib/mode';

// События оверлея
export type OverlayTaskEvent = {
  type: 'task';
  line: string;
  mode: Mode;
  taskType: TaskType;
  streamKind: StreamKind;
  name?: string;
  ts: number;
};
export type OverlayAudienceEvent = {
  type: 'audience';
  payload: { audience: string };
  ts: number;
};
export type OverlayMessageEvent = {
  type: 'message';
  payload: Record<string, unknown>;
  ts: number;
};

export type BusEvent = OverlayTaskEvent | OverlayAudienceEvent | OverlayMessageEvent;

// Ключ в Redis
const kBus = (channel: string) => `bus:${channel}`;

/** Положить событие в очередь канала */
export async function enqueue(channel: string, ev: BusEvent): Promise<void> {
  const r = getRedis();
  const key = kBus(channel);
  await r.lpush(key, JSON.stringify(ev));
  await r.ltrim(key, 0, 199);
  await r.expire(key, 60 * 60 * 24);
}

/** Последние события канала (LPUSH хранит от новых к старым) */
export async function recentEvents(channel: string, count = 50): Promise<BusEvent[]> {
  const r = getRedis();
  const key = kBus(channel);
  const raw = (await r.lrange<string>(key, 0, Math.max(0, count - 1))) ?? [];
  return raw
    .map((s) => {
      try { return JSON.parse(s) as BusEvent; } catch { return null; }
    })
    .filter((x): x is BusEvent => x !== null);
}

// Экспортируем имя канала наружу (хеш по токену уже внутри lib/redis)
export { channelNameForToken };

// Алиас для совместимости со старым кодом
export { recentEvents as getRecent };