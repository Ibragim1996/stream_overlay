import { NextRequest } from 'next/server';
import WebSocket from 'ws';

export async function GET(req: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_USE_WEBSOCKET !== 'true') {
      return new Response(JSON.stringify({ ok: false, error: 'websocket_disabled' }), {
        status: 404,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
      });
    }
    const url = new URL(req.url);
    const text = url.searchParams.get('text');
    const voice = url.searchParams.get('voice') || 'alloy';
    const mode = url.searchParams.get('mode') || 'funny';
    
    if (!text) {
      return new Response('Text is required', { status: 400 });
    }

    // Create WebSocket connection to OpenAI Realtime API
    const ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    });

    return new Response('WebSocket connection established', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('WebSocket error:', error);
    return new Response('WebSocket connection failed', { status: 500 });
  }
}