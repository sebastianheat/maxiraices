// Tokens de sesión firmados con HMAC-SHA256 vía Web Crypto.
// Funciona tanto en Edge (middleware) como en Node (route handlers).

export type SessionPayload = {
  uid: number;
  email: string;
  nombre: string;
  rol: string;
  exp: number; // epoch ms
};

export const COOKIE_NAME = "avm_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días (segundos)

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64urlFromBytes(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function bytesFromB64url(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const bin = atob(s + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signToken(payload: SessionPayload, secret: string): Promise<string> {
  const body = b64urlFromBytes(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await getKey(secret), enc.encode(body));
  return `${body}.${b64urlFromBytes(new Uint8Array(sig))}`;
}

export async function verifyToken(
  token: string,
  secret: string,
): Promise<SessionPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await getKey(secret),
      bytesFromB64url(sig) as BufferSource,
      enc.encode(body),
    );
    if (!ok) return null;
    const payload = JSON.parse(dec.decode(bytesFromB64url(body))) as SessionPayload;
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
