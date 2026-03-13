import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { generateOtp, buildOtpCookie } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";
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

  // Rate limit: 3 sends per minute per IP
  const limit = checkRateLimit(`otp-send:${ip}`, 3, 60_000);
  if (!limit.allowed) {
    audit("auth.rate_limited", { ip, meta: { route: "otp-send" } });
    return NextResponse.json(
      { error: "Too many requests. Please wait before requesting another code." },
      { status: 429 }
    );
  }

  const cookieStore = await cookies();

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
  if (!user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Additional rate limit by email: 3 sends per 5 minutes
  const emailLimit = checkRateLimit(`otp-send:${user.email}`, 3, 5 * 60_000);
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please check your email for the existing code." },
      { status: 429 }
    );
  }

  // Clear any stale pending OTP before issuing a new one
  cookieStore.delete("otp_pending");

  const code = generateOtp();
  const cookieValue = buildOtpCookie(code);

  // Store hashed OTP in httpOnly cookie
  cookieStore.set("otp_pending", cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300, // 5 minutes
  });

  try {
    await sendOtpEmail(user.email, code);
    audit("auth.otp_sent", { userId: user.id, ip });
    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("[OTP] Failed to send email:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
