import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyCsrf } from "@/lib/csrf";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.valid) {
    return NextResponse.json({ error: csrf.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { sessionId, result } = body;

    if (!sessionId || !result) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("questionnaire_results").insert({
      session_id: sessionId,
      user_id: user?.id ?? null,
      instrument: "dsm5",
      domain_a_score: result.domainA?.clinicalCount ?? 0,
      domain_b_score: result.domainB?.clinicalCount ?? 0,
      domain_a_total: result.domainA?.totalScore ?? 0,
      domain_b_total: result.domainB?.totalScore ?? 0,
      presentation_type: result.presentationType?.type ?? "subthreshold",
      risk_level: result.interpretation?.riskLevel ?? "low",
      meets_symptom_threshold: result.dsm5Criteria?.meetsSymptomThreshold ?? false,
      multiple_settings: result.dsm5Criteria?.multipleSettings ?? false,
      before_age_12: result.dsm5Criteria?.beforeAge12 ?? false,
      significant_impact: result.dsm5Criteria?.significantImpact ?? false,
      responses: result.responses ?? {},
      context_responses: result.contextResponses ?? {},
      followup_responses: result.followUpResponses ?? {},
    });

    if (error) {
      console.error("[API] Failed to save questionnaire:", error.message);
      return NextResponse.json({ error: "Failed to save questionnaire" }, { status: 500 });
    }

    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
