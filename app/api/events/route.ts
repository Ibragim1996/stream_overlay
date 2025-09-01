// app/api/events/route.ts
import { NextRequest } from "next/server";
import { channelNameForToken, enqueue } from "@/lib/bus";

export const runtime = "nodejs";

function json(data: unknown, init?: number | ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: typeof init === "number" ? init : init?.status ?? 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export async function POST(req: NextRequest) {
  try {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const token =
      body.token ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      "";

    if (!token) return json({ ok: false, error: "token_missing" }, 400);

    const channel = channelNameForToken(token);
    if (body.type === 'task') {
      const event = {
        type: 'task' as const,
        line: body.line || '',
        mode: body.mode,
        taskType: body.taskType,
        streamKind: body.streamKind,
        name: body.name,
        ts: Date.now(),
      };
      enqueue(channel, event);
    } else if (body.type === 'audience') {
      const event = {
        type: 'audience' as const,
        payload: { audience: body.audience || 'all' },
        ts: Date.now(),
      };
      enqueue(channel, event);
    } else {
      const event = {
        type: 'message' as const,
        payload: (body.payload && typeof body.payload === 'object') ? body.payload : {},
        ts: Date.now(),
      };
      enqueue(channel, event);
    }
    return json({ ok: true });
  } catch (e) {
    const errorMsg = (e && typeof e === 'object' && 'message' in e) ? (e as { message?: string }).message : undefined;
    return json({ ok: false, error: errorMsg || "server_error" }, 500);
  }
}