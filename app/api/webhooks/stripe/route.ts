// app/api/webhooks/stripe/route.ts
import { NextRequest } from 'next/server';
import { userDB } from '@/lib/user-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    // In a real implementation, you would verify the Stripe signature here
    // For now, we'll just parse the body and handle the event
    
    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      console.error('Invalid JSON in webhook body:', err);
      return new Response('Invalid JSON', { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const userId = session.metadata?.userId;
        
        if (userId) {
          // Upgrade user to premium
          userDB.updateUser(userId, { premium: true });
          console.log(`User ${userId} upgraded to premium`);
        }
        break;
        
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Handle subscription updates
        if (subscription.status === 'active') {
          // Find user by customer ID and upgrade
          const users = userDB.getAllUsers();
          const user = users.find(u => u.id === customerId);
          if (user) {
            userDB.updateUser(user.id, { premium: true });
            console.log(`User ${user.id} subscription activated`);
          }
        } else if (subscription.status === 'canceled' || subscription.status === 'past_due') {
          // Downgrade user
          const users = userDB.getAllUsers();
          const user = users.find(u => u.id === customerId);
          if (user) {
            userDB.updateUser(user.id, { premium: false });
            console.log(`User ${user.id} subscription deactivated`);
          }
        }
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook error', { status: 500 });
  }
}
