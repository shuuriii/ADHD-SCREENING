import { dsm5Questions } from "./dsm5-questions";
import { femaleFollowups } from "./followups/female";
import { maleFollowups } from "./followups/male";
import type {
  Domain,
  DomainScore,
  DSM5Criteria,
  FollowUpQuestion,
  Gender,
  Interpretation,
  LikertValue,
  PresentationResult,
  Severity,
} from "./types";

export function getSeverity(percentage: number): Severity {
  if (percentage >= 75) return "high";
  if (percentage >= 50) return "moderate";
  if (percentage >= 25) return "mild";
  return "low";
}

export function calculateDomainScore(
  responses: Record<string, LikertValue>,
  domain: Domain
): DomainScore {
  const domainQuestions = dsm5Questions.filter((q) => q.domain === domain);
  let clinicalCount = 0;
  let totalScore = 0;
  const maxScore = domainQuestions.length * 4;

  domainQuestions.forEach((q) => {
    const response = responses[q.id] ?? 0;
    totalScore += response;
    if (response >= 3) {
      clinicalCount++;
    }
  });

  const percentage = Math.round((totalScore / maxScore) * 100);

  return {
    domain,
    domainName: domain === "A" ? "Inattention" : "Hyperactivity/Impulsivity",
    clinicalCount,
    totalQuestions: domainQuestions.length,
    totalScore,
    maxScore,
    percentage,
    meetsCriteria: clinicalCount >= 5,
    severity: getSeverity(percentage),
  };
}

export function determinePresentationType(
  domainA: DomainScore,
  domainB: DomainScore
): PresentationResult {
  const inattentionMet = domainA.clinicalCount >= 5;
  const hyperactivityMet = domainB.clinicalCount >= 5;

  if (inattentionMet && hyperactivityMet) {
    return {
      type: "combined",
      label: "Combined Presentation",
      description:
        "5+ symptoms in both Inattention AND Hyperactivity/Impulsivity domains",
    };
  } else if (inattentionMet) {
    return {
      type: "inattentive",
      label: "Predominantly Inattentive",
      description: "5+ symptoms in Inattention domain only",
    };
  } else if (hyperactivityMet) {
    return {
      type: "hyperactive",
      label: "Predominantly Hyperactive/Impulsive",
      description: "5+ symptoms in Hyperactivity/Impulsivity domain only",
    };
  } else {
    return {
      type: "subthreshold",
      label: "Below Clinical Threshold",
      description:
        "Fewer than 5 clinically significant symptoms in either domain",
    };
  }
}

export function evaluateDSM5Criteria(
  domainA: DomainScore,
  domainB: DomainScore,
  contextResponses: Record<string, string>
): DSM5Criteria {
  return {
    meetsSymptomThreshold:
      domainA.clinicalCount >= 5 || domainB.clinicalCount >= 5,
    multipleSettings: contextResponses.context_settings === "yes",
    beforeAge12: contextResponses.context_age12 === "yes",
    significantImpact:
      contextResponses.context_impact === "significant" ||
      contextResponses.context_impact === "moderate",
  };
}

export function interpretDSM5Results(
  domainA: DomainScore,
  domainB: DomainScore,
  presentationType: PresentationResult,
  criteria: DSM5Criteria,
  gender: Gender | null,
  followUpResponses: Record<string, LikertValue>
): Interpretation {
  const interpretation: Interpretation = {
    riskLevel: presentationType.type !== "subthreshold" ? "elevated" : "low",
    presentationType: presentationType.type,
    criteriaMetCount: Object.values(criteria).filter(Boolean).length,
    genderInsights: [],
    recommendations: [],
    clinicalNote: "",
  };

  // Gender-specific insights
  if (gender === "female") {
    if (domainA.severity === "high" || domainA.severity === "moderate") {
      interpretation.genderInsights.push(
        "Your inattention scores align with common female ADHD presentation",
        "Women often experience more internal symptoms that may not be immediately visible to others"
      );
    }
    if (followUpResponses && followUpResponses["female_f6"] >= 3) {
      interpretation.genderInsights.push(
        "You report significant exhaustion from masking symptoms - this is common in women with ADHD"
      );
    }
  } else if (gender === "male") {
    if (domainB.severity === "high" || domainB.severity === "moderate") {
      interpretation.genderInsights.push(
        "Your hyperactivity/impulsivity scores suggest an external symptom presentation",
        "This pattern is commonly seen in male ADHD presentation"
      );
    }
  }

  // Clinical note based on criteria
  if (presentationType.type !== "subthreshold") {
    if (
      criteria.multipleSettings &&
      criteria.beforeAge12 &&
      criteria.significantImpact
    ) {
      interpretation.clinicalNote =
        "Your responses meet the symptom threshold and context criteria consistent with DSM-5 ADHD. Professional evaluation is strongly recommended.";
    } else {
      const missing: string[] = [];
      if (!criteria.multipleSettings)
        missing.push("symptoms in multiple settings");
      if (!criteria.beforeAge12)
        missing.push("symptom onset before age 12");
      if (!criteria.significantImpact)
        missing.push("significant functional impairment");
      interpretation.clinicalNote = `Your responses meet the symptom threshold, but some DSM-5 context criteria were not fully met: ${missing.join(", ")}. Professional evaluation can clarify this.`;
    }
  } else {
    interpretation.clinicalNote =
      "Your responses do not meet the DSM-5 symptom threshold (5+ symptoms rated Often/Very Often in at least one domain). However, if symptoms are impacting your life, professional evaluation may still be helpful.";
  }

  // Recommendations
  if (presentationType.type !== "subthreshold") {
    interpretation.recommendations = [
      "Consult with a healthcare provider or psychiatrist for comprehensive evaluation",
      "Bring these screening results to your appointment",
      "Consider keeping a symptom diary to track patterns across settings",
      "Learn about ADHD-focused organizational strategies and accommodations",
      "Explore support groups for adults with ADHD",
    ];
  } else {
    interpretation.recommendations = [
      "If symptoms are impacting your daily life, consider professional evaluation",
      "Many conditions can present with ADHD-like symptoms (anxiety, depression, sleep disorders)",
      "Focus on areas where you scored higher for targeted support strategies",
      "Practice good sleep hygiene, exercise, and stress management",
    ];
  }

  return interpretation;
}

export function determineFollowUps(
  responses: Record<string, LikertValue>,
  gender: Gender | null
): FollowUpQuestion[] {
  if (!gender || (gender !== "male" && gender !== "female")) {
    return [];
  }

  const followUpBank =
    gender === "female" ? femaleFollowups : maleFollowups;

  return followUpBank.filter((followUp) => {
    const triggeredCount = followUp.triggerQuestions.reduce((count, qId) => {
      const response = responses[qId] || 0;
      return response >= followUp.triggerThreshold ? count + 1 : count;
    }, 0);
    return triggeredCount > 0;
  });
}
