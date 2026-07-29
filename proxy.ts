import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 renamed Middleware to Proxy. Same behaviour, new filename.
 *
 * This is an OPTIMISTIC check only — it looks at cookie presence, never the
 * database. Real authorisation happens inside every route handler via
 * `requireAuth` / `requireCompany` / `requireAdmin`. The Next docs are explicit
 * that Proxy must not be used as the authorisation boundary.
 */

const SESSION_COOKIE = "taskflow_session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/tasks",
  "/teams",
  "/reports",
  "/settings",
  "/employee",
  // Reached only with a session, right after signup.
  "/onboarding",
];

const AUTH_ONLY_PATHS = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !hasSession) {
    const url = new URL("/login", request.url);
    // Send them back where they were headed after signing in.
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (hasSession && AUTH_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except API routes, Next internals, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
