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

    const { error } = await supabase.from("gonogo_scores").insert({
      session_id: sessionId,
      user_id: user?.id ?? null,
      aq_vis: clampScore(scores.aqvis ?? 0),
      rcq_vis: clampScore(scores.rcqvis ?? 0),
      icv: scores.icv ?? 0,
      mean_rt: scores.meanRT ?? 0,
      sd_rt: scores.sdRT ?? 0,
      hits: scores.hits ?? 0,
      false_alarms: scores.falseAlarms ?? 0,
      omissions: scores.omissions ?? 0,
      correct_rejections: scores.correctRejections ?? 0,
      omission_pct: scores.omissionPct ?? 0,
      commission_pct: scores.commissionPct ?? 0,
      vig_slope: scores.vigSlope ?? 0,
      go_total: scores.goTotal ?? 0,
      nogo_total: scores.nogoTotal ?? 0,
    });

    if (error) {
      console.error("[API] Failed to save gonogo scores:", error.message);
      return NextResponse.json({ error: "Failed to save scores" }, { status: 500 });
    }

    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
