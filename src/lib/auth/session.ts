import { cache } from "react";
import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { SESSION_COOKIE, signToken, verifyToken } from "@/lib/auth/token";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 días

export async function createUserSession(userId: string) {
  const token = await signToken({ uid: userId }, MAX_AGE);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearUserSession() {
  cookies().delete(SESSION_COOKIE);
}

async function readSessionUserId(): Promise<string | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
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
