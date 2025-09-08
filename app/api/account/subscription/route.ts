// app/api/account/subscription/route.ts
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
  try {
    const search = await stripe.customers.search({
      query: `metadata['firebaseUid']:'${uid}'`,
      limit: 1,
    });
    if (search.data.length) return search.data[0].id;
  } catch {
    /* ignore */
  }
  if (email) {
    const { data } = await stripe.customers.list({ email, limit: 1 });
    if (data.length) return data[0].id;
  }
  return undefined;
}

function toIsoFromStripeTs(ts?: number | null): string | null {
  return typeof ts === 'number' ? new Date(ts * 1000).toISOString() : null;
}

/**
 * GET /api/account/subscription
 * Возвращает информацию о подписке текущего пользователя (по Firebase idToken в Authorization).
 */
export async function GET(req: NextRequest) {
  try {
    // Bearer <idToken>
    const auth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) return json({ ok: false, error: 'unauthorized' }, 401);
    const idToken = m[1].trim();

    // verify Firebase
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email ?? null;

    // найдём Customer
    const customerId = await findCustomerIdByUidOrEmail(uid, email);
    if (!customerId) {
      // просто нет клиента => нет подписки
      return json({ ok: true, subscription: null });
    }

    // берём подписки; выбираем самую «актуальную»
    const subs = await stripe.subscriptions.list({ customer: customerId, limit: 10 });
    if (!subs.data.length) return json({ ok: true, subscription: null });

    // предпочтительно активная / trialing / incomplete -> иначе самая новая
    const priority = ['active', 'trialing', 'incomplete', 'past_due', 'unpaid'];
    const pick = [...subs.data].sort((a, b) => {
      const ai = priority.indexOf(a.status);
      const bi = priority.indexOf(b.status);
      if (ai !== -1 || bi !== -1) {
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      }
      return (b.created || 0) - (a.created || 0);
    })[0];

    const item = pick.items.data[0];
const priceId = (item?.price?.id as string) ?? null;
const currentPeriodEnd = toIsoFromStripeTs((pick as any).current_period_end);

return json({
  ok: true,
  subscription: {
    id: pick.id,
    status: pick.status,
    priceId,
    currentPeriodEnd,
  },
});
  } catch (e: any) {
    return json({ ok: false, error: e?.message || 'internal_error' }, 500);
  }
}