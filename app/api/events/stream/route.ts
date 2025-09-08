// app/api/events/stream/route.ts
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token =
    searchParams.get('t') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    '';

  if (!token) return new Response('token required', { status: 400 });

  // динамический импорт, чтобы исключить любые сайд-эффекты на импорте
  const { channelNameForToken, recentEvents } = await import('@/lib/bus');

  const channel = channelNameForToken(token);
  const encoder = new TextEncoder();
  let lastTs = 0;
  let timer: NodeJS.Timeout | undefined;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));

      // старт: отдадим последние события (от старых к новым)
      try {
        const recents = await recentEvents(channel, 50);
        recents
          .slice()
          .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))
          .forEach((e) => {
            lastTs = Math.max(lastTs, Number(e.ts || 0));
            send(e);
          });
      } catch {
        // тихо игнорируем — всё равно продолжаем стрим
      }

      // опрос раз в 1.5с и отправка только новых событий
      timer = setInterval(async () => {
        try {
          const fresh = await recentEvents(channel, 50);
          const news = fresh
            .filter((e) => Number(e.ts || 0) > lastTs)
            .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));

          for (const e of news) {
            lastTs = Math.max(lastTs, Number(e.ts || 0));
            send(e);
          }
          // heartbeat, чтобы соединение не простаивало
          if (!news.length) controller.enqueue(encoder.encode(':hb\n\n'));
        } catch {
          // no-op
        }
      }, 1500);

      // закрытие при разрыве клиента
      req.signal?.addEventListener('abort', () => {
        if (timer) clearInterval(timer);
        try { controller.close(); } catch {}
      });
    },
    cancel() {
      if (timer) clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'access-control-allow-origin': '*',
    },
  });
}