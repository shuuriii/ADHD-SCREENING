import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { generateOtp, buildOtpCookie } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyCsrf } from "@/lib/csrf";
import { audit } from "@/lib/audit-log";

/**
 * Lightweight OTP send for intake email verification.
 * Does NOT require Supabase auth — accepts email in request body.
 */
export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.valid) {
    return NextResponse.json({ error: csrf.error }, { status: 403 });
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-real-ip") || headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Rate limit: 3 sends per minute per IP
  const ipLimit = checkRateLimit(`otp-intake-send:${ip}`, 3, 60_000);
  if (!ipLimit.allowed) {
    audit("auth.rate_limited", { ip, meta: { route: "otp-intake-send" } });
    return NextResponse.json(
      { error: "Too many requests. Please wait before requesting another code." },
      { status: 429 }
    );
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  // Rate limit: 3 sends per 5 minutes per email
  const emailLimit = checkRateLimit(`otp-intake-send:${email}`, 3, 5 * 60_000);
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please check your email for the existing code." },
      { status: 429 }
    );
  }

  const cookieStore = await cookies();

  // Clear any stale pending OTP
  cookieStore.delete("otp_intake_pending");

  const code = generateOtp();
  const cookieValue = buildOtpCookie(code);

  cookieStore.set("otp_intake_pending", cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300, // 5 minutes
  });

  try {
    await sendOtpEmail(email, code);
    audit("auth.intake_otp_sent", { ip, meta: { email } });
    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("[OTP] Failed to send intake email:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
