// app/api/tasks/state/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { overlayStorage, type OverlayState } from '@/lib/storage';
import { taskRateLimit, createRateLimitResponse } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface StateRequest {
  overlayKey: string;
}

interface StateResponse {
  success: boolean;
  data?: OverlayState;
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

export async function POST(req: NextRequest): Promise<NextResponse<StateResponse>> {
  try {
    // Rate limiting
    const rateLimitResult = await taskRateLimit.checkLimit(req);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.retryAfter!);
    }

    // Parse request body
    const body: StateRequest = await req.json();
    const { overlayKey } = body;

    // Validate required fields
    if (!overlayKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: overlayKey' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Getting state for overlay ${overlayKey}`);

    // Get current state
    const state = await overlayStorage.getOverlayState(overlayKey);
    
    if (!state) {
      return NextResponse.json(
        { success: false, error: 'No state found for this overlay' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: state
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
    console.error('State retrieval error:', error);
    
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
