import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Runtime configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAI({ apiKey });
}

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'alloy', mode = 'funny' } = await req.json();
    
    if (!text) {
      return new Response('Text is required', { status: 400 });
    }

    // Create a more natural, conversational text with emotions
    let enhancedText = text;
    
    if (mode === 'street') {
      // Add street slang and natural speech patterns
      enhancedText = text
        .replace(/\./g, '... ')
        .replace(/!/g, '! ')
        .replace(/\?/g, '? ')
        .replace(/yo/gi, 'yo ')
        .replace(/bruh/gi, 'bruh ')
        .replace(/wtf/gi, 'WTF ')
        .replace(/no cap/gi, 'no cap ')
        .replace(/fr fr/gi, 'fr fr ')
        .replace(/bet/gi, 'bet ')
        .replace(/slaps/gi, 'slaps ')
        .replace(/fire/gi, 'fire ')
        .replace(/vibe/gi, 'vibe ')
        .replace(/mood/gi, 'mood ')
        .replace(/facts/gi, 'facts ')
        .replace(/period/gi, 'period ')
        .replace(/on god/gi, 'on god ')
        .replace(/deadass/gi, 'deadass ')
        .replace(/lowkey/gi, 'lowkey ')
        .replace(/highkey/gi, 'highkey ')
        .replace(/sus/gi, 'sus ')
        .replace(/bussin/gi, 'bussin ')
        .replace(/periodt/gi, 'periodt ');
    } else if (mode === 'funny') {
      // Add comedic expressions and laughter
      enhancedText = text
        .replace(/\./g, '... ')
        .replace(/!/g, '! ')
        .replace(/\?/g, '? ')
        .replace(/haha/gi, 'haha ')
        .replace(/lol/gi, 'lol ')
        .replace(/lmao/gi, 'lmao ')
        .replace(/rofl/gi, 'rofl ')
        .replace(/funny/gi, 'funny ')
        .replace(/joke/gi, 'joke ')
        .replace(/hilarious/gi, 'hilarious ');
    } else if (mode === 'serious') {
      // Add serious tone and emphasis
      enhancedText = text
        .replace(/\./g, '. ')
        .replace(/!/g, '! ')
        .replace(/\?/g, '? ')
        .replace(/important/gi, 'important ')
        .replace(/serious/gi, 'serious ')
        .replace(/critical/gi, 'critical ')
        .replace(/urgent/gi, 'urgent ');
    } else if (mode === 'chill') {
      // Add relaxed tone
      enhancedText = text
        .replace(/\./g, '... ')
        .replace(/!/g, '! ')
        .replace(/\?/g, '? ')
        .replace(/chill/gi, 'chill ')
        .replace(/relax/gi, 'relax ')
        .replace(/cool/gi, 'cool ')
        .replace(/nice/gi, 'nice ')
        .replace(/sweet/gi, 'sweet ');
    }

    // Use OpenAI TTS API with enhanced text for more natural speech
    const openai = getOpenAI();
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: enhancedText,
      response_format: 'mp3',
      speed: mode === 'street' ? 1.1 : mode === 'serious' ? 0.9 : 1.0,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    return new Response(buffer as BodyInit, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Voice generation error:', error);
    return new Response('Voice generation failed', { status: 500 });
  }
}