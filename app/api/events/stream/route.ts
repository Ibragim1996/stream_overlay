// app/api/events/stream/route.ts
import { NextRequest } from "next/server";
import {
  channelNameForToken,
  subscribe,
  getRecent,
  type BusEvent,
} from "@/lib/bus";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token =
    searchParams.get("t") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";

  if (!token) {
    return new Response("token required", { status: 400 });
  }

  const channel = channelNameForToken(token);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const write = (e: BusEvent) =>
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(e)}\n\n`)
        );

      // отдадим последние пару событий при подключении (по желанию)
      for (const e of getRecent(channel, 2)) write(e);

      const unsubscribe = subscribe(channel, write);
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": keep-alive\n\n"));
      }, 15000);

      // закрытие
  // Attach a cleanup function to the controller using a symbol.
      const cleanup = () => {
        clearInterval(keepAlive);
        unsubscribe();
      };
      (controller as unknown as { _cleanup?: () => void })._cleanup = cleanup;
    },
    cancel() {
      (this as unknown as { _cleanup?: () => void })._cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "access-control-allow-origin": "*",
    },
  });
}