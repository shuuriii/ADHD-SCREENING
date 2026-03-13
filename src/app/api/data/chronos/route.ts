import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clampScore } from "@/lib/supabase/validate-scores";
import { verifyCsrf } from "@/lib/csrf";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.valid) {
    return NextResponse.json({ error: csrf.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { sessionId, scores } = body;

    if (!sessionId || !scores) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("chronos_scores").insert({
      session_id: sessionId,
      user_id: user?.id ?? null,
      c_im: clampScore(scores.cIM ?? 0),
      c_hr: clampScore(scores.cHR ?? 0),
      c_ie: clampScore(scores.cIE ?? 0),
      mean_error_pct: scores.meanErrorPct ?? 0,
      premature_rate: scores.prematureRate ?? 0,
      phase1_mean_error: scores.phase1MeanError ?? 0,
      phase2_mean_error: scores.phase2MeanError ?? 0,
      total_trials: scores.totalTrials ?? 0,
    });

    if (error) {
      console.error("[API] Failed to save chronos scores:", error.message);
      return NextResponse.json({ error: "Failed to save scores" }, { status: 500 });
    }

    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
