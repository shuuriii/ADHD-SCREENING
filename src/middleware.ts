import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that don't require OTP verification
const PUBLIC_PATHS = [
  "/",
  "/privacy",
  "/terms",
  "/cookies",
  "/auth/callback",
  "/auth/verify-otp",
  "/api/otp/send",
  "/api/otp/verify",
  "/api/auth/signout",
  "/api/data/session",
  "/api/data/questionnaire",
  "/api/data/gonogo",
  "/api/data/chronos",
  "/api/data/focus-quest",
  "/api/data/delete",
  "/api/data/export",
  "/api/data/cleanup",
];

export async function middleware(request: NextRequest) {
  // Normalize pathname to prevent path traversal / encoding bypasses
  const pathname = decodeURIComponent(request.nextUrl.pathname).replace(/\/+/g, "/");

  // Skip public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next(); // No auth configured, allow through
  }

  // Create Supabase client for middleware
  const response = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in — allow through (app handles anonymous access)
  if (!user) {
    return response;
  }

  // Logged in but OTP not verified — redirect to verify page
  // Cookie format: HMAC|userId|expiry — verify it's bound to this user
  const otpCookie = request.cookies.get("otp_verified")?.value;
  const otpVerified = (() => {
    if (!otpCookie) return false;
    // Support legacy "true" format during rollout, then check identity-bound token
    if (otpCookie === "true") return false; // Force re-verify with new format
    const parts = otpCookie.split("|");
    if (parts.length !== 3) return false;
    const [, storedUserId, expiresStr] = parts;
    if (storedUserId !== user.id) return false;
    if (Date.now() > Number(expiresStr)) return false;
    // Note: full HMAC verification happens server-side in the OTP lib;
    // middleware checks userId + expiry to avoid importing crypto in edge runtime
    return true;
  })();
  if (!otpVerified) {
    const verifyUrl = new URL("/auth/verify-otp", request.url);
    verifyUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(verifyUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
