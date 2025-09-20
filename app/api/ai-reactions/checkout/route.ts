import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Runtime configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

// Mock store for MVP
const streamers = new Map();
const orders = new Map();

// Initialize test streamer
const testStreamerId = 'test-streamer-' + Date.now();
const testOverlayKey = 'test-overlay-' + Date.now();

streamers.set(testStreamerId, {
  id: testStreamerId,
  handle: 'teststreamer',
  overlayKey: testOverlayKey,
  settings: {
    voiceDefault: 'verse',
    cooldownSec: 5,
    moderationLevel: 'medium'
  }
});

export async function POST(req: NextRequest) {
  try {
    const { handle, style, tier } = await req.json();
    
    if (!handle || !style || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find streamer by handle
    let streamerId: string | null = null;
    for (const [id, streamer] of streamers) {
      if (streamer.handle === handle) {
        streamerId = id;
        break;
      }
    }

    if (!streamerId) {
      // Create new streamer if not exists
      streamerId = 'streamer-' + Date.now();
      streamers.set(streamerId, {
        id: streamerId,
        handle: handle,
        overlayKey: 'overlay-' + Date.now(),
        settings: {
          voiceDefault: 'verse',
          cooldownSec: 5,
          moderationLevel: 'medium'
        }
      });
    }

    // Validate tier and style
    const TIERS = {
      BASIC: { price: 299, enabled: true },
      MEDIUM: { price: 999, enabled: false },
      VIP: { price: 4999, enabled: false }
    };

    const STYLES = {
      support: { name: 'Supportive' },
      light_troll: { name: 'Light Troll' },
      hard_troll: { name: 'Hard Troll' }
    };

    if (!TIERS[tier as keyof typeof TIERS] || !TIERS[tier as keyof typeof TIERS].enabled) {
      return NextResponse.json({ error: `Tier "${tier}" is not available` }, { status: 400 });
    }

    if (!STYLES[style as keyof typeof STYLES]) {
      return NextResponse.json({ error: `Style "${style}" is not valid` }, { status: 400 });
    }

    // Create order
    const orderId = 'order-' + Date.now();
    const order = {
      id: orderId,
      streamerId: streamerId,
      tier: tier,
      style: style,
      status: 'created',
      createdAt: new Date().toISOString(),
      amount: TIERS[tier as keyof typeof TIERS].price
    };

    orders.set(orderId, order);

    // Create Stripe checkout session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `AI Reaction (${tier})`,
            description: `${STYLES[style as keyof typeof STYLES].name} style reaction`,
          },
          unit_amount: TIERS[tier as keyof typeof TIERS].price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ai-stream-new.vercel.app'}/ai-reactions/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ai-stream-new.vercel.app'}/ai-reactions/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        orderId: orderId,
        streamerId: streamerId,
        style: style,
        tier: tier
      }
    });

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url 
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ 
      error: error.message || 'Checkout failed' 
    }, { status: 400 });
  }
}
