// app/api/events/toggle/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (data: unknown, init?: number | ResponseInit) =>
  new Response(JSON.stringify(data), {
    status: typeof init === 'number' ? init : init?.status ?? 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
    },
  });

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'authorization, content-type',
      'access-control-max-age': '600',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, any>;

    // токен
    const hdr = req.headers.get('authorization') ?? req.headers.get('Authorization') ?? '';
    const bearer =
      hdr.toLowerCase().startsWith('bearer ') ? hdr.slice(7).trim() : String(body.token ?? '').trim();
    if (!bearer) return json({ ok: false, error: 'token_missing' }, 401);

    // что именно переключаем
    const audience = String(body.audience ?? 'all');
    const on =
      typeof body.on === 'boolean'
        ? body.on
        : typeof body.enabled === 'boolean'
        ? body.enabled
        : Boolean(body.value ?? true);

    const { channelNameForToken, enqueue } = await import('@/lib/bus');

    const event = {
      type: 'toggle',
      audience,
      on,
      ts: Date.now(),
    };

    await enqueue(channelNameForToken(bearer), event as any);
    return json({ ok: true, audience, on });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || 'server_error' }, 500);
  }
}