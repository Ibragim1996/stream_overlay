// app/api/__version/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const buildId = process.env.BUILD_ID || Date.now().toString();
  
  return new Response(JSON.stringify({
    buildId,
    time: Date.now(),
    version: '1.0.0',
    features: [
      'Free tier with 10 tasks/hour limit',
      'Premium tier with unlimited access',
      'OpenAI Realtime API integration',
      'Voice synthesis and AI reactions',
      'Street slang and modern expressions'
    ]
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
