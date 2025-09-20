# Vercel Deployment Checklist

## ✅ Code Issues Fixed
- [x] All localhost URLs replaced with production URLs
- [x] OpenAI client lazy loading implemented
- [x] Stripe client lazy loading implemented
- [x] useSearchParams wrapped in Suspense boundaries
- [x] Route conflicts resolved
- [x] Build passes locally (npm run build)

## 🔧 Environment Variables Required in Vercel

### Critical (Must Have):
- `OPENAI_API_KEY` - Your OpenAI API key
- `OVERLAY_SECRET` - Secret for overlay authentication
- `OVERLAY_SIGN_SECRET` - Secret for overlay signing

### Important:
- `NEXT_PUBLIC_APP_URL` - Your Vercel app URL (e.g., https://ai-stream-new.vercel.app)
- `NEXT_PUBLIC_BASE_URL` - Same as APP_URL
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret

### Optional but Recommended:
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_PRICE_PRO_MONTH` - Stripe price ID for monthly plan
- `STRIPE_PRICE_PRO_YEAR` - Stripe price ID for yearly plan

## 🚀 Deployment Steps

1. **Push to GitHub** ✅ (Already done)
2. **Connect Vercel to GitHub repository** ✅ (Already done)
3. **Add Environment Variables** ⚠️ (Check this!)
4. **Redeploy** ⚠️ (Do this after adding env vars)

## 🔍 Common Issues

### Build Fails:
- Missing environment variables
- Import/export errors
- TypeScript errors

### Runtime Errors:
- Missing API keys
- Incorrect URLs
- CORS issues

## 📋 Quick Fix Commands

If you need to check what's wrong:

```bash
# Check build locally
npm run build

# Check for localhost references
grep -r "localhost" app/ lib/

# Check environment variables
grep -r "process.env" app/ lib/
```

## 🎯 Next Steps

1. **Add missing environment variables in Vercel**
2. **Redeploy the project**
3. **Test the deployed URL**

If you're still having issues, please share:
- The exact error message from Vercel
- Which step is failing (build or runtime)
- Screenshot of the error if possible
