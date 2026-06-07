import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_COOKIE, adminSessionToken } from "@/lib/admin-token";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // La página de login es pública.
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  const expected = await adminSessionToken();

  if (cookie && cookie === expected) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
