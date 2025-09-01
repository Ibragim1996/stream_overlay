// lib/bus.ts
import { redis } from '@/lib/redis';
import type { Mode, TaskType, StreamKind } from '@/lib/mode';


/** Канал для конкретного overlay по токену */
export function channelNameForToken(token: string): string {
  return `overlay:${token}`;
}


// Event types
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

export type OverlayEvent = OverlayTaskEvent | OverlayAudienceEvent | OverlayMessageEvent;

/**
 * Кладём событие в очередь канала.
 * Здесь используем LPUSH + EXPIRE; потребитель читает как список.
 * При желании можно заменить на pub/sub/stream — интерфейс тот же.
 */
export async function enqueue(channel: string, ev: OverlayEvent): Promise<void> {
  const key = `bus:${channel}`;
  await redis.lpush(key, JSON.stringify(ev));
  // держим хвост 200 событий и авто-очистку сутки
  await redis.ltrim(key, 0, 199);
  await redis.expire(key, 60 * 60 * 24);
}

// --- Stream API ---
export type BusEvent = OverlayEvent;

export function getRecent(channel: string, count: number): BusEvent[] {
  // This is a stub. Replace with actual Redis logic if needed.
  // For now, returns an empty array.
  return [];
}

export function subscribe(channel: string, cb: (e: BusEvent) => void): () => void {
  // This is a stub. Replace with actual pub/sub logic if needed.
  // Returns an unsubscribe function.
  return () => {};
}