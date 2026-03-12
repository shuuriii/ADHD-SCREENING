import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyOtp } from "@/lib/otp";

export async function POST(request: Request) {
  const { code } = await request.json();

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const pending = cookieStore.get("otp_pending")?.value;

  if (!pending) {
    return NextResponse.json({ error: "No OTP session found. Please sign in again." }, { status: 400 });
  }

  const result = verifyOtp(code.trim(), pending);

  if (!result.valid) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  // OTP verified — set verified flag and clear pending
  cookieStore.set("otp_verified", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
  cookieStore.delete("otp_pending");

  return NextResponse.json({ verified: true });
}
