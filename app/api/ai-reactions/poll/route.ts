import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const streamerId = searchParams.get('streamerId');
    
    if (!streamerId) {
      return NextResponse.json({ error: 'Missing streamerId' }, { status: 400 });
    }

    // Get reactions for this streamer
    const reactions = (global as any).aiReactions?.get(streamerId) || [];
    
    // Clear reactions after sending (one-time delivery)
    if ((global as any).aiReactions) {
      (global as any).aiReactions.set(streamerId, []);
    }

    return NextResponse.json({ reactions });

  } catch (error: any) {
    console.error('Poll reactions error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to poll reactions' 
    }, { status: 500 });
  }
}


