// lib/openai-realtime.ts
import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (openaiClient) return openaiClient;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

// Export for backward compatibility
export const openai = new Proxy({} as unknown as OpenAI, {
  get(_target, prop, receiver) {
    const inst: any = getOpenAI();
    const val = Reflect.get(inst, prop, receiver);
    return typeof val === 'function' ? val.bind(inst) : val;
  },
}) as unknown as OpenAI;

// Realtime API configuration
export const REALTIME_CONFIG = {
  // Preferred model, fallback to preview if not available
  model: 'gpt-realtime',
  fallbackModel: 'gpt-4o-realtime-preview',
  
  // WebSocket URL
  wsUrl: 'wss://api.openai.com/v1/realtime',
  
  // Headers for WebSocket connection
  getHeaders: () => ({
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'OpenAI-Beta': 'realtime=v1'
  }),
  
  // Default voice settings
  defaultVoice: 'ash',
  availableVoices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'ash'],
  
  // Rate limits
  freeUserLimit: 10, // per hour
  premiumUserLimit: -1, // unlimited
};

// Check if Realtime API is available
export async function checkRealtimeAvailability(): Promise<boolean> {
  try {
    // Try to create a test connection
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: REALTIME_CONFIG.model,
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 1
    });
    return true;
  } catch (error) {
    console.log('Realtime API not available, using fallback');
    return false;
  }
}

// Get the best available model
export function getBestModel(): string {
  return REALTIME_CONFIG.model;
}
