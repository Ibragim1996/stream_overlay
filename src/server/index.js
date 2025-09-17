require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const pino = require('pino');
const path = require('path');

// Import services
const store = require('./store');
const openaiClient = require('./openaiClient');
const stripeService = require('./stripe');
const queue = require('./reactions/queue');
const wsHub = require('./overlay/wsHub');

const logger = pino({ level: 'info' });

class Server {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.port = process.env.PORT || 3000;
  }

  // Initialize server
  async init() {
    // Initialize OpenAI client
    this.openaiClient = new openaiClient();
    
    // Initialize services with dependencies
    stripeService.init(store, queue);
    queue.init(this.openaiClient, store, wsHub);
    wsHub.init(this.server);

    // Middleware
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.static('public'));

    // Routes
    this.setupRoutes();

    // Error handling
    this.app.use((error, req, res, next) => {
      logger.error('Unhandled error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });

    // Start server
    this.server.listen(this.port, () => {
      console.log(`🚀 AI Reactions Server running on port ${this.port}`);
      console.log(`📺 Test streamer: ${store.testStreamerId}`);
      console.log(`🔑 Test overlay key: ${store.testOverlayKey}`);
      console.log(`🛒 Store URL: ${process.env.PUBLIC_BASE_URL}/s/teststreamer`);
      console.log(`📺 Overlay URL: ${process.env.PUBLIC_BASE_URL}/overlay.html?key=${store.testOverlayKey}`);
      logger.info(`Server running on port ${this.port}`);
    });
  }

  // Setup routes
  setupRoutes() {
    // Health check
    this.app.get('/__health', (req, res) => {
      res.json({ ok: true, timestamp: new Date().toISOString() });
    });

    // Store page for streamer
    this.app.get('/s/:handle', (req, res) => {
      res.sendFile(path.join(__dirname, '../../public/store.html'));
    });

    // Overlay page
    this.app.get('/overlay.html', (req, res) => {
      res.sendFile(path.join(__dirname, '../../public/overlay.html'));
    });

    // Create checkout session
    this.app.post('/api/checkout', async (req, res) => {
      try {
        const { handle, style, tier } = req.body;
        
        if (!handle || !style || !tier) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const session = await stripeService.createCheckoutSession({ handle, style, tier });
        res.json({ sessionId: session.id, url: session.url });

      } catch (error) {
        logger.error('Checkout error:', error);
        res.status(400).json({ error: error.message });
      }
    });

    // Stripe webhook
    this.app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
      try {
        const signature = req.headers['stripe-signature'];
        await stripeService.handleWebhook(req.body, signature);
        res.json({ received: true });
      } catch (error) {
        logger.error('Webhook error:', error);
        res.status(400).json({ error: error.message });
      }
    });

    // Test overlay endpoint
    this.app.get('/__overlay/test', (req, res) => {
      const { key } = req.query;
      if (!key) {
        return res.status(400).json({ error: 'Overlay key required' });
      }

      wsHub.sendTestReaction(key);
      res.json({ sent: true });
    });

    // Get available tiers and styles
    this.app.get('/api/tiers', (req, res) => {
      res.json({
        tiers: store.TIERS,
        styles: store.STYLES
      });
    });

    // Get streamer info
    this.app.get('/api/streamer/:handle', (req, res) => {
      const { handle } = req.params;
      
      for (const [id, streamer] of store.streamers) {
        if (streamer.handle === handle) {
          return res.json({
            id: streamer.id,
            handle: streamer.handle,
            settings: streamer.settings
          });
        }
      }
      
      res.status(404).json({ error: 'Streamer not found' });
    });

    // WebSocket stats
    this.app.get('/__stats', (req, res) => {
      res.json({
        ws: wsHub.getStats(),
        orders: store.orders.size,
        streamers: store.streamers.size
      });
    });
  }
}

// Start server
if (require.main === module) {
  const server = new Server();
  server.init().catch(error => {
    logger.error('Failed to start server:', error);
    console.error('Server startup error:', error);
    process.exit(1);
  });
}

module.exports = Server;
