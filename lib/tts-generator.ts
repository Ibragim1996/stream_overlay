import crypto from 'crypto';
import { OpenAI } from 'openai';
import { getAdminBucket } from '@/lib/firebaseAdmin';

export type TTSInput = {
  text: string;
  voiceId: string; // e.g. alloy/echo/nova ... or custom engine id
  format?: 'mp3' | 'wav' | 'ogg';
  mode?: string;
  tone?: string;
};

/** Build a deterministic cache key for (text+voice). */
function buildHash(input: TTSInput): string {
  const h = crypto.createHash('sha256');
  h.update(JSON.stringify({ t: input.text, v: input.voiceId }));
  return h.digest('hex').slice(0, 48);
}

/** Returns a public URL for a stored object. */
function publicUrlFor(bucketName: string, path: string): string {
  return `https://storage.googleapis.com/${bucketName}/${encodeURI(path)}`;
}

/** Generate (or fetch from cache) TTS audio and return public URL. */
export async function getOrCreateTTS(input: TTSInput): Promise<{ url: string; key: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('[tts] OPENAI_API_KEY missing');
    return null;
  }

  const ext = input.format ?? 'mp3';
  const hash = buildHash(input);
  const objectPath = `tts/${hash}.${ext}`;

  const bucket = getAdminBucket();
  const file = bucket.file(objectPath);

  const [exists] = await file.exists();
  if (exists) {
    return { url: publicUrlFor(bucket.name, objectPath), key: objectPath };
  }

  const client = new OpenAI({ apiKey });

  const speech = await client.audio.speech.create({
    model: 'gpt-4o-mini-tts', // or 'tts-1'
    voice: input.voiceId,
    input: input.text,
    format: ext,
    // style/emotion hint via input.mode/tone can be embedded in text or future params
  } as any);

  const arrayBuffer = await speech.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await file.save(buffer, {
    contentType: ext === 'mp3' ? 'audio/mpeg' : ext === 'wav' ? 'audio/wav' : 'audio/ogg',
    resumable: false,
    public: true,
    metadata: { cacheControl: 'public, max-age=31536000, immutable' },
  });

  try { await file.makePublic(); } catch { /* ignore */ }

  return { url: publicUrlFor(bucket.name, objectPath), key: objectPath };
}


