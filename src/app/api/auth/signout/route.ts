import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCsrf } from "@/lib/csrf";
import { audit } from "@/lib/audit-log";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.valid) {
    return NextResponse.json({ error: csrf.error }, { status: 403 });
  }
  const cookieStore = await cookies();
  cookieStore.delete("otp_verified");
  cookieStore.delete("otp_pending");
  audit("auth.signout");
  return NextResponse.json({ ok: true });
}
