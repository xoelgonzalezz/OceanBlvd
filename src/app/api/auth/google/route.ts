import { NextResponse } from "next/server";

import { googleAuthUrl, googleEnabled } from "@/lib/auth/google";
import { SITE } from "@/lib/constants";

export async function GET() {
  if (!googleEnabled) {
    return NextResponse.redirect(`${SITE.url}/acceso?error=google_off`);
  }
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(googleAuthUrl(state));
  res.cookies.set("g_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
