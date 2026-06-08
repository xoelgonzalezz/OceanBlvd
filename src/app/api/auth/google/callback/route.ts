import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/lib/db";
import { googleExchangeCode, googleUserInfo } from "@/lib/auth/google";
import { SESSION_COOKIE, signToken } from "@/lib/auth/token";
import { sendWelcomeEmail } from "@/lib/email";
import { SITE } from "@/lib/constants";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 días

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const saved = req.cookies.get("g_state")?.value;

  const fail = () => NextResponse.redirect(`${SITE.url}/acceso?error=google`);

  // Verificación de estado (anti-CSRF).
  if (!code || !state || !saved || state !== saved) return fail();

  const tokens = await googleExchangeCode(code);
  if (!tokens?.access_token) return fail();

  const profile = await googleUserInfo(tokens.access_token);
  if (!profile?.email) return fail();

  const email = profile.email.toLowerCase().trim();
  let user = await db.user.findUnique({ where: { email } });

  if (!user) {
    user = await db.user.create({
      data: {
        email,
        name: profile.name || email.split("@")[0],
        image: profile.picture || null,
        provider: "google",
        verified: true, // Google ya verifica el correo
      },
    });
    await sendWelcomeEmail(user.email, user.name);
  } else if (!user.image && profile.picture) {
    await db.user.update({
      where: { id: user.id },
      data: { image: profile.picture },
    });
  }

  // Creamos la sesión directamente en la respuesta.
  const token = await signToken({ uid: user.id }, MAX_AGE);
  const res = NextResponse.redirect(`${SITE.url}/cuenta`);
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  res.cookies.delete("g_state");
  return res;
}
