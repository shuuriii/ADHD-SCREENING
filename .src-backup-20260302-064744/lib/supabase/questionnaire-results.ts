import { createClient, supabaseConfigured } from "./client";
import type { AssessmentResult, ASRSResult } from "@/questionnaire/types";

export async function saveQuestionnaireResult(
  result: AssessmentResult | ASRSResult,
  sessionId: string,
  userId?: string | null
): Promise<void> {
  if (!supabaseConfigured) return;
  const supabase = createClient();

  const isAsrs = result.instrument === "asrs";
  const asrs = isAsrs ? (result as ASRSResult) : null;
  const dsm = !isAsrs ? (result as AssessmentResult) : null;

  const { error } = await supabase.from("questionnaire_results").insert({
    session_id: sessionId,
    user_id: userId ?? null,
    instrument: result.instrument,

    // Domain scores (shared by both instruments)
    domain_a_score: result.domainA.clinicalCount,
    domain_b_score: result.domainB.clinicalCount,
    domain_a_total: result.domainA.totalScore,
    domain_b_total: result.domainB.totalScore,

    // Presentation & risk
    presentation_type: result.presentationType.type,
    risk_level: result.interpretation.riskLevel,

    // ASRS-specific
    part_a_shaded_count: asrs?.partAShadedCount ?? null,
    part_a_high_risk: asrs?.partAHighRisk ?? null,

    // DSM-5 criteria flags
    meets_symptom_threshold: dsm?.dsm5Criteria.meetsSymptomThreshold ?? null,
    multiple_settings: dsm?.dsm5Criteria.multipleSettings ?? null,
    before_age_12: dsm?.dsm5Criteria.beforeAge12 ?? null,
    significant_impact: dsm?.dsm5Criteria.significantImpact ?? null,
  });
  if (error) {
    console.error(
      "[Supabase] Failed to save questionnaire result:",
      error.message
    );
  }
}
