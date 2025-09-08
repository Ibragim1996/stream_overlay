// lib/stripe.ts
import Stripe from 'stripe';

let client: Stripe | null = null;
export function getStripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  client = new Stripe(key);
  return client;
}

export const stripe = new Proxy({} as unknown as Stripe, {
  get(_target, prop, receiver) {
    const inst: any = getStripe();
    const val = Reflect.get(inst, prop, receiver);
    return typeof val === 'function' ? val.bind(inst) : val;
  },
}) as unknown as Stripe;

export const PRICE_PRO_MONTH = process.env.STRIPE_PRICE_PRO_MONTH!;
export const PRICE_PRO_YEAR  = process.env.STRIPE_PRICE_PRO_YEAR!;