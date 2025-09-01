// app/lib/token.ts
import crypto from "crypto";

type VerifyResult =
  | { ok: true; name: string }
  | { ok: false; name: null; reason?: string };

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
function b64urlJson(obj: unknown) {
  return b64url(Buffer.from(JSON.stringify(obj)));
}

export function signToken(name: string, ttlSec = 3600) {
  const secret = process.env.OVERLAY_SECRET;
  if (!secret) throw new Error("OVERLAY_SECRET is missing");

  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    name,
    exp: Math.floor(Date.now() / 1000) + ttlSec,
    iat: Math.floor(Date.now() / 1000),
  };

  const h = b64urlJson(header);
  const p = b64urlJson(payload);
  const data = `${h}.${p}`;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest();
  const s = b64url(sig);
  return `${data}.${s}`;
}

export function verifyToken(token?: string): VerifyResult {
  try {
    if (!token) return { ok: false, name: null, reason: "missing" };
    const secret = process.env.OVERLAY_SECRET!;
    const [h, p, s] = token.split(".");
    if (!h || !p || !s) return { ok: false, name: null, reason: "format" };
    const data = `${h}.${p}`;
    const expect = b64url(
      crypto.createHmac("sha256", secret).update(data).digest()
    );
    if (expect !== s) return { ok: false, name: null, reason: "signature" };

    const payload = JSON.parse(Buffer.from(p, "base64").toString("utf8"));
    if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return { ok: false, name: null, reason: "expired" };
    }
    return { ok: true, name: String(payload.name || "") };
  } catch {
    return { ok: false, name: null, reason: "error" };
  }
}