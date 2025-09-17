const Stripe = require('stripe');
const { nanoid } = require('nanoid');
const pino = require('pino');

const logger = pino({ level: 'info' });

class StripeService {
  constructor() {
    this.stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
    this.store = null;
    this.queue = null;
  }

  // Initialize dependencies
  init(store, queue) {
    this.store = store;
    this.queue = queue;
  }

  // Create checkout session
  async createCheckoutSession({ handle, style, tier }) {
    if (!this.stripe) {
      throw new Error('Stripe not configured - missing STRIPE_SECRET_KEY');
    }
    
    try {
      // Find streamer by handle
      let streamerId = null;
      for (const [id, streamer] of this.store.streamers) {
        if (streamer.handle === handle) {
          streamerId = id;
          break;
        }
      }

      if (!streamerId) {
        throw new Error(`Streamer with handle "${handle}" not found`);
      }

      // Validate tier and style
      if (!this.store.TIERS[tier] || !this.store.TIERS[tier].enabled) {
        throw new Error(`Tier "${tier}" is not available`);
      }

      if (!this.store.STYLES[style]) {
        throw new Error(`Style "${style}" is not valid`);
      }

      // Create order
      const orderId = nanoid();
      const order = {
        id: orderId,
        streamerId: streamerId,
        tier: tier,
        style: style,
        status: 'created',
        createdAt: new Date().toISOString(),
        amount: this.store.TIERS[tier].price
      };

      this.store.orders.set(orderId, order);

      // Create Stripe checkout session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `AI Reaction (${tier})`,
              description: `${this.store.STYLES[style].name} style reaction`,
            },
            unit_amount: this.store.TIERS[tier].price,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.PUBLIC_BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.PUBLIC_BASE_URL}/cancel.html?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          orderId: orderId,
          streamerId: streamerId,
          style: style,
          tier: tier
        }
      });

      logger.info(`Created checkout session ${session.id} for order ${orderId}`);
      return session;

    } catch (error) {
      logger.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Verify webhook signature and process event
  async handleWebhook(rawBody, signature) {
    if (!this.stripe) {
      throw new Error('Stripe not configured - missing STRIPE_SECRET_KEY');
    }
    
    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      logger.info(`Received webhook event: ${event.type}`);

      if (event.type === 'checkout.session.completed') {
        await this.handleCheckoutCompleted(event.data.object);
      }

      return { success: true };

    } catch (error) {
      logger.error('Webhook error:', error);
      throw error;
    }
  }

  // Handle successful checkout
  async handleCheckoutCompleted(session) {
    try {
      const { orderId, streamerId, style, tier } = session.metadata;

      // Update order status
      const order = this.store.orders.get(orderId);
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      order.status = 'paid';
      order.paidAt = new Date().toISOString();
      order.stripeSessionId = session.id;

      // Add to processing queue
      this.queue.push(orderId);

      logger.info(`Order ${orderId} marked as paid and queued for processing`);

    } catch (error) {
      logger.error('Error handling checkout completion:', error);
      throw error;
    }
  }

  // Get order by Stripe session ID
  getOrderBySessionId(sessionId) {
    for (const [orderId, order] of this.store.orders) {
      if (order.stripeSessionId === sessionId) {
        return order;
      }
    }
    return null;
  }
}

module.exports = new StripeService();
