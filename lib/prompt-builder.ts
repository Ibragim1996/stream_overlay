// lib/prompt-builder.ts
import type { UserProfile } from './user-db';

export interface PromptOptions {
  category: string;
  tone: string;
  slangLevel: number;
  language: string;
  context?: string;
  trigger?: string;
  chatSample?: string;
}

// Build system prompt based on user profile
export function buildSystemPrompt(profile: UserProfile, options: PromptOptions): string {
  const { category, tone, slangLevel, language, context, trigger, chatSample } = options;
  
  let prompt = `You are an AI assistant for live streaming. `;
  
  // Category context
  switch (category) {
    case 'gaming':
      prompt += `Context: Gaming stream. `;
      break;
    case 'irl':
      prompt += `Context: IRL (In Real Life) stream, outdoor activities. `;
      break;
    case 'just_chatting':
      prompt += `Context: Just Chatting stream, casual conversation. `;
      break;
    default:
      prompt += `Context: General streaming. `;
  }
  
  // Tone
  switch (tone) {
    case 'street':
      prompt += `Use modern American street slang: WTF, Dan what are you doing man, what the hell, yo, bruh, no cap, fr fr, bet, slaps, fire, vibe, mood, facts, period, on god, deadass, lowkey, highkey, sus, bussin, periodt. `;
      break;
    case 'funny':
      prompt += `Be playful, witty, and humorous. `;
      break;
    case 'serious':
      prompt += `Be concise, focused, and professional. `;
      break;
    case 'chill':
      prompt += `Be relaxed, calm, and low-pressure. `;
      break;
  }
  
  // Slang level (0-10)
  if (slangLevel > 5) {
    prompt += `Use more casual, modern language and slang. `;
  } else if (slangLevel < 3) {
    prompt += `Use formal, professional language. `;
  }
  
  // Language
  switch (language) {
    case 'ru':
      prompt += `Respond in Russian. `;
      break;
    case 'es':
      prompt += `Respond in Spanish. `;
      break;
    default:
      prompt += `Respond in English. `;
  }
  
  // Context-specific instructions
  if (context === 'task') {
    prompt += `Generate a short, engaging task or challenge for the streamer (max 140 characters). `;
  } else if (context === 'reaction') {
    prompt += `Generate a short reaction or comment based on the trigger (max 100 characters). `;
    if (chatSample) {
      prompt += `Chat context: "${chatSample}". `;
    }
  }
  
  // Safety
  prompt += `Stay TOS-safe: no slurs, hate, harassment, explicit content, or dangerous activities. `;
  
  return prompt;
}

// Build user prompt for specific scenarios
export function buildUserPrompt(trigger: string, chatSample?: string): string {
  let prompt = `Trigger: "${trigger}"`;
  
  if (chatSample) {
    prompt += `\nChat context: "${chatSample}"`;
  }
  
  return prompt;
}
