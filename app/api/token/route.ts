import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function b64url(buf: Buffer) {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function signHS256(base: string, secret: string) {
  return b64url(crypto.createHmac('sha256', secret).update(base).digest());
}
function makeJWT(payload: Record<string, unknown>, secret: string) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const h = b64url(Buffer.from(JSON.stringify(header)));
  const p = b64url(Buffer.from(JSON.stringify(payload)));
  const s = signHS256(`${h}.${p}`, secret);
  return `${h}.${p}.${s}`;
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.OVERLAY_SIGN_SECRET || process.env.OVERLAY_SECRET;
    if (!secret) return NextResponse.json({ ok: false, error: 'missing_secret' }, { status: 500 });

    const { name, ttlSec = 6 * 60 * 60 } = await req.json();
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ ok: false, error: 'bad_name' }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    const token = makeJWT(
      {
        sub: name.trim(),
        iat: now,
        exp: now + Math.max(60, Number(ttlSec)), // минимум 60 сек
      },
      secret
    );

    return NextResponse.json({ ok: true, token });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'token_error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}