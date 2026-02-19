import { createClient, supabaseConfigured } from "./client";
import type { ChronosScores } from "@/lib/chronos-scoring";

export async function saveChronosScore(
  scores: ChronosScores,
  sessionId: string,
  userId?: string | null
): Promise<void> {
  if (!supabaseConfigured) return;
  const supabase = createClient();
  const { error } = await supabase.from("chronos_scores").insert({
    session_id: sessionId,
    user_id: userId ?? null,
    c_im: scores.cIM,
    c_hr: scores.cHR,
    c_ie: scores.cIE,
    mean_error_pct: scores.meanErrorPct,
    premature_rate: scores.prematureRate,
    phase1_mean_error: scores.phase1MeanError,
    phase2_mean_error: scores.phase2MeanError,
    total_trials: scores.totalTrials,
  });
  if (error) {
    console.error("[Supabase] Failed to save Chronos score:", error.message);
  }
}
