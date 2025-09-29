// app/api/ws/send-task/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface SendTaskRequest {
  overlayKey: string;
  mode?: string;
  tone?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SendTaskRequest = await req.json();
    const { overlayKey, mode = 'funny', tone = 'playful' } = body;

    if (!overlayKey) {
      return NextResponse.json(
        { success: false, error: 'Missing overlayKey' },
        { status: 400 }
      );
    }

    // Import WebSocket hub
    const wsHub = require('../../../../src/server/overlay/wsHub');
    
    // Send emotional task via WebSocket
    await wsHub.sendEmotionalTask(overlayKey, mode, tone);

    return NextResponse.json({
      success: true,
      message: 'Emotional task sent via WebSocket'
    });

  } catch (error) {
    console.error('Error sending task via WebSocket:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send task' },
      { status: 500 }
    );
  }
}
