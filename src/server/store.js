// In-memory storage for MVP
const { nanoid } = require('nanoid');

// Streamers data
const streamers = new Map();
// Orders data  
const orders = new Map();
// Overlay sessions
const sessions = new Map();

// Default streamer settings
const DEFAULT_SETTINGS = {
  voiceDefault: 'verse',
  cooldownSec: 5,
  moderationLevel: 'medium'
};

// Create a test streamer for development
const testStreamerId = nanoid();
const testOverlayKey = nanoid();

streamers.set(testStreamerId, {
  id: testStreamerId,
  handle: 'teststreamer',
  overlayKey: testOverlayKey,
  settings: DEFAULT_SETTINGS,
  createdAt: new Date().toISOString()
});

// Tiers configuration
const TIERS = {
  BASIC: { 
    price: 299, 
    durSec: '5-10', 
    chain: ['one_liner'],
    enabled: true
  },
  MEDIUM: { 
    price: 999, 
    durSec: '20-30', 
    chain: ['multi_punch_3', 'coach_mode'],
    enabled: false
  },
  VIP: { 
    price: 4999, 
    durSec: '45-60', 
    chain: ['battle', 'crowd_fx', 'epic_motivation'],
    enabled: false
  }
};

// Styles configuration
const STYLES = {
  support: {
    name: 'Supportive',
    description: 'Encouraging and positive reactions',
    emoji: '😊'
  },
  light_troll: {
    name: 'Light Troll',
    description: 'Playful teasing and jokes',
    emoji: '😏'
  },
  hard_troll: {
    name: 'Hard Troll', 
    description: 'Sharp criticism and tough love',
    emoji: '😈'
  }
};

module.exports = {
  streamers,
  orders,
  sessions,
  TIERS,
  STYLES,
  DEFAULT_SETTINGS,
  testStreamerId,
  testOverlayKey
};
