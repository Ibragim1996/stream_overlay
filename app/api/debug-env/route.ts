export async function GET() {
  return Response.json({
    apiKeyLen: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '').length,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''
  });
}