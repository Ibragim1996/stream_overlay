// app/api/state/route.ts
import { NextRequest } from 'next/server';
import { getJSON, setJSON } from '@/lib/redis';
import type { Mode } from '@/lib/mode';

export const dynamic = 'force-dynamic';

type OverlayState = {
  mode?: Mode;
  seconds?: number;
  auto?: boolean;
  voice?: boolean;
  friend?: boolean;
  streamKind?: 'just_chatting' | 'irl' | 'other';
};

function key(token: string) {
  return `state:${token}`;
}

function json(data: unknown, init?: number | ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: typeof init === 'number' ? init : (init as ResponseInit)?.status ?? 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? '';
  if (!token) return json({ ok: false, error: 'token_missing' }, 400);
  const state = (await getJSON<OverlayState>(key(token))) ?? {};
  return json({ ok: true, state });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { token?: unknown; patch?: unknown };
  const token = typeof body.token === 'string' ? body.token : '';
  if (!token) return json({ ok: false, error: 'token_missing' }, 400);

  const patchRaw = body.patch as Partial<OverlayState> | undefined;
  const patch: Partial<OverlayState> = {};
  if (patchRaw) {
    if (patchRaw.mode) patch.mode = patchRaw.mode;
    if (typeof patchRaw.seconds === 'number') patch.seconds = Math.max(5, Math.min(60, Math.floor(patchRaw.seconds)));
    if (typeof patchRaw.auto === 'boolean') patch.auto = patchRaw.auto;
    if (typeof patchRaw.voice === 'boolean') patch.voice = patchRaw.voice;
    if (typeof patchRaw.friend === 'boolean') patch.friend = patchRaw.friend;
    if (patchRaw.streamKind) patch.streamKind = patchRaw.streamKind;
  }

  const prev = (await getJSON<OverlayState>(key(token))) ?? {};
  const next: OverlayState = { ...prev, ...patch };

  await setJSON(key(token), next, 60 * 60 * 24);
  return json({ ok: true, state: next });
}