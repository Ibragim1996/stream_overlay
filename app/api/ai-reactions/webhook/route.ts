import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getBaseUrl } from '@/lib/config';

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

// Send reaction to overlay via WebSocket
async function sendReactionToOverlay(streamerId: string, reaction: any) {
  // In a real implementation, you would:
  // 1. Connect to WebSocket server
  // 2. Send reaction to specific streamer's overlay
  // 3. Handle real-time delivery
  
  // For now, we'll simulate it by storing in a global store
  // that the overlay can poll or receive via WebSocket
  if (typeof global !== 'undefined') {
    if (!global.aiReactions) {
      global.aiReactions = new Map();
    }
    
    const reactions = global.aiReactions.get(streamerId) || [];
    reactions.push(reaction);
    global.aiReactions.set(streamerId, reactions);
  }
  
  console.log(`Reaction queued for streamer ${streamerId}:`, reaction.text);
}

// Mock AI reaction generation (kept for fallback)
async function generateAIReaction(style: string, tier: string) {
  const reactions = {
    support: [
      "Hey, you're doing great! Keep it up!",
      "Don't give up, you've got this!",
      "That was amazing, well done!",
      "You're crushing it today!",
      "Keep pushing forward, you're almost there!"
    ],
    light_troll: [
      "Oh come on, that was too easy!",
      "Really? That's the best you can do?",
      "Haha, nice try but not quite there yet!",
      "Come on, show us what you're really made of!",
      "That was... interesting. Try again!"
    ],
    hard_troll: [
      "Dude, what are you even doing? That was terrible!",
      "Come on man, you're embarrassing yourself!",
      "The viewers are laughing at you, get it together!",
      "Seriously? Even my grandma could do better!",
      "This is painful to watch, step it up!"
    ]
  };

  const styleReactions = reactions[style as keyof typeof reactions] || reactions.support;
  const randomReaction = styleReactions[Math.floor(Math.random() * styleReactions.length)];
  
  return {
    text: randomReaction,
    style: style,
    tier: tier
  };
}

// Removed top-level Stripe initialization - using getStripe() function instead

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { orderId, streamerId, style, tier } = session.metadata || {};

      if (orderId) {
        // Here you would update your database
        // For now, we'll just log it
        console.log('Payment completed:', {
          orderId,
          streamerId,
          style,
          tier,
          sessionId: session.id
        });

        // Generate AI reaction with real voice
        try {
          const response = await fetch(`${getBaseUrl()}/api/ai-reactions/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              streamerId,
              style,
              tier,
              context: 'The streamer just received a reaction from a viewer!'
            })
          });

          if (response.ok) {
            const reaction = await response.json();
            
            // Send to overlay via WebSocket
            await sendReactionToOverlay(streamerId, reaction);
            
            console.log('AI reaction sent to overlay:', {
              streamerId,
              reaction: {
                id: reaction.id,
                text: reaction.text,
                style: reaction.style,
                tier: reaction.tier,
                audioUrl: reaction.audioUrl,
                timestamp: reaction.timestamp
              }
            });
          } else {
            console.error('Failed to generate AI reaction:', await response.text());
          }
          
        } catch (error) {
          console.error('Failed to generate AI reaction:', error);
        }
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ 
      error: error.message || 'Webhook failed' 
    }, { status: 400 });
  }
}
