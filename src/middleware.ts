import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that don't require OTP verification
const PUBLIC_PATHS = [
  "/",
  "/auth/callback",
  "/auth/verify-otp",
  "/api/otp/send",
  "/api/otp/verify",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  const otpVerified = request.cookies.get("otp_verified")?.value === "true";
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
