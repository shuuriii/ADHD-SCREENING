import { createClient, supabaseConfigured } from "./client";
import { clampScore } from "./validate-scores";
import type { GoNoGoScores } from "@/lib/gonogo-scoring";

export async function saveGameScore(
  scores: GoNoGoScores,
  sessionId: string,
  userId?: string | null
): Promise<{ error?: string }> {
  if (!supabaseConfigured) return {};
  const supabase = createClient();
  const { error } = await supabase.from("gonogo_scores").insert({
    session_id: sessionId,
    user_id: userId ?? null,
    aq_vis: clampScore(scores.aqvis),
    rcq_vis: clampScore(scores.rcqvis),
    icv: scores.icv,
    mean_rt: scores.meanRT,
    sd_rt: scores.sdRT,
    hits: scores.hits,
    false_alarms: scores.falseAlarms,
    omissions: scores.omissions,
    correct_rejections: scores.correctRejections,
    omission_pct: scores.omissionPct,
    commission_pct: scores.commissionPct,
    vig_slope: scores.vigSlope,
    go_total: scores.goTotal,
    nogo_total: scores.nogoTotal,
  });
  if (error) {
    console.error("[Supabase] Failed to save game score:", error.message);
    return { error: error.message };
  }
  return {};
}
