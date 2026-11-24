import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/inbox",
  "/contacts",
  "/domains",
  "/users",
  "/api-keys",
  "/org",
  "/admin",
  "/calendar",
  "/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isReauth = request.nextUrl.searchParams.has("reauth");

  const isProtected = PROTECTED_ROUTES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const authCookie = request.cookies.get("authorization")?.value;
  const hasToken = Boolean(authCookie && authCookie.trim().length > 0);

  // If redirected with reauth flag, clear authorization cookie and allow through to login
  if (pathname === "/login" && isReauth) {
    const response = NextResponse.next();
    response.cookies.delete("authorization");
    return response;
  }

  if (isProtected && !hasToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and navigating to /login without reauth, redirect to /inbox
  if (pathname === "/login" && hasToken) {
    return NextResponse.redirect(new URL("/inbox", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/inbox/:path*",
    "/contacts/:path*",
    "/domains/:path*",
    "/users/:path*",
    "/api-keys/:path*",
    "/org/:path*",
    "/admin/:path*",
    "/calendar/:path*",
    "/settings/:path*",
    "/login",
  ],
};
