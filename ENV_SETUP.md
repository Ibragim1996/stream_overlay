# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Redis Configuration
REDIS_URL=your_redis_url_here

# Other Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## How to get Firebase credentials:

1. Go to https://console.firebase.google.com/
2. Create a new project or select existing
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Click "Add app" > Web app
6. Copy the config values

## Current Issues:

1. **Overlay not working** - Next.js turbopack error fixed
2. **Google OAuth not working** - Need Firebase credentials
3. **Missing environment variables** - Need to create .env.local

## Next Steps:

1. Create .env.local file with your credentials
2. Restart the development server
3. Test overlay and authentication


