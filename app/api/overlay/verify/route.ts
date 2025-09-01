import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function b64urlToBuf(s: string) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
  return Buffer.from(s + '='.repeat(pad), 'base64');
}
function b64url(buf: Buffer) {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function verifyHS256(token: string, secret: string) {
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) throw new Error('bad_token');

  const base = `${h}.${p}`;
  const expect = b64url(crypto.createHmac('sha256', secret).update(base).digest());
  if (expect !== s) throw new Error('bad_sig');

  const payload = JSON.parse(b64urlToBuf(p).toString('utf8'));
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) throw new Error('expired');
  return payload;
}

export async function GET(req: NextRequest) {
  try {
    const secret = process.env.OVERLAY_SIGN_SECRET || process.env.OVERLAY_SECRET;
    if (!secret) throw new Error('missing_secret');

    const url = new URL(req.url);
    const token = url.searchParams.get('t') || url.searchParams.get('token') || '';
    if (!token) throw new Error('no_token');

    const payload = verifyHS256(token, secret);
    return NextResponse.json({ ok: true, payload });
  } catch (e) {
    const errorMsg = (e && typeof e === 'object' && 'message' in e) ? (e as { message?: string }).message : undefined;
    return NextResponse.json({ ok: false, error: errorMsg || 'invalid' }, { status: 401 });
  }
}