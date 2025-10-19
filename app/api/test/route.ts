// Test API endpoint for debugging
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(JSON.stringify({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    env: {
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasFirebase: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      hasStorage: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      hasRedis: !!process.env.UPSTASH_REDIS_REST_URL,
    }
  }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return new Response(JSON.stringify({
      status: 'ok',
      received: body,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({
      status: 'error',
      error: e?.message || 'unknown error'
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
