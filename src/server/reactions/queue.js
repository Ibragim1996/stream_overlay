// Reaction processing queue
const pino = require('pino');
const { nanoid } = require('nanoid');

const logger = pino({ level: 'info' });

class ReactionQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.openaiClient = null;
    this.store = null;
    this.wsHub = null;
  }

  // Initialize dependencies
  init(openaiClient, store, wsHub) {
    this.openaiClient = openaiClient;
    this.store = store;
    this.wsHub = wsHub;
  }

  // Add order to queue
  push(orderId) {
    this.queue.push(orderId);
    logger.info(`Added order ${orderId} to queue. Queue length: ${this.queue.length}`);
    
    if (!this.processing) {
      this.process();
    }
  }

  // Process queue
  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    logger.info(`Processing queue with ${this.queue.length} items`);

    while (this.queue.length > 0) {
      const orderId = this.queue.shift();
      try {
        await this.processOrder(orderId);
      } catch (error) {
        logger.error(`Error processing order ${orderId}:`, error);
        // Mark order as failed
        const order = this.store.orders.get(orderId);
        if (order) {
          order.status = 'failed';
          order.error = error.message;
        }
      }
    }

    this.processing = false;
    logger.info('Queue processing completed');
  }

  // Process individual order
  async processOrder(orderId) {
    const order = this.store.orders.get(orderId);
    if (!order) {
      logger.error(`Order ${orderId} not found`);
      return;
    }

    logger.info(`Processing order ${orderId} for streamer ${order.streamerId}`);

    // Get streamer info
    const streamer = this.store.streamers.get(order.streamerId);
    if (!streamer) {
      throw new Error(`Streamer ${order.streamerId} not found`);
    }

    // Generate reaction text
    const context = {
      style: order.style,
      tier: order.tier,
      streamerHandle: streamer.handle
    };

    const reactionText = await this.openaiClient.generateReaction(order.style, context);
    logger.info(`Generated reaction: "${reactionText}"`);

    // Moderate content
    const moderation = await this.openaiClient.moderateContent(reactionText);
    if (moderation.flagged) {
      logger.warn(`Reaction flagged for moderation: ${reactionText}`);
      // Apply moderation based on streamer settings
      if (streamer.settings.moderationLevel === 'strict') {
        throw new Error('Content flagged by moderation');
      }
    }

    // Generate audio
    const audioUrl = await this.openaiClient.generateAudio(
      reactionText, 
      order.style, 
      streamer.settings.voiceDefault
    );
    logger.info(`Generated audio: ${audioUrl}`);

    // Update order
    order.text = reactionText;
    order.audioUrl = audioUrl;
    order.status = 'delivered';
    order.deliveredAt = new Date().toISOString();

    // Send to overlay via WebSocket
    this.wsHub.broadcastToStreamer(order.streamerId, {
      type: 'reaction.new',
      text: reactionText,
      audioUrl: audioUrl,
      style: order.style,
      tier: order.tier,
      orderId: orderId
    });

    logger.info(`Order ${orderId} delivered successfully`);
  }
}

module.exports = new ReactionQueue();


