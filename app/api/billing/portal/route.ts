// app/api/billing/portal/route.ts
import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';
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

    // находим customer
    let customerId: string | undefined;
    if (email) {
      const { data } = await stripe.customers.list({ email, limit: 1 });
      if (data.length) customerId = data[0].id;
    }
    if (!customerId) {
      // fallback: поиск по метадате (дорого для больших списков, но ок на старте)
      const list = await stripe.customers.list({ limit: 20 });
      const found = list.data.find((c) => c.metadata?.firebaseUid === uid);
      if (found) customerId = found.id;
    }
    if (!customerId) {
      return new Response(JSON.stringify({ error: 'customer_not_found' }), { status: 404 });
    }

    const origin = req.headers.get('origin') || req.nextUrl.origin;
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/account/billing`,
    });

    return Response.json({ url: portal.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Stripe error';
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}