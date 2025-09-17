# AI Reactions MVP - Monetizable Streamer Reactions

## Overview
This is an MVP implementation of monetizable AI reactions for streamers. Viewers can purchase AI-generated reactions that appear in the streamer's overlay with voice narration.

## Features
- **BASIC Tier**: $2.99 for 5-10 second AI reactions
- **3 Reaction Styles**: Supportive, Light Troll, Hard Troll
- **Real-time Voice**: OpenAI Realtime API with fallback to TTS
- **WebSocket Overlay**: Real-time delivery to streamer's OBS
- **Stripe Integration**: Secure payment processing
- **Content Moderation**: AI-powered content filtering

## Tech Stack
- **Backend**: Node.js, Express, WebSocket (ws)
- **AI**: OpenAI SDK (GPT-4o-mini, Realtime API, TTS-1-HD)
- **Payments**: Stripe (Checkout + Webhooks)
- **Frontend**: Vanilla HTML/CSS/JS
- **Logging**: Pino

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create `.env` file with:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here
PORT=3000
PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Start Server
```bash
node src/server/index.js
```

### 4. Test Setup

#### Test Streamer
- **Handle**: `teststreamer`
- **Store URL**: `http://localhost:3000/s/teststreamer`
- **Overlay URL**: `http://localhost:3000/overlay.html?key=<overlay-key>`

#### Test Endpoints
- **Health**: `GET /__health`
- **Stats**: `GET /__stats`
- **Test Overlay**: `GET /__overlay/test?key=<overlay-key>`

## Usage Flow

### For Streamers
1. Get your overlay key from the server logs
2. Add overlay URL to OBS Browser Source: `http://localhost:3000/overlay.html?key=<your-key>`
3. Share store URL with viewers: `http://localhost:3000/s/<your-handle>`

### For Viewers
1. Visit streamer's store page
2. Choose reaction style (Supportive/Light Troll/Hard Troll)
3. Click "Buy AI Reaction - $2.99"
4. Complete Stripe checkout
5. Reaction appears in streamer's overlay

## API Endpoints

### Store & Checkout
- `GET /s/:handle` - Store page for streamer
- `POST /api/checkout` - Create Stripe checkout session
- `GET /api/tiers` - Get available tiers and styles
- `GET /api/streamer/:handle` - Get streamer info

### Overlay & WebSocket
- `GET /overlay.html` - Overlay page
- `WS /ws?key=<overlay-key>` - WebSocket connection
- `GET /__overlay/test?key=<overlay-key>` - Send test reaction

### Stripe Integration
- `POST /api/stripe/webhook` - Stripe webhook handler

### System
- `GET /__health` - Health check
- `GET /__stats` - System statistics

## Data Models

### Streamer
```javascript
{
  id: "streamer-id",
  handle: "streamer-handle", 
  overlayKey: "unique-overlay-key",
  settings: {
    voiceDefault: "verse",
    cooldownSec: 5,
    moderationLevel: "medium"
  }
}
```

### Order
```javascript
{
  id: "order-id",
  streamerId: "streamer-id",
  tier: "BASIC|MEDIUM|VIP",
  style: "support|light_troll|hard_troll", 
  status: "created|paid|failed|delivered",
  text: "Generated reaction text",
  audioUrl: "/tmp/reaction_123.mp3",
  createdAt: "2024-01-01T00:00:00Z"
}
```

## Tiers Configuration

### BASIC (Enabled)
- **Price**: $2.99
- **Duration**: 5-10 seconds
- **Features**: Single reaction with voice

### MEDIUM (Coming Soon)
- **Price**: $9.99  
- **Duration**: 20-30 seconds
- **Features**: Multi-part reactions, coaching mode

### VIP (Coming Soon)
- **Price**: $49.99
- **Duration**: 45-60 seconds  
- **Features**: Epic reactions, crowd effects, battle mode

## Reaction Styles

### Supportive 😊
- Encouraging and positive reactions
- Uses warm, uplifting tone
- Example: "You got this!", "That was sick!"

### Light Troll 😏  
- Playful teasing and jokes
- Uses humorous, cheeky tone
- Example: "Bruh, that was rough", "Nice try, champ"

### Hard Troll 😈
- Sharp criticism and tough love
- Uses direct, no-nonsense tone
- Example: "That was embarrassing", "Focus up"

## WebSocket Events

### Client → Server
- Connection with overlay key
- Heartbeat (automatic)

### Server → Client
```javascript
// Connection established
{
  type: "connection.established",
  overlayKey: "overlay-key",
  timestamp: "2024-01-01T00:00:00Z"
}

// New reaction
{
  type: "reaction.new", 
  text: "Reaction text",
  audioUrl: "/tmp/reaction.mp3",
  style: "support",
  tier: "BASIC",
  orderId: "order-id"
}
```

## Development

### Adding New Tiers
1. Update `TIERS` in `src/server/store.js`
2. Add UI elements in `public/store.html`
3. Implement generation logic in `src/server/reactions/queue.js`

### Adding New Styles
1. Add style to `STYLES` in `src/server/store.js`
2. Add system prompt in `src/server/prompt.js`
3. Add UI option in `public/store.html`

### Testing
- Use `/__overlay/test` endpoint for testing
- Check server logs for debugging
- Monitor WebSocket connections via `/__stats`

## Production Considerations

### Security
- Validate all WebSocket messages
- Rate limit API endpoints
- Sanitize user inputs
- Use HTTPS in production

### Performance  
- Implement Redis for session storage
- Add database for persistent data
- Cache frequently accessed data
- Monitor OpenAI API usage

### Scaling
- Load balancer for multiple servers
- WebSocket clustering
- Queue system for high volume
- CDN for static assets

## Troubleshooting

### Common Issues
1. **WebSocket not connecting**: Check overlay key and server status
2. **Audio not playing**: Verify OpenAI API key and audio file generation
3. **Payments failing**: Check Stripe keys and webhook configuration
4. **Reactions not appearing**: Verify queue processing and WebSocket delivery

### Debug Endpoints
- `/__health` - Server status
- `/__stats` - Connection and order statistics  
- `/__overlay/test` - Test reaction delivery

## License
MIT License - See LICENSE file for details


