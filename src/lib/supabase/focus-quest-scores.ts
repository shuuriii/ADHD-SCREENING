import { createClient, supabaseConfigured } from "./client";
import type { FocusQuestScores } from "@/lib/focus-quest-scoring";

export async function saveFocusQuestScore(
  scores: FocusQuestScores,
  sessionId: string,
  userId?: string | null
): Promise<void> {
  if (!supabaseConfigured) return;
  const supabase = createClient();
  const { error } = await supabase.from("focus_quest_scores").insert({
    session_id: sessionId,
    user_id: userId ?? null,

    // X-Test
    c_cpt_x: scores.cCPT_X,
    x_omission_pct: scores.xOmissionPct,
    x_commission_pct: scores.xCommissionPct,
    x_mean_rt: scores.xMeanRT,
    x_sd_rt: scores.xSdRT,
    x_icv: scores.xICV,
    x_vig_slope: scores.xVigSlope,
    x_hits: scores.xHits,
    x_omissions: scores.xOmissions,
    x_false_alarms: scores.xFalseAlarms,
    x_correct_rejections: scores.xCorrectRejections,

    // AX-Test
    c_cpt_ax: scores.cCPT_AX,
    d_prime: scores.dPrime,
    ax_hits: scores.axHits,
    ax_omissions: scores.axOmissions,
    bx_errors: scores.bxErrors,
    ay_errors: scores.ayErrors,
    ax_total_ax: scores.axTotalAX,
    ax_total_non_ax: scores.axTotalNonAX,
    ax_mean_rt: scores.axMeanRT,
    ax_sd_rt: scores.axSdRT,

    // Combined indices
    c_ia: scores.cIA,
    c_hi: scores.cHI,
    total_trials: scores.totalTrials,
  });
  if (error) {
    console.error("[Supabase] Failed to save Focus Quest score:", error.message);
  }
}
