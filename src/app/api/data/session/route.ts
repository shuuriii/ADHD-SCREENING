import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyCsrf } from "@/lib/csrf";
import { audit } from "@/lib/audit-log";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.valid) {
    return NextResponse.json({ error: csrf.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { sessionId, age, gender, petPreference, instrument, name } = body;

    if (!sessionId || !age || !gender || !instrument) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (typeof age !== "number" || age < 18 || age > 120) {
      return NextResponse.json({ error: "Invalid age" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("sessions").upsert(
      {
        session_id: sessionId,
        user_id: user?.id ?? null,
        age,
        gender,
        pet_preference: petPreference ?? null,
        instrument,
        name: name ?? null,
      },
      { onConflict: "session_id" }
    );

    if (error) {
      console.error("[API] Failed to save session:", error.message);
      return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
    }

    audit("data.session_saved", { userId: user?.id, sessionId });
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
