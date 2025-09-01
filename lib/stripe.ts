// lib/stripe.ts
import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

// Не указываем apiVersion — используем то, что зашито в SDK
export const stripe = new Stripe(key);

export const PRICE_PRO_MONTH = process.env.STRIPE_PRICE_PRO_MONTH!;
export const PRICE_PRO_YEAR  = process.env.STRIPE_PRICE_PRO_YEAR!;