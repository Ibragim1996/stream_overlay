import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get git commit hash from environment or fallback
    const commitHash = process.env.VERCEL_GIT_COMMIT_SHA || 
                      process.env.GIT_COMMIT_SHA || 
                      process.env.COMMIT_SHA || 
                      'unknown';
    
    // Get deployment info
    const deploymentId = process.env.VERCEL_DEPLOYMENT_ID || 'local';
    const environment = process.env.VERCEL_ENV || 'development';
    
    // Get timestamp
    const timestamp = new Date().toISOString();
    
    // Get uptime (approximate)
    const uptime = process.uptime();
    
    return NextResponse.json({
      status: 'ok',
      commit: commitHash,
      deployment: deploymentId,
      environment,
      timestamp,
      uptime: Math.floor(uptime),
      version: process.env.npm_package_version || '1.0.0'
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}
