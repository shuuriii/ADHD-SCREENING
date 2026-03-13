import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { verifyOtp, buildVerifiedToken } from "@/lib/otp";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyCsrf } from "@/lib/csrf";
import { audit } from "@/lib/audit-log";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.valid) {
    return NextResponse.json({ error: csrf.error }, { status: 403 });
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-real-ip") || headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Rate limit: 5 verify attempts per minute per IP
  const limit = checkRateLimit(`otp-verify:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute before trying again." },
      { status: 429 }
    );
  }

  const { code } = await request.json();

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  if (!/^\d{6}$/.test(code.trim())) {
    return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const pending = cookieStore.get("otp_pending")?.value;

  if (!pending) {
    return NextResponse.json({ error: "No OTP session found. Please sign in again." }, { status: 400 });
  }

  const result = verifyOtp(code.trim(), pending);

  if (!result.valid) {
    audit("auth.otp_failed", { ip, meta: { reason: result.reason } });
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  // Get user ID to bind the verified token to their identity
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // OTP verified — set identity-bound verified token and clear pending
  const verifiedToken = buildVerifiedToken(user.id);
  cookieStore.set("otp_verified", verifiedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
  cookieStore.delete("otp_pending");

  audit("auth.otp_verified", { userId: user.id, ip });
  return NextResponse.json({ verified: true });
}
