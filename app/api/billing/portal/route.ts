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

async function findCustomerIdByUidOrEmail(uid: string, email?: string | null) {
  // 1) Пытаемся найти по metadata.firebaseUid (самый надёжный способ)
  try {
    const search = await stripe.customers.search({
      // Stripe Search Query Language
      query: `metadata['firebaseUid']:'${uid}' AND status:'active'`,
      limit: 1,
    });
    if (search.data.length) return search.data[0].id;
  } catch {
    /* ignore */
  }

  // 2) Резервный путь — по email
  if (email) {
    const { data } = await stripe.customers.list({ email, limit: 1 });
    if (data.length) return data[0].id;
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  try {
    // Bearer <idToken> от Firebase
    const auth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) return json({ ok: false, error: 'unauthorized' }, 401);
    const idToken = m[1].trim();

    // verify Firebase
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email ?? null;

    // ищем/создаём Customer
    let customerId = await findCustomerIdByUidOrEmail(uid, email);
    if (!customerId) {
      const created = await stripe.customers.create({
        email: email ?? undefined,
        metadata: { firebaseUid: uid },
      });
      customerId = created.id;
    } else {
      // актуализируем metadata
      await stripe.customers.update(customerId, { metadata: { firebaseUid: uid } });
    }

    const origin = req.headers.get('origin') || req.nextUrl.origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/account/billing`,
    });

    return json({ ok: true, url: session.url });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || 'server_error' }, 500);
  }
}