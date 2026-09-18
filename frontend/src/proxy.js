import { NextResponse } from "next/server";
import { getHomeForRole, SESSION_COOKIE, verifySessionToken } from "./lib/auth";

const ALLOWED_PATHS = {
  USER: ["/huecos", "/huecos/reportar"],
  JAC: ["/huecos/jac"],
  ALCALDIA: ["/huecos/alcaldia"],
  ADMIN: ["/admin"],
  SUPERADMIN: ["/admin"],
};

export function proxy(request) {
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const pathname = request.nextUrl.pathname;
  const allowed = ALLOWED_PATHS[session.role] || [];
  const canAccess = allowed.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (!canAccess) {
    return NextResponse.redirect(new URL(getHomeForRole(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/huecos/:path*", "/admin/:path*"],
};
