import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { audit } from "@/lib/audit-log";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/assessment/intake";

  // Prevent open redirect: only allow relative paths within the app
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    next = "/assessment/intake";
  }

  if (code) {
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

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      audit("auth.oauth_callback", { userId: data.user?.id });
      // Clear any previous OTP verification — force re-verify on each login
      cookieStore.delete("otp_verified");
      // Redirect to OTP verification, preserving the final destination
      const verifyUrl = new URL("/auth/verify-otp", origin);
      verifyUrl.searchParams.set("next", next);
      return NextResponse.redirect(verifyUrl.toString());
    }
  }

  // Fallback — send to intake
  return NextResponse.redirect(`${origin}/assessment/intake`);
}
