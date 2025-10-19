import crypto from 'crypto';
import { getAdminBucket } from '@/lib/firebaseAdmin';

export async function uploadBufferPublic(buffer: Buffer, contentType: string, folder = 'uploads'): Promise<{ url: string; path: string }> {
  const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 48);
  const ext = contentType.includes('mpeg') ? 'mp3' : contentType.includes('wav') ? 'wav' : contentType.includes('ogg') ? 'ogg' : 'bin';
  const key = `${folder}/${hash}.${ext}`;
  const bucket = getAdminBucket();
  const file = bucket.file(key);
  await file.save(buffer, { contentType, resumable: false, public: true, metadata: { cacheControl: 'public, max-age=31536000, immutable' } });
  try { await file.makePublic(); } catch { /* ignore */ }
  const url = `https://storage.googleapis.com/${bucket.name}/${encodeURI(key)}`;
  return { url, path: key };
}


