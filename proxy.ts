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

/**
 * Origins allowed to call the API from a browser, comma-separated in
 * `MOBILE_ORIGINS` (the Expo web dev server, mainly). A native app sends no
 * `Origin` header at all, so CORS never applies to it — only the Bearer token
 * in the route handler decides whether it gets data.
 */
function allowedOrigin(origin: string | null): string | null {
  if (!origin) return null;

  const allowlist = (process.env.MOBILE_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (allowlist.includes(origin)) return origin;

  // Any localhost port in development — Expo picks a new one freely.
  if (
    process.env.NODE_ENV !== "production" &&
    /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/.test(origin)
  ) {
    return origin;
  }

  return null;
}

function withCors(response: NextResponse, origin: string | null): NextResponse {
  const allowed = allowedOrigin(origin);
  if (!allowed) return response;

  response.headers.set("Access-Control-Allow-Origin", allowed);
  response.headers.set("Vary", "Origin");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,DELETE,OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Authorization,Content-Type,X-Client",
  );
  // Deliberately no Allow-Credentials: mobile authenticates with a Bearer
  // token, so the API never needs to accept a cross-origin cookie.
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");

    if (request.method === "OPTIONS") {
      return withCors(new NextResponse(null, { status: 204 }), origin);
    }

    return withCors(NextResponse.next(), origin);
  }

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
  // API routes are included so cross-origin calls from the mobile app get CORS
  // headers; everything else is page routing. Next internals and static files
  // stay excluded.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
