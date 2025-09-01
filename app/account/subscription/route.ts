// app/api/account/subscription/route.ts
import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import { getJSON } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return new Response('unauthorized', { status: 401 });

  try {
    const decoded = await adminAuth.verifyIdToken(m[1]);
    const data = await getJSON(`sub:${decoded.uid}`);
    return Response.json(data ?? {});
  } catch {
    return new Response('unauthorized', { status: 401 });
  }
}