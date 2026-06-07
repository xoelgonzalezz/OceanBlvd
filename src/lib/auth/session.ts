import { cache } from "react";
import { cookies } from "next/headers";

import { db } from "@/lib/db";

const SECRET = process.env.AUTH_SECRET || "ocean-blvd-dev-auth-secret";
const COOKIE = "ob_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 días

async function hmac(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Buffer.from(new Uint8Array(sig)).toString("base64url");
}

async function signToken(payload: Record<string, unknown>): Promise<string> {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${await hmac(body)}`;
}

async function verifyToken(
  token: string
): Promise<Record<string, unknown> | null> {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if ((await hmac(body)) !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (typeof payload.exp === "number" && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createUserSession(userId: string) {
  const token = await signToken({ uid: userId, exp: Date.now() + MAX_AGE * 1000 });
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearUserSession() {
  cookies().delete(COOKIE);
}

async function readSessionUserId(): Promise<string | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload && typeof payload.uid === "string" ? payload.uid : null;
}

/** Usuario autenticado actual (o null). Cacheado por petición. */
export const getCurrentUser = cache(async () => {
  const uid = await readSessionUserId();
  if (!uid) return null;
  return db.user.findUnique({
    where: { id: uid },
    select: { id: true, name: true, email: true, createdAt: true },
  });
});
