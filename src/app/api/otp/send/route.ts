import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { generateOtp, buildOtpCookie } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST() {
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
    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("[OTP] Failed to send email:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
