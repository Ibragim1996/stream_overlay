// app/api/debug-env/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const url   = process.env.UPSTASH_REDIS_REST_URL ?? '';
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? '';

  return new Response(JSON.stringify({
    ok: true,
    url: Boolean(url),
    token: Boolean(token),
    // немного префиксов для визуальной сверки, без утечек
    urlPrefix: url ? url.slice(0, 32) : null,
    tokenPrefix: token ? token.slice(0, 8) : null,
  }), { headers: { 'content-type': 'application/json' } });
}