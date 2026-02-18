import { createClient, supabaseConfigured } from "./client";
import type { GoNoGoScores } from "@/lib/gonogo-scoring";

export async function saveGameScore(
  scores: GoNoGoScores,
  sessionId: string,
  userId?: string | null
): Promise<void> {
  if (!supabaseConfigured) return;
  const supabase = createClient();
  const { error } = await supabase.from("game_scores").insert({
    session_id: sessionId,
    user_id: userId ?? null,
    aq_vis: scores.aqvis,
    rcq_vis: scores.rcqvis,
    icv: scores.icv,
    mean_rt: scores.meanRT,
    sd_rt: scores.sdRT,
    hits: scores.hits,
    false_alarms: scores.falseAlarms,
    omissions: scores.omissions,
    correct_rejections: scores.correctRejections,
    omission_pct: scores.omissionPct,
    commission_pct: scores.commissionPct,
  });
  if (error) {
    console.error("[Supabase] Failed to save game score:", error.message);
  }
}
