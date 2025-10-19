import { NextRequest, NextResponse } from 'next/server';
import { synthesizeRealistic } from '@/lib/realistic-tts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, mode = 'funny', tone = 'calm', persona = 'streamer' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log('[Voice API] Generating realistic TTS:', { text: text.substring(0, 50), mode, tone, persona });

    const result = await synthesizeRealistic({
      text,
      mode: mode as any,
      tone: tone as any,
      persona: persona as any
    });

    // Возвращаем аудио как base64
    const base64 = result.audioBuffer.toString('base64');
    const dataUrl = `data:${result.mime};base64,${base64}`;

    return NextResponse.json({
      success: true,
      audioUrl: dataUrl,
      voice: result.voice,
      model: result.model,
      duration: result.durationMs
    });

  } catch (error) {
    console.error('[Voice API] Error:', error);
    return NextResponse.json({ 
      error: 'TTS generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Realistic TTS API',
    supportedModes: ['funny', 'street', 'serious', 'chill', 'hype'],
    supportedTones: ['calm', 'energetic', 'playful', 'sarcastic'],
    supportedPersonas: ['streamer', 'friend', 'hype-man']
  });
}




