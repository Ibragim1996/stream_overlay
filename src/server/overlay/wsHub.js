// WebSocket hub for overlay connections
const WebSocket = require('ws');
const pino = require('pino');

const logger = pino({ level: 'info' });

class WSHub {
  constructor() {
    this.connections = new Map(); // overlayKey -> Set of WebSocket connections
    this.wss = null;
  }

  // Initialize WebSocket server
  init(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const overlayKey = url.searchParams.get('key');
      
      if (!overlayKey) {
        logger.warn('WebSocket connection without overlay key');
        ws.close(1008, 'Overlay key required');
        return;
      }

      logger.info(`New overlay connection for key: ${overlayKey}`);
      
      // Add to connections
      if (!this.connections.has(overlayKey)) {
        this.connections.set(overlayKey, new Set());
      }
      this.connections.get(overlayKey).add(ws);

      // Handle connection close
      ws.on('close', () => {
        logger.info(`Overlay connection closed for key: ${overlayKey}`);
        const connections = this.connections.get(overlayKey);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            this.connections.delete(overlayKey);
          }
        }
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error(`WebSocket error for overlay ${overlayKey}:`, error);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection.established',
        overlayKey: overlayKey,
        timestamp: new Date().toISOString()
      }));
    });

    logger.info('WebSocket hub initialized');
  }

  // Broadcast message to all connections for a streamer
  broadcastToStreamer(streamerId, message) {
    // Find overlay key for streamer
    const store = require('../store');
    let overlayKey = null;
    
    for (const [id, streamer] of store.streamers) {
      if (id === streamerId) {
        overlayKey = streamer.overlayKey;
        break;
      }
    }

    if (!overlayKey) {
      logger.error(`No overlay key found for streamer ${streamerId}`);
      return;
    }

    this.broadcastToOverlay(overlayKey, message);
  }

  // Broadcast message to all connections for an overlay key
  broadcastToOverlay(overlayKey, message) {
    const connections = this.connections.get(overlayKey);
    if (!connections || connections.size === 0) {
      logger.warn(`No connections found for overlay key: ${overlayKey}`);
      return;
    }

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    for (const ws of connections) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr);
          sentCount++;
        } catch (error) {
          logger.error('Error sending WebSocket message:', error);
        }
      }
    }

    logger.info(`Broadcasted message to ${sentCount} connections for overlay ${overlayKey}`);
  }

  // Send test reaction (for debugging)
  sendTestReaction(overlayKey) {
    const testMessage = {
      type: 'reaction.new',
      text: 'This is a test reaction! 🔥',
      audioUrl: null,
      style: 'support',
      tier: 'BASIC',
      orderId: 'test-' + Date.now()
    };

    this.broadcastToOverlay(overlayKey, testMessage);
  }

  // Get connection stats
  getStats() {
    const stats = {
      totalOverlays: this.connections.size,
      totalConnections: 0,
      overlays: {}
    };

    for (const [overlayKey, connections] of this.connections) {
      const count = connections.size;
      stats.totalConnections += count;
      stats.overlays[overlayKey] = count;
    }

    return stats;
  }
}

module.exports = new WSHub();


