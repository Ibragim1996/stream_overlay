// app/api/__health/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(JSON.stringify({
    ok: true,
    time: Date.now(),
    status: 'healthy',
    uptime: process.uptime()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
