import { NextRequest } from 'next/server';
import { getAdminDB } from '@/lib/firebaseAdmin';
import { nanoid } from 'nanoid';
import { getOverlayUrl } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'access-control-allow-origin': '*' },
  });
}

type Body = { uid?: string; nickname?: string };

export async function OPTIONS() { return json(null, 204); }

export async function POST(req: NextRequest) {
  try {
    const raw = (await req.json().catch(() => ({}))) as Body;
    const uid = (raw.uid || '').trim();
    const nickname = (raw.nickname || '').trim();

    const db = getAdminDB();
    let overlayKey = '';

    if (uid) {
      const userRef = db.collection('users').doc(uid);
      const snap = await userRef.get();
      overlayKey = (snap.exists ? (snap.data()?.overlayKey as string) : '') || '';
      if (!overlayKey) {
        overlayKey = nanoid(28);
        await userRef.set({ overlayKey, plan: 'free', premium: false, nickname: nickname || null }, { merge: true });
      }
    } else {
      overlayKey = nanoid(28);
    }

    const overlayUrl = getOverlayUrl(overlayKey);
    return json({ ok: true, overlayKey, overlayUrl });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || 'server_error' }, 500);
  }
}


