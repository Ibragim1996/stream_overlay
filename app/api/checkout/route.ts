// app/api/checkout/route.ts
import { NextRequest } from 'next/server';
import { stripe, PRICE_PRO_MONTH, PRICE_PRO_YEAR } from '@/lib/stripe';
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

    // 2) получаем план из body
    const body = await req.json();
    const plan = body.plan as 'monthly' | 'yearly';
    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return json({ error: 'invalid_plan' }, 400);
    }

    // 3) проверяем через Firebase Admin (через ленивый геттер)
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email ?? undefined;

    // 4) ищем/создаём Customer в Stripe
    let customerId: string | undefined;
    if (email) {
      const { data } = await stripe.customers.list({ email, limit: 1 });
      if (data.length) {
        customerId = data[0].id;
        await stripe.customers.update(customerId, { metadata: { firebaseUid: uid } });
      }
    }
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { firebaseUid: uid },
      });
      customerId = customer.id;
    }

    // 5) выбираем правильную цену
    const priceId = plan === 'yearly' ? PRICE_PRO_YEAR : PRICE_PRO_MONTH;

    // 6) создаём Checkout Session
    const origin = req.headers.get('origin') || req.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: uid,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/premium?status=success`,
      cancel_url: `${origin}/premium?status=cancel`,
    });

    return json({ ok: true, url: session.url });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'server_error';
    return json({ ok: false, error: message }, 500);
  }
}