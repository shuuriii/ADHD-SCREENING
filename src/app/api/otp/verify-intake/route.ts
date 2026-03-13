import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { verifyOtp } from "@/lib/otp";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyCsrf } from "@/lib/csrf";
import { audit } from "@/lib/audit-log";

/**
 * Verify OTP for intake email verification.
 * No Supabase auth required — just checks the otp_intake_pending cookie.
 */
export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.valid) {
    return NextResponse.json({ error: csrf.error }, { status: 403 });
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-real-ip") || headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Rate limit: 5 verify attempts per minute per IP
  const limit = checkRateLimit(`otp-intake-verify:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    audit("auth.rate_limited", { ip, meta: { route: "otp-intake-verify" } });
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute before trying again." },
      { status: 429 }
    );
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { code } = body;
  if (!code || typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
    return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const pending = cookieStore.get("otp_intake_pending")?.value;

  if (!pending) {
    return NextResponse.json({ error: "No verification code found. Please request a new one." }, { status: 400 });
  }

  const result = verifyOtp(code.trim(), pending);

  if (!result.valid) {
    audit("auth.intake_otp_failed", { ip, meta: { reason: result.reason } });
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  // Clean up the pending cookie
  cookieStore.delete("otp_intake_pending");

  audit("auth.intake_otp_verified", { ip });
  return NextResponse.json({ verified: true });
}
