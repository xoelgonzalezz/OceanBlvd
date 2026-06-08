import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_COOKIE, verifyToken } from "@/lib/auth/token";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // La página de login es pública.
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;

  if (payload && payload.role === "admin") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
