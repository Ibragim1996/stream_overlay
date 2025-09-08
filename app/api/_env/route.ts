// app/api/_env/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = {
    node: process.versions?.node || null,
    env: {
      UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      FIREBASE_SERVICE_ACCOUNT_KEY: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    },
    region: (process as any).env?.VERCEL_REGION || null,
    runtime: 'nodejs',
  };
  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}