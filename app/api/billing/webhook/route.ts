// app/api/billing/webhook/route.ts
import type { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { setJSON } from '@/lib/redis';

export const runtime = 'nodejs';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/** Тайп-гарды для надёжного сужения */
function isSubscription(x: unknown): x is Stripe.Subscription {
  return !!x && typeof x === 'object' && (x as { object?: string }).object === 'subscription';
}
function hasCurrentPeriodEnd(x: unknown): x is { current_period_end: number } {
  return !!x && typeof (x as { current_period_end?: unknown }).current_period_end === 'number';
}
function getPriceId(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0];
  const price = item && 'price' in item ? (item as { price?: { id?: string } }).price : undefined;
  return typeof price?.id === 'string' ? price.id : null;
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) return json({ ok: false, error: 'missing_signature' }, 400);

  // Stripe требует сырой body для проверки подписи
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET!;
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: 'bad_signature', message: msg }, 400);
  }

  switch (event.type) {
    /** Успешное завершение Checkout → подписка создана/активна */
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const subId =
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id;

      const uid =
        typeof session.client_reference_id === 'string'
          ? session.client_reference_id
          : undefined;

      if (subId && uid) {
        // Берём подписку полностью (разворачиваем price)
        const sub = await stripe.subscriptions.retrieve(subId, {
          expand: ['items.data.price'],
        });

        await setJSON(`sub:${uid}`, {
          status: sub.status,
          priceId: getPriceId(sub),
          currentPeriodEnd: hasCurrentPeriodEnd(sub) ? sub.current_period_end : null,
        });
      }
      break;
    }

    /** Подписка удалена/отменена */
    case 'customer.subscription.deleted': {
      const obj = event.data.object;
      if (!isSubscription(obj)) break; // на всякий случай

      const sub = obj;
      const uid =
        typeof sub.metadata?.userId === 'string' ? sub.metadata.userId : undefined;

      if (uid) {
        await setJSON(`sub:${uid}`, {
          status: 'canceled',
          priceId: getPriceId(sub),
          currentPeriodEnd: hasCurrentPeriodEnd(sub) ? sub.current_period_end : null,
        });
      }
      break;
    }

    default:
      // остальные события пока игнорируем
      break;
  }

  return json({ ok: true });
}