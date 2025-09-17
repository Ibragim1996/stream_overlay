import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { streamerId, style, tier, context } = await req.json();
    
    if (!streamerId || !style || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate AI reaction based on style and context
    const reaction = await generateAIReaction(style, tier, context);
    
    // Generate emotional voice
    const audioUrl = await generateEmotionalVoice(reaction.text, style);
    
    return NextResponse.json({
      id: `reaction-${Date.now()}`,
      text: reaction.text,
      style: style,
      tier: tier,
      audioUrl: audioUrl,
      timestamp: Date.now()
    });

  } catch (error: any) {
    console.error('AI reaction generation error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate AI reaction' 
    }, { status: 500 });
  }
}

async function generateAIReaction(style: string, tier: string, context?: string) {
  const systemPrompt = buildSystemPrompt(style, context);
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: context || "The streamer is doing something interesting on stream right now."
      }
    ],
    max_tokens: 100,
    temperature: 0.8
  });

  return {
    text: completion.choices[0]?.message?.content || "Nice try!",
    style: style,
    tier: tier
  };
}

function buildSystemPrompt(style: string, context?: string) {
  const basePrompt = `You are an AI reaction bot for a live streamer. Generate a short, punchy reaction (1-2 sentences max) that will be spoken with emotional voice.`;

  const stylePrompts = {
    support: `Be encouraging and positive. Use phrases like "You got this!", "Amazing work!", "Keep it up!". Sound like a supportive friend cheering them on.`,
    light_troll: `Be playfully teasing and sarcastic. Use phrases like "Oh come on!", "Really?", "That was... interesting". Sound like a friend gently mocking them.`,
    hard_troll: `Be brutally honest and critical. Use phrases like "Dude, what are you doing?", "This is painful to watch", "Get it together!". Sound like someone who's fed up with their performance.`
  };

  const contextPrompt = context ? `The streamer is currently: ${context}. React to what they're doing right now.` : '';

  return `${basePrompt}\n\n${stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.support}\n\n${contextPrompt}\n\nKeep it under 15 words. Make it sound natural when spoken aloud.`;
}

async function generateEmotionalVoice(text: string, style: string) {
  try {
    // Map styles to emotional voice settings
    const voiceSettings = {
      support: {
        voice: "nova", // Bright and energetic
        speed: 1.1,
        pitch: 1.2,
        emphasis: "high"
      },
      light_troll: {
        voice: "echo", // Expressive and dynamic
        speed: 0.9,
        pitch: 0.8,
        emphasis: "sarcastic"
      },
      hard_troll: {
        voice: "onyx", // Deep and authoritative
        speed: 0.8,
        pitch: 0.7,
        emphasis: "stern"
      }
    };

    const settings = voiceSettings[style as keyof typeof voiceSettings] || voiceSettings.support;

    // Generate emotional text with voice instructions
    const emotionalText = addVoiceInstructions(text, settings);
    
    const response = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: settings.voice as any,
      input: emotionalText,
      response_format: "mp3",
      speed: settings.speed
    });

    // Convert to base64 for immediate playback
    const buffer = Buffer.from(await response.arrayBuffer());
    const base64 = buffer.toString('base64');
    
    return `data:audio/mp3;base64,${base64}`;

  } catch (error) {
    console.error('Voice generation error:', error);
    // Fallback to text-only
    return null;
  }
}

function addVoiceInstructions(text: string, settings: any) {
  // Add emotional cues for better voice generation
  const emotionalCues = {
    support: "😊 ",
    light_troll: "😏 ",
    hard_troll: "😤 "
  };

  const cue = emotionalCues[settings.emphasis as keyof typeof emotionalCues] || "";
  
  // Add emphasis and pacing instructions
  let enhancedText = text;
  
  if (settings.emphasis === "high") {
    enhancedText = `*excited* ${text} *cheering*`;
  } else if (settings.emphasis === "sarcastic") {
    enhancedText = `*sarcastic tone* ${text} *chuckling*`;
  } else if (settings.emphasis === "stern") {
    enhancedText = `*stern voice* ${text} *disappointed*`;
  }

  return `${cue}${enhancedText}`;
}


