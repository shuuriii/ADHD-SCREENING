import { createClient, supabaseConfigured } from "./client";
import type { AssessmentResult } from "@/questionnaire/types";

export async function saveQuestionnaireResult(
  result: AssessmentResult,
  sessionId: string,
  userId?: string | null
): Promise<void> {
  if (!supabaseConfigured) return;
  const supabase = createClient();

  const { error } = await supabase.from("questionnaire_results").insert({
    session_id: sessionId,
    user_id: userId ?? null,
    instrument: "dsm5",

    // Domain scores (Inattention = A, Hyperactivity/Impulsivity = B)
    domain_a_score: result.domainA.clinicalCount,
    domain_b_score: result.domainB.clinicalCount,
    domain_a_total: result.domainA.totalScore,
    domain_b_total: result.domainB.totalScore,

    // Presentation & risk
    presentation_type: result.presentationType.type,
    risk_level: result.interpretation.riskLevel,

    // DSM-5 criteria flags
    meets_symptom_threshold: result.dsm5Criteria.meetsSymptomThreshold,
    multiple_settings: result.dsm5Criteria.multipleSettings,
    before_age_12: result.dsm5Criteria.beforeAge12,
    significant_impact: result.dsm5Criteria.significantImpact,

    // Individual responses (0-4 per question)
    responses: result.responses,
    context_responses: result.contextResponses,
    followup_responses: result.followUpResponses,
  });
  if (error) {
    console.error(
      "[Supabase] Failed to save questionnaire result:",
      error.message
    );
  }
}
