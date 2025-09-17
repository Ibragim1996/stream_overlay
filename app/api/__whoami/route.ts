// app/api/__whoami/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(JSON.stringify({
    cwd: process.cwd(),
    dirname: __dirname,
    env: process.env.NODE_ENV,
    time: Date.now(),
    nodeVersion: process.version,
    platform: process.platform
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
