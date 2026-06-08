// Tokens firmados (HMAC-SHA256) con expiración. Compatible con Edge (middleware)
// y Node: solo usa Web Crypto, btoa/atob y TextEncoder (sin Buffer).

export const SESSION_COOKIE = "ob_session";
export const ADMIN_COOKIE = "ob_admin";
export const PENDING_COOKIE = "ob_pending"; // verificación de email pendiente

function getSecret(): string {
  const s =
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV !== "production"
      ? "dev-only-insecure-secret-change-me"
      : "");
  if (!s) {
    throw new Error("AUTH_SECRET no está definido (obligatorio en producción).");
  }
  return s;
}

function b64urlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(str: string): string {
  return decodeURIComponent(
    escape(atob(str.replace(/-/g, "+").replace(/_/g, "/")))
  );
}

async function hmacHex(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Comparación en tiempo constante para evitar fugas por temporización. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** Firma un payload con expiración (ttl en segundos). */
export async function signToken(
  payload: Record<string, unknown>,
  ttlSeconds: number
): Promise<string> {
  const body = b64urlEncode(
    JSON.stringify({ ...payload, exp: Date.now() + ttlSeconds * 1000 })
  );
  return `${body}.${await hmacHex(body)}`;
}

/** Verifica firma y expiración; devuelve el payload o null. */
export async function verifyToken(
  token: string
): Promise<Record<string, unknown> | null> {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = await hmacHex(body);
  if (!timingSafeEqual(expected, sig)) return null;
  try {
    const payload = JSON.parse(b64urlDecode(body));
    if (typeof payload.exp === "number" && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
