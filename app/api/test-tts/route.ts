import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text || "Hello, this is a test of the text-to-speech system.";
    
    console.log('[TTS Test] Generating TTS for:', text);
    
    // Check if we have OpenAI API key
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    console.log('[TTS Test] Has OpenAI API key:', hasOpenAI);
    
    if (!hasOpenAI) {
      return new Response(JSON.stringify({
        success: false,
        error: 'OPENAI_API_KEY not found',
        message: 'Please set OPENAI_API_KEY environment variable'
      }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    // Try to generate TTS
    try {
      const { synthesize } = await import('@/lib/tts');
      const result = await synthesize({
        text,
        mode: 'funny',
        tone: 'calm'
      });
      
      console.log('[TTS Test] TTS generated successfully, buffer size:', result.audioBuffer.length);
      
      // Return the audio as base64 for testing
      const base64Audio = result.audioBuffer.toString('base64');
      
      return new Response(JSON.stringify({
        success: true,
        message: 'TTS generated successfully',
        audioSize: result.audioBuffer.length,
        mime: result.mime,
        model: result.model,
        voice: result.voice,
        audioBase64: base64Audio
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
      
    } catch (ttsError) {
      console.error('[TTS Test] TTS generation failed:', ttsError);
      
      return new Response(JSON.stringify({
        success: false,
        error: 'TTS generation failed',
        details: ttsError?.message || 'Unknown error'
      }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }
    
  } catch (e) {
    console.error('[TTS Test] Error:', e);
    return new Response(JSON.stringify({
      success: false,
      error: e?.message || 'Unknown error'
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({
    message: 'TTS Test endpoint',
    usage: 'POST with { "text": "your text here" }',
    hasOpenAI: !!process.env.OPENAI_API_KEY
  }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}





