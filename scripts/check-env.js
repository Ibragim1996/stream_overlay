#!/usr/bin/env node

/**
 * Environment Variables Checker
 * 
 * This script checks if all required environment variables are set
 * and provides guidance for Vercel deployment.
 */

const requiredVars = {
  // Client-side (NEXT_PUBLIC_*)
  client: [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_USE_WEBSOCKET'
  ],
  
  // Server-side (secrets)
  server: [
    'OPENAI_API_KEY',
    'FIREBASE_SERVICE_ACCOUNT_KEY',
    'TTS_VOICE_ID'
  ],
  
  // Optional
  optional: [
    'TTS_MODEL',
    'TTS_FORMAT',
    'TTS_SAMPLE_RATE',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN'
  ]
};

function checkEnv() {
  console.log('🔍 Environment Variables Check\n');
  
  const missing = [];
  const present = [];
  
  // Check client variables
  console.log('📱 Client-side variables (NEXT_PUBLIC_*):');
  requiredVars.client.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}`);
      present.push(varName);
    } else {
      console.log(`  ❌ ${varName} - MISSING`);
      missing.push(varName);
    }
  });
  
  console.log('\n🔐 Server-side variables:');
  requiredVars.server.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}`);
      present.push(varName);
    } else {
      console.log(`  ❌ ${varName} - MISSING`);
      missing.push(varName);
    }
  });
  
  console.log('\n⚙️  Optional variables:');
  requiredVars.optional.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}`);
    } else {
      console.log(`  ⚪ ${varName} - not set (using defaults)`);
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`  Total required: ${requiredVars.client.length + requiredVars.server.length}`);
  console.log(`  Present: ${present.length}`);
  console.log(`  Missing: ${missing.length}`);
  
  if (missing.length > 0) {
    console.log('\n❌ Missing required variables:');
    missing.forEach(varName => console.log(`  - ${varName}`));
    
    console.log('\n🚀 Vercel Setup Instructions:');
    console.log('1. Go to your Vercel project → Settings → Environment Variables');
    console.log('2. Add the missing variables:');
    console.log('   - For NEXT_PUBLIC_*: Set for Production, Preview, and Development');
    console.log('   - For secrets: Set for Production and Preview only');
    console.log('3. Redeploy without cache:');
    console.log('   - Go to Deployments tab');
    console.log('   - Click "..." on latest deployment');
    console.log('   - Select "Redeploy"');
    console.log('   - Uncheck "Use existing build cache"');
    
    process.exit(1);
  } else {
    console.log('\n✅ All required environment variables are set!');
    
    // Check for common issues
    console.log('\n🔧 Additional checks:');
    
    // Check FIREBASE_SERVICE_ACCOUNT_KEY format
    const serviceKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceKey) {
      try {
        const parsed = JSON.parse(serviceKey);
        if (parsed.type === 'service_account') {
          console.log('  ✅ FIREBASE_SERVICE_ACCOUNT_KEY is valid JSON');
        } else {
          console.log('  ⚠️  FIREBASE_SERVICE_ACCOUNT_KEY may not be a service account key');
        }
      } catch (e) {
        console.log('  ❌ FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON');
        console.log('     Make sure it\'s a single-line JSON string');
      }
    }
    
    // Check WebSocket flag
    const useWs = process.env.NEXT_PUBLIC_USE_WEBSOCKET;
    if (useWs === 'false') {
      console.log('  ✅ WebSocket is disabled (MVP mode)');
    } else if (useWs === 'true') {
      console.log('  ⚠️  WebSocket is enabled (not recommended for MVP)');
    } else {
      console.log('  ⚠️  NEXT_PUBLIC_USE_WEBSOCKET not set (defaults to false)');
    }
    
    console.log('\n🎉 Ready for deployment!');
  }
}

// Run the check
checkEnv();

