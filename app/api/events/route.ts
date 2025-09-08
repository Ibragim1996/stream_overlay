// app/api/events/route.ts
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

    // токен из заголовка или тела
    const hdr = req.headers.get('authorization') ?? req.headers.get('Authorization') ?? '';
    const bearer =
      hdr.toLowerCase().startsWith('bearer ') ? hdr.slice(7).trim() : String(body.token ?? '').trim();
    if (!bearer) return json({ ok: false, error: 'token_missing' }, 401);

    const type = String(body.type ?? '').trim();
    const payload = body.payload ?? {};
    if (!type) return json({ ok: false, error: 'type_missing' }, 400);

    // динамический импорт, чтобы ничего не выполнялось на импорте при билде
    const { channelNameForToken, enqueue } = await import('@/lib/bus');

    const event = {
      type,
      ...('audience' in body ? { audience: String(body.audience) } : {}),
      payload,
      ts: Date.now(),
    };

    await enqueue(channelNameForToken(bearer), event as any);
    return json({ ok: true });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || 'server_error' }, 500);
  }
}