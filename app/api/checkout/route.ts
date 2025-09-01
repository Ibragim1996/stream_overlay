// app/api/checkout/route.ts
import type { NextRequest } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';        // Stripe требует Node runtime
export const dynamic = 'force-dynamic'; // не кешировать

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const PRICE_MONTHLY     = process.env.STRIPE_PRICE_MONTHLY || '';
const PRICE_YEARLY      = process.env.STRIPE_PRICE_YEARLY  || '';
const APP_URL =
  (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.startsWith('http')
    ? process.env.NEXT_PUBLIC_APP_URL
    : '') || '';

if (!STRIPE_SECRET_KEY) {
  console.error('[checkout] Missing STRIPE_SECRET_KEY in .env.local');
}

// ВАЖНО: не передаём apiVersion — пусть SDK использует версию пакета
const stripe = new Stripe(STRIPE_SECRET_KEY);

function json(data: any, init?: number | ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: typeof init === 'number' ? init : init?.status ?? 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!STRIPE_SECRET_KEY) {
      return json({ ok: false, error: 'Server misconfigured: STRIPE_SECRET_KEY' }, 500);
    }

    const body = await req.json().catch(() => ({} as any));
    const plan = (body?.plan === 'yearly' ? 'yearly' : 'monthly') as 'monthly' | 'yearly';

    const priceId = plan === 'yearly' ? PRICE_YEARLY : PRICE_MONTHLY;
    if (!priceId) {
      return json({ ok: false, error: `Missing price ID for ${plan}. Set STRIPE_PRICE_${plan.toUpperCase()}.` }, 500);
    }

    // Надёжно определяем origin
    const origin =
      APP_URL ||
      req.headers.get('origin') ||
      `${req.nextUrl.protocol}//${req.nextUrl.host}` ||
      'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/premium?status=success`,
      cancel_url: `${origin}/premium?status=cancel`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      automatic_tax: { enabled: false },
      metadata: { plan },
    });

    if (!session.url) {
      return json({ ok: false, error: 'Stripe did not return a Checkout URL' }, 500);
    }
    return json({ ok: true, url: session.url });
  } catch (e: any) {
    console.error('[checkout] error:', e);
    return json({ ok: false, error: e?.message ?? 'checkout_failed' }, 500);
  }
}