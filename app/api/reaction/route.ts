// app/api/reaction/route.ts
import { NextRequest } from 'next/server';
import { userDB } from '@/lib/user-db';
import { withPremiumAuth } from '@/lib/auth-middleware';
import { openai } from '@/lib/openai-realtime';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt-builder';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ReactionRequest {
  trigger: string;
  chatSample?: string;
  speak?: boolean;
}

// POST /api/reaction - Generate AI reaction (Premium only)
export const POST = withPremiumAuth(async (req) => {
  try {
    const body: ReactionRequest = await req.json();
    const user = req.user;
    
    if (!body.trigger) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Trigger is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check cooldown
    if (!userDB.canReact(user.id)) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Cooldown active, please wait 5 seconds'
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Set reaction time
    userDB.setReactionTime(user.id);
    
    // Build prompt based on user profile
    const profile = user.profile || {
      category: 'just_chatting',
      tone: 'funny',
      slangLevel: 5,
      language: 'en',
      voice: 'ash'
    };
    
    const systemPrompt = buildSystemPrompt(profile, {
      category: profile.category,
      tone: profile.tone,
      slangLevel: profile.slangLevel,
      language: profile.language,
      context: 'reaction',
      trigger: body.trigger,
      chatSample: body.chatSample
    });
    
    const userPrompt = buildUserPrompt(body.trigger, body.chatSample);
    
    // Generate reaction using OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 100,
      temperature: 0.9
    });
    
    const reaction = response.choices[0]?.message?.content?.trim() || 'No reaction generated';
    
    // If speak is requested, we'll handle it via WebSocket
    // For now, just return the text
    const result = {
      ok: true,
      reaction,
      speak: body.speak || false,
      voice: profile.voice
    };
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Reaction generation error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: 'Failed to generate reaction'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
