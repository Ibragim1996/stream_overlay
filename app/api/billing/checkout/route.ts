// app/api/billing/checkout/route.ts
import { NextRequest } from 'next/server';
import { stripe, PRICE_PRO_MONTH } from '@/lib/stripe';
import { adminAuth } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });

    const idToken = m[1];
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email ?? undefined;

    // ищем/создаём Customer по email
    let customerId: string | undefined;

    if (email) {
      const { data } = await stripe.customers.list({ email, limit: 1 });
      if (data.length) {
        customerId = data[0].id;
        // обновим metadata, чтобы был uid
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

    const origin = req.headers.get('origin') || req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: uid, // пригодится в webhook
      line_items: [{ price: PRICE_PRO_MONTH, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/account/billing?success=1`,
      cancel_url: `${origin}/account/billing?canceled=1`,
    });

    return Response.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Stripe error';
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}