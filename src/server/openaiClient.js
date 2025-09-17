const OpenAI = require('openai');

class OpenAIClient {
  constructor() {
    this.client = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;
  }

  // Generate reaction text
  async generateReaction(style, context = {}) {
    if (!this.client) {
      // Return mock response for testing
      const mockResponses = {
        support: "You got this! Keep going! 💪",
        light_troll: "Bruh, that was rough 😅",
        hard_troll: "Come on, focus up! 🔥"
      };
      return mockResponses[style] || "Test reaction";
    }
    
    try {
      const systemPrompt = require('./prompt').SYSTEM_PROMPTS[style];
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Generate a short reaction (≤120 chars) in ${style} style. Context: ${JSON.stringify(context)}`
          }
        ],
        max_tokens: 150,
        temperature: 0.8
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating reaction:', error);
      throw error;
    }
  }

  // Generate audio using Realtime API (fallback to TTS)
  async generateAudio(text, style = 'support', voice = 'verse') {
    if (!this.client) {
      // Return mock audio URL for testing
      return '/tmp/test_audio.mp3';
    }
    
    try {
      // Try Realtime API first
      return await this.generateRealtimeAudio(text, style, voice);
    } catch (error) {
      console.warn('Realtime API failed, falling back to TTS:', error.message);
      return await this.generateTTSAudio(text, voice);
    }
  }

  // Realtime API audio generation
  async generateRealtimeAudio(text, style, voice) {
    const WebSocket = require('ws');
    const fs = require('fs').promises;
    const path = require('path');
    
    return new Promise((resolve, reject) => {
      const ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-realtime', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'realtime=v1'
        }
      });

      let audioChunks = [];
      let sessionId = null;

      ws.on('open', () => {
        // Create session
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: require('./prompt').AUDIO_INSTRUCTIONS[style],
            voice: voice,
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500
            }
          }
        }));

        // Send response
        ws.send(JSON.stringify({
          type: 'response.create',
          response: {
            modalities: ['audio'],
            instructions: `Speak this text naturally: "${text}"`
          }
        }));
      });

      ws.on('message', async (data) => {
        const message = JSON.parse(data);
        
        if (message.type === 'session.created') {
          sessionId = message.session.id;
        } else if (message.type === 'response.audio.delta') {
          audioChunks.push(message.delta);
        } else if (message.type === 'response.done') {
          // Combine audio chunks and save
          try {
            const audioData = Buffer.concat(audioChunks.map(chunk => Buffer.from(chunk, 'base64')));
            const filename = `reaction_${Date.now()}.mp3`;
            const filepath = path.join(process.cwd(), 'tmp', filename);
            
            await fs.mkdir(path.dirname(filepath), { recursive: true });
            await fs.writeFile(filepath, audioData);
            
            ws.close();
            resolve(`/tmp/${filename}`);
          } catch (error) {
            reject(error);
          }
        }
      });

      ws.on('error', reject);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        ws.close();
        reject(new Error('Realtime API timeout'));
      }, 30000);
    });
  }

  // Fallback TTS audio generation
  async generateTTSAudio(text, voice) {
    const fs = require('fs').promises;
    const path = require('path');

    const response = await this.client.audio.speech.create({
      model: 'tts-1-hd',
      voice: voice,
      input: text,
      response_format: 'mp3'
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = `reaction_${Date.now()}.mp3`;
    const filepath = path.join(process.cwd(), 'tmp', filename);
    
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, buffer);
    
    return `/tmp/${filename}`;
  }

  // Moderation check
  async moderateContent(text) {
    if (!this.client) {
      // Mock moderation for testing
      return { flagged: false, categories: {}, scores: {} };
    }
    
    try {
      const response = await this.client.moderations.create({
        input: text
      });
      
      return {
        flagged: response.results[0].flagged,
        categories: response.results[0].categories,
        scores: response.results[0].category_scores
      };
    } catch (error) {
      console.error('Moderation error:', error);
      return { flagged: false, categories: {}, scores: {} };
    }
  }
}

module.exports = OpenAIClient;
