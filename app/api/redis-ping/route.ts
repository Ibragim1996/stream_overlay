// app/api/redis-ping/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (data: unknown, init?: number | ResponseInit) =>
  new Response(JSON.stringify(data), {
    status: typeof init === 'number' ? init : init?.status ?? 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export async function GET(_req: NextRequest) {
  try {
    const { getRedis } = await import('@/lib/redis'); // динамический импорт
    const redis = getRedis();                         // ВНУТРИ хендлера
    const key = `ok`;
    await redis.set(key, 'ok', { ex: 30 });
    const val = await redis.get<string>(key);
    return json({ ok: val === 'ok' });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || 'redis_error' }, 500);
  }
}