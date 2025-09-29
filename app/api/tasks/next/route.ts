// app/api/tasks/next/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai-realtime';
import { buildSystemPrompt } from '@/lib/prompt-builder';
import { ttsGenerator, type Voice } from '@/lib/tts-generator';
import { overlayStorage, type OverlayState } from '@/lib/storage';
import { taskRateLimit, createRateLimitResponse } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TaskRequest {
  overlayKey: string;
  mode: string;
  tone: string;
  voice?: Voice;
  speed?: number;
}

interface TaskResponse {
  success: boolean;
  data?: {
    text: string;
    voiceUrl: string;
    mode: string;
    tone: string;
    updatedAt: number;
  };
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

export async function POST(req: NextRequest): Promise<NextResponse<TaskResponse>> {
  try {
    // Rate limiting
    const rateLimitResult = await taskRateLimit.checkLimit(req);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.retryAfter!);
    }

    // Parse request body
    const body: TaskRequest = await req.json();
    const { overlayKey, mode, tone, voice = 'alloy', speed = 1.0 } = body;

    // Validate required fields
    if (!overlayKey || !mode || !tone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: overlayKey, mode, tone' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate voice
    if (!ttsGenerator.isValidVoice(voice)) {
      return NextResponse.json(
        { success: false, error: `Invalid voice. Must be one of: alloy, echo, fable, onyx, nova, shimmer` },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Generating task for overlay ${overlayKey} with mode: ${mode}, tone: ${tone}, voice: ${voice}`);

    // Generate text using OpenAI
    const systemPrompt = buildSystemPrompt(mode as any, 'just_chatting' as any);
    const userPrompt = `Generate a ${tone} task for a ${mode} stream. Make it engaging and specific.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    const generatedText = completion.choices[0]?.message?.content?.trim();
    if (!generatedText) {
      throw new Error('Failed to generate text from OpenAI');
    }

    console.log(`Generated text: "${generatedText}"`);

    // Generate TTS audio
    const audioBuffer = await ttsGenerator.generateSpeechWithRetry({
      text: generatedText,
      voice: voice,
      speed: speed,
      format: 'mp3'
    });

    // Store audio and get URL
    const timestamp = Date.now();
    const audioPath = overlayStorage.generateAudioPath(overlayKey, timestamp);
    const voiceUrl = await overlayStorage.storeAudioMetadata(audioPath, overlayKey);

    // Create overlay state
    const overlayState: OverlayState = {
      text: generatedText,
      voiceUrl: voiceUrl,
      mode: mode,
      tone: tone,
      updatedAt: timestamp
    };

    // Store state in Redis
    await overlayStorage.setOverlayState(overlayKey, overlayState);

    console.log(`Task generated successfully for overlay ${overlayKey}`);

    return NextResponse.json(
      {
        success: true,
        data: overlayState
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
    console.error('Task generation error:', error);
    
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
