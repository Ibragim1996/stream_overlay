// app/api/billing/portal/route.ts
import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getAdminAuth } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export async function POST(req: NextRequest) {
  try {
    // 1) достаём Bearer токен
    const auth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) return json({ error: 'unauthorized' }, 401);
    const idToken = m[1].trim();

    // 2) проверяем через Firebase Admin
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email ?? undefined;

    if (!email) {
      return json({ error: 'no_email' }, 400);
    }

    // 3) ищем Customer в Stripe
    const { data } = await stripe.customers.list({ email, limit: 1 });
    
    if (!data.length) {
      return json({ error: 'no_customer' }, 400);
    }

    const customer = data[0];

    // 4) создаём Portal Session
    const origin = req.headers.get('origin') || req.nextUrl.origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${origin}/premium`,
    });

    return json({ ok: true, url: session.url });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'server_error';
    return json({ ok: false, error: message }, 500);
  }
}