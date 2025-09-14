// app/api/subscription/route.ts
import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getAdminAuth } from '@/lib/firebaseAdmin';
import { getJSON, setJSON } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

export async function GET(req: NextRequest) {
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

    // 3) получаем подписку из Redis
    const subscription = await getJSON(`sub:${uid}`);

    if (!subscription) {
      return json({ 
        status: 'inactive',
        plan: null,
        currentPeriodEnd: null,
        isActive: false 
      });
    }

    const isActive = subscription.status === 'active' && 
                    subscription.currentPeriodEnd && 
                    subscription.currentPeriodEnd > Math.floor(Date.now() / 1000);

    return json({
      status: subscription.status,
      plan: subscription.priceId,
      currentPeriodEnd: subscription.currentPeriodEnd,
      isActive,
      isMonthly: subscription.priceId?.includes('month') || false,
      isYearly: subscription.priceId?.includes('year') || false,
    });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'server_error';
    return json({ error: message }, 500);
  }
}

export async function DELETE(req: NextRequest) {
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

    // 3) получаем подписку из Redis
    const subscription = await getJSON(`sub:${uid}`);
    
    if (!subscription || !subscription.isActive) {
      return json({ error: 'no_active_subscription' }, 400);
    }

    // 4) находим подписку в Stripe по customer email
    const user = await adminAuth.getUser(uid);
    if (!user.email) {
      return json({ error: 'no_email' }, 400);
    }

    const { data: customers } = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });

    if (!customers.length) {
      return json({ error: 'no_customer' }, 400);
    }

    const customer = customers[0];
    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    });

    if (!subscriptions.length) {
      return json({ error: 'no_subscription' }, 400);
    }

    // 5) отменяем подписку в Stripe
    const stripeSubscription = subscriptions[0];
    await stripe.subscriptions.update(stripeSubscription.id, {
      cancel_at_period_end: true
    });

    // 6) обновляем статус в Redis
    await setJSON(`sub:${uid}`, {
      ...subscription,
      status: 'canceled',
      cancelAtPeriodEnd: true,
    });

    return json({ 
      success: true, 
      message: 'Subscription will be canceled at the end of the current period' 
    });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'server_error';
    return json({ error: message }, 500);
  }
}
