// Utilidades de sesión de administrador.
// Compatible con Edge (middleware) y Node (server actions): solo usa Web Crypto.

export const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "oceanblvd";
export const ADMIN_COOKIE = "ob_admin";

async function hmacHex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Token de sesión: depende del ADMIN_PASSWORD, así que no es falsificable sin él. */
export function adminSessionToken(): Promise<string> {
  return hmacHex("ocean-blvd-admin-session-v1", ADMIN_PASSWORD);
}
