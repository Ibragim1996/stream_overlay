// app/api/events/toggle/route.ts
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

    const audience = String(body.audience || "all");
  // опционально: оповестим подписчиков об изменении
  const channel = channelNameForToken(token);
  enqueue(channel, { type: "audience", payload: { audience }, ts: Date.now() });

  return json({ ok: true, audience });
  } catch (e) {
    const errorMsg = (e && typeof e === 'object' && 'message' in e) ? (e as { message?: string }).message : undefined;
    return json({ ok: false, error: errorMsg || "server_error" }, 500);
  }
}