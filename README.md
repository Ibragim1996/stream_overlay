# Vibekip

AI-powered overlay system for streamers with real-time task generation and voice synthesis.

## 🌐 Production Domain

**Live Site:** [https://vibekip.com](https://vibekip.com)

## 🚀 Features

- **Real-time Overlay**: Dynamic task generation for streamers
- **AI Voice Synthesis**: OpenAI TTS with emotional styles
- **Firebase Integration**: User authentication and data storage
- **Streamer Panel**: Control interface for overlay management
- **Production Ready**: Optimized for live streaming environments

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google + Email/Password)
- **Storage**: Firebase Storage
- **AI**: OpenAI GPT-4o-mini + TTS
- **Caching**: Upstash Redis
- **Deployment**: Vercel

## 🏃‍♂️ Quick Start

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

### Production

The project is deployed at [https://vibekip.com](https://vibekip.com)

## 📋 Environment Variables

### Required (Production)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `FIREBASE_SERVICE_ACCOUNT_KEY`
- `OPENAI_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_SITE_URL=https://vibekip.com`

### Optional
- `TTS_VOICE_ID`
- `STRIPE_SECRET_KEY` (for billing)
- `STRIPE_WEBHOOK_SECRET` (for billing)

## 🔍 Environment Check

Visit `/env-check` to verify all environment variables are properly configured.

## 📚 Documentation

- [Firebase Setup Guide](FIREBASE_SETUP_GUIDE.md)
- [Environment Checklist](VERCEL_ENV_CHECKLIST.md)
- [Deployment Guide](VERCEL_DEPLOY_GUIDE_RU.md)

## 🎯 Key URLs

- **Main Site**: https://vibekip.com
- **Streamer Panel**: https://vibekip.com/panel
- **Overlay**: https://vibekip.com/overlay?key=YOUR_KEY
- **Environment Check**: https://vibekip.com/env-check
- **Health Check**: https://vibekip.com/health

## 🚀 Deployment

The project is automatically deployed to Vercel with the custom domain `vibekip.com`.

### Manual Deployment
1. Set all environment variables in Vercel
2. Redeploy without build cache
3. Verify at `/env-check`

## 📄 License

Private project - All rights reserved.
