import { createClient } from "./client";

export async function signInWithGoogle(redirectTo?: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo:
        window.location.origin +
        "/auth/callback?next=" +
        encodeURIComponent(redirectTo ?? "/assessment/intake"),
    },
  });
  if (error) console.error("[Supabase] Google sign-in error:", error.message);
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  // Clear OTP verification cookie
  document.cookie = "otp_verified=; path=/; max-age=0";
  window.location.href = "/";
}

export async function getUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
