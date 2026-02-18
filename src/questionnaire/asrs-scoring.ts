import type {
  ASRSQuestion,
  ASRSScores,
  ASRSPresentationResult,
  DSM5Criteria,
  Gender,
  Interpretation,
  LikertValue,
} from "./types";
import { getSeverity } from "./scoring";
import { ASRS_PART_A_HIGH_RISK_THRESHOLD } from "./asrs-questions";

function isShaded(question: ASRSQuestion, response: LikertValue | undefined): boolean {
  const val = response ?? -1;
  return question.shadedThreshold.includes(val);
}

export function calculateASRSScores(
  responses: Record<string, LikertValue>,
  questions: ASRSQuestion[]
): ASRSScores {
  const partA = questions.filter((q) => q.part === "A");
  const partAShadedCount = partA.filter((q) => isShaded(q, responses[q.id])).length;
  const partAHighRisk = partAShadedCount >= ASRS_PART_A_HIGH_RISK_THRESHOLD;

  const inattentionQuestions = questions.filter((q) => q.domain === "Inattention");
  const hyperactivityQuestions = questions.filter((q) => q.domain === "Hyperactivity");

  const inattentionShaded = inattentionQuestions.filter((q) => isShaded(q, responses[q.id])).length;
  const hyperactivityShaded = hyperactivityQuestions.filter((q) => isShaded(q, responses[q.id])).length;

  const inattentionTotal = inattentionQuestions.reduce((sum, q) => sum + (responses[q.id] ?? 0), 0);
  const hyperactivityTotal = hyperactivityQuestions.reduce((sum, q) => sum + (responses[q.id] ?? 0), 0);

  const inattentionMax = inattentionQuestions.length * 4;
  const hyperactivityMax = hyperactivityQuestions.length * 4;

  const inattentionPct = inattentionMax ? Math.round((inattentionTotal / inattentionMax) * 100) : 0;
  const hyperactivityPct = hyperactivityMax ? Math.round((hyperactivityTotal / hyperactivityMax) * 100) : 0;

  return {
    partAShadedCount,
    partAHighRisk,
    inattention: {
      domain: "A",
      domainName: "Inattention",
      clinicalCount: inattentionShaded,
      totalQuestions: inattentionQuestions.length,
      totalScore: inattentionTotal,
      maxScore: inattentionMax,
      percentage: inattentionPct,
      severity: getSeverity(inattentionPct),
      meetsCriteria: partAHighRisk,
    },
    hyperactivity: {
      domain: "B",
      domainName: "Hyperactivity/Impulsivity",
      clinicalCount: hyperactivityShaded,
      totalQuestions: hyperactivityQuestions.length,
      totalScore: hyperactivityTotal,
      maxScore: hyperactivityMax,
      percentage: hyperactivityPct,
      severity: getSeverity(hyperactivityPct),
      meetsCriteria: partAHighRisk,
    },
  };
}

export function determineASRSPresentation(partAHighRisk: boolean): ASRSPresentationResult {
  if (partAHighRisk) {
    return {
      type: "high_risk",
      label: "Part A: High risk",
      description:
        "4+ items in the Part A screener (shaded boxes). Professional evaluation is recommended.",
    };
  }
  return {
    type: "low_risk",
    label: "Part A: Below high-risk threshold",
    description:
      "Fewer than 4 items in the Part A screener. If symptoms still impact your life, consider professional evaluation.",
  };
}

export function interpretASRSResults(
  asrsScores: ASRSScores,
  presentationType: ASRSPresentationResult,
  contextResponses: Record<string, string>,
  gender: Gender | null,
  followUpResponses: Record<string, LikertValue>
): Interpretation {
  const interpretation: Interpretation = {
    riskLevel: presentationType.type === "high_risk" ? "elevated" : "low",
    presentationType: presentationType.type === "high_risk" ? "combined" : "subthreshold",
    criteriaMetCount: presentationType.type === "high_risk" ? 1 : 0,
    genderInsights: [],
    recommendations: [],
    clinicalNote: "",
  };

  if (
    gender === "female" &&
    (asrsScores.inattention.severity === "high" || asrsScores.inattention.severity === "moderate")
  ) {
    interpretation.genderInsights.push(
      "Your inattention scores align with common female ADHD presentation.",
      "Women often experience more internal symptoms that may not be immediately visible to others."
    );
  }
  if (
    gender === "male" &&
    (asrsScores.hyperactivity.severity === "high" || asrsScores.hyperactivity.severity === "moderate")
  ) {
    interpretation.genderInsights.push(
      "Your hyperactivity/impulsivity scores suggest an external symptom presentation.",
      "This pattern is commonly seen in male ADHD presentation."
    );
  }
  if (followUpResponses && followUpResponses["female_f6"] >= 3) {
    interpretation.genderInsights.push(
      "You report significant exhaustion from masking symptoms - this is common in women with ADHD."
    );
  }

  if (presentationType.type === "high_risk") {
    interpretation.clinicalNote =
      "Your Part A screener score (4+ items in shaded boxes) suggests possible adult ADHD. This is a screening tool only; a qualified healthcare professional can provide a full evaluation.";
    interpretation.recommendations = [
      "Consult with a healthcare provider or psychiatrist for comprehensive evaluation",
      "Bring these ASRS v1.1 screening results to your appointment",
      "Consider keeping a symptom diary to track patterns",
      "Explore ADHD-focused strategies and support groups",
    ];
  } else {
    interpretation.clinicalNote =
      "Your Part A score is below the high-risk threshold. If symptoms are still impacting your daily life, professional evaluation may be helpful.";
    interpretation.recommendations = [
      "If symptoms impact your life, consider professional evaluation",
      "Many conditions can present with ADHD-like symptoms (anxiety, depression, sleep disorders)",
      "Focus on areas where you scored higher for targeted strategies",
      "Practice good sleep hygiene, exercise, and stress management",
    ];
  }

  return interpretation;
}

export function evaluateASRSCriteria(
  partAHighRisk: boolean,
  contextResponses: Record<string, string>
): DSM5Criteria {
  return {
    meetsSymptomThreshold: partAHighRisk,
    multipleSettings: contextResponses.context_settings === "yes",
    beforeAge12: contextResponses.context_age12 === "yes",
    significantImpact:
      contextResponses.context_impact === "significant" ||
      contextResponses.context_impact === "moderate",
  };
}
