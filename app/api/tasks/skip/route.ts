// app/api/tasks/skip/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { overlayStorage } from '@/lib/storage';
import { taskRateLimit, createRateLimitResponse } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SkipRequest {
  overlayKey: string;
}

interface SkipResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '600',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest): Promise<NextResponse<SkipResponse>> {
  try {
    // Rate limiting
    const rateLimitResult = await taskRateLimit.checkLimit(req);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.retryAfter!);
    }

    // Parse request body
    const body: SkipRequest = await req.json();
    const { overlayKey } = body;

    // Validate required fields
    if (!overlayKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: overlayKey' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Skipping task for overlay ${overlayKey}`);

    // Get current state
    const currentState = await overlayStorage.getOverlayState(overlayKey);
    
    if (!currentState) {
      return NextResponse.json(
        { success: false, error: 'No active task found for this overlay' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Clear the current state (skip the task)
    await overlayStorage.deleteOverlayState(overlayKey);

    console.log(`Task skipped successfully for overlay ${overlayKey}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Task skipped successfully'
      },
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Cache-Control': 'no-store',
        }
      }
    );

  } catch (error) {
    console.error('Task skip error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}
