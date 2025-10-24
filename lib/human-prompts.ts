// lib/human-prompts.ts
// Ultra-human prompt builder with real street slang and natural speech patterns

export type Mode = 'funny' | 'motivator' | 'serious' | 'chill' | 'street';
export type TaskType = 'question' | 'challenge' | 'banter' | 'task';
export type StreamKind = 'just_chatting' | 'irl' | 'gaming' | 'other';

// Real internet slang and living language
const LIVING_SLANG = {
  reactions: ['no way', 'bruh', 'frfr', 'nah bro', 'yo', 'facts', 'period', 'deadass', 'lowkey', 'highkey'],
  fillers: ['um', 'uh', 'like', 'you know', 'I mean', 'so like', 'basically', 'honestly'],
  excitement: ['let\'s go', 'yooo', 'sheesh', 'this is it', 'we\'re back', 'here we go', 'wait wait'],
  casual: ['what\'s up', 'sup', 'hey', 'yo chat', 'alright', 'so', 'anyway'],
  emphasis: ['literally', 'actually', 'honestly', 'for real', 'no cap', 'on god']
};

// Build ultra-human system prompt
export function buildHumanPrompt(mode: Mode, taskType: TaskType, streamKind: StreamKind, recent: string[] = []): string {
  const baseRules = `You are generating ONE single-line task/question for a livestream overlay.
CRITICAL RULES:
- Output ONLY ONE line, maximum 140 characters
- NO quotes, NO numbering (1., 2., etc), NO asterisks
- Sound like a REAL HUMAN talking naturally
- Use natural speech patterns: pauses, fillers, casual language
- Address the streamer directly by "you" or "yo"
- Make it feel spontaneous and alive, not scripted`;

  const modeStyle = {
    funny: `Style: Playful, witty, use humor and light teasing. Add natural reactions like "bruh", "yo", "haha". 
Examples: "yo, quick question - what's your most embarrassing gaming moment?", "chat wants to know: pineapple on pizza, yes or nah?"`,
    
    motivator: `Style: Supportive, energetic, hyping up. Use encouraging phrases naturally.
Examples: "alright, let's see you do a quick stretch - you got this!", "yo chat, drop some love for this legend real quick"`,
    
    serious: `Style: Direct, thoughtful, no fluff. Still casual but focused.
Examples: "what's one thing you learned this week that actually mattered?", "real talk - how do you handle burnout?"`,
    
    chill: `Style: Relaxed, laid-back, conversational. Like talking to a friend.
Examples: "so like, what's your comfort food when you're just vibing?", "chat's curious - what's your go-to late night snack?"`,
    
    street: `Style: Urban, modern slang, Gen Z vibes. Use: bruh, yo, frfr, no cap, lowkey, deadass, facts, period, bet.
Examples: "yo chat, rate the fit 1-10, be honest frfr", "bruh what's the most mid thing about your setup no cap?", "lowkey wanna know - what's your most controversial take on anything?"`,
  };

  const taskTypeHint = {
    question: 'Ask ONE engaging question. Natural and conversational.',
    challenge: 'Give ONE quick, fun challenge. Something doable on camera.',
    banter: 'Make ONE playful comment or light roast. Keep it friendly.',
    task: 'Suggest ONE quick action or micro-task. Simple and clear.'
  };

  const contextHint = {
    just_chatting: 'Context: sitting at desk, talking with chat',
    irl: 'Context: on the move, outside/IRL',
    gaming: 'Context: playing a game',
    other: 'Context: general stream'
  };

  let avoidRepeat = '';
  if (recent.length > 0) {
    avoidRepeat = `\nRecent lines to AVOID repeating: ${recent.slice(0, 5).join(' | ')}`;
  }

  return `${baseRules}

${modeStyle[mode]}

${taskTypeHint[taskType]}

${contextHint[streamKind]}
${avoidRepeat}

IMPORTANT: Be natural, spontaneous, use casual language. Sound like a real person talking, not a robot.
Generate ONE line now:`;
}

// Sanitize output to ensure single line
export function sanitizeOutput(text: string): string {
  return text
    .split('\n')[0] // Take only first line
    .replace(/^[\d\.\)\-\*]+\s*/, '') // Remove numbering
    .replace(/^["'`]+|["'`]+$/g, '') // Remove quotes
    .replace(/\s+/g, ' ') // Collapse spaces
    .trim()
    .slice(0, 140); // Max 140 chars
}

// Add natural variations to make text more human
export function humanizeText(text: string, mode: Mode): string {
  let output = text;
  const random = Math.random();

  // Add natural fillers sometimes
  if (random < 0.15 && mode !== 'serious') {
    const filler = LIVING_SLANG.fillers[Math.floor(Math.random() * LIVING_SLANG.fillers.length)];
    output = output.replace(/^/, `${filler}, `);
  }

  // Add casual reactions for street mode
  if (mode === 'street' && random < 0.2) {
    const reaction = LIVING_SLANG.reactions[Math.floor(Math.random() * LIVING_SLANG.reactions.length)];
    output = output.replace(/^/, `${reaction}, `);
  }

  // Add excitement for funny/motivator
  if ((mode === 'funny' || mode === 'motivator') && random < 0.15) {
    output = output.replace(/!$/, '!!');
  }

  return output.slice(0, 140); // Ensure we don't exceed limit
}
