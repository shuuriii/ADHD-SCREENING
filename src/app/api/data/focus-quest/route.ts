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

    const { error } = await supabase.from("focus_quest_scores").insert({
      session_id: sessionId,
      user_id: user?.id ?? null,
      c_cpt_x: clampScore(scores.cCPT_X ?? 0),
      x_omission_pct: scores.xOmissionPct ?? 0,
      x_commission_pct: scores.xCommissionPct ?? 0,
      x_mean_rt: scores.xMeanRT ?? 0,
      x_sd_rt: scores.xSdRT ?? 0,
      x_icv: scores.xICV ?? 0,
      x_vig_slope: scores.xVigSlope ?? 0,
      x_hits: scores.xHits ?? 0,
      x_omissions: scores.xOmissions ?? 0,
      x_false_alarms: scores.xFalseAlarms ?? 0,
      x_correct_rejections: scores.xCorrectRejections ?? 0,
      c_cpt_ax: clampScore(scores.cCPT_AX ?? 0),
      d_prime: scores.dPrime ?? 0,
      ax_hits: scores.axHits ?? 0,
      ax_omissions: scores.axOmissions ?? 0,
      bx_errors: scores.bxErrors ?? 0,
      ay_errors: scores.ayErrors ?? 0,
      ax_total_ax: scores.axTotalAX ?? 0,
      ax_total_non_ax: scores.axTotalNonAX ?? 0,
      ax_mean_rt: scores.axMeanRT ?? 0,
      ax_sd_rt: scores.axSdRT ?? 0,
      c_ia: clampScore(scores.cIA ?? 0),
      c_hi: clampScore(scores.cHI ?? 0),
      total_trials: scores.totalTrials ?? 0,
    });

    if (error) {
      console.error("[API] Failed to save focus quest scores:", error.message);
      return NextResponse.json({ error: "Failed to save scores" }, { status: 500 });
    }

    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
