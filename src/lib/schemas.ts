import { z } from "zod";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** JSON.parse + Zod validation. Returns null on any failure. */
export function safeParse<T>(raw: string, schema: z.ZodType<T>): T | null {
  try {
    return schema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

// ─── Game Scores ────────────────────────────────────────────────────────────

export const goNoGoScoresSchema = z.object({
  aqvis: z.number(),
  rcqvis: z.number(),
  icv: z.number(),
  meanRT: z.number(),
  sdRT: z.number(),
  vigSlope: z.number(),
  omissions: z.number(),
  falseAlarms: z.number(),
  hits: z.number(),
  correctRejections: z.number(),
  omissionPct: z.number(),
  commissionPct: z.number(),
  goTotal: z.number(),
  nogoTotal: z.number(),
});

export const chronosScoresSchema = z.object({
  cIM: z.number(),
  cHR: z.number(),
  cIE: z.number(),
  meanErrorPct: z.number(),
  prematureRate: z.number(),
  phase1MeanError: z.number(),
  phase2MeanError: z.number(),
  totalTrials: z.number(),
});

export const focusQuestScoresSchema = z.object({
  xHits: z.number(),
  xOmissions: z.number(),
  xFalseAlarms: z.number(),
  xCorrectRejections: z.number(),
  xOmissionPct: z.number(),
  xCommissionPct: z.number(),
  xMeanRT: z.number(),
  xSdRT: z.number(),
  xICV: z.number(),
  xVigSlope: z.number(),
  cCPT_X: z.number(),
  axHits: z.number(),
  axOmissions: z.number(),
  bxErrors: z.number(),
  ayErrors: z.number(),
  axTotalAX: z.number(),
  axTotalNonAX: z.number(),
  axMeanRT: z.number(),
  axSdRT: z.number(),
  dPrime: z.number(),
  cCPT_AX: z.number(),
  cIA: z.number(),
  cHI: z.number(),
  totalTrials: z.number(),
});

// ─── Game History ───────────────────────────────────────────────────────────

export const goNoGoHistorySchema = z.array(
  z.object({ scores: goNoGoScoresSchema, completedAt: z.string() })
);

export const chronosHistorySchema = z.array(
  z.object({ scores: chronosScoresSchema, completedAt: z.string() })
);

export const focusQuestHistorySchema = z.array(
  z.object({ scores: focusQuestScoresSchema, completedAt: z.string() })
);

// ─── Assessment State (sessionStorage hydration) ────────────────────────────

const likertValue = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
const gender = z.enum(["female", "male", "non-binary", "prefer-not-to-say"]);
const severity = z.enum(["high", "moderate", "mild", "low"]);
const presentationType = z.enum(["combined", "inattentive", "hyperactive", "subthreshold"]);

const domainScoreSchema = z.object({
  domain: z.enum(["A", "B"]),
  domainName: z.string(),
  clinicalCount: z.number(),
  totalQuestions: z.number(),
  totalScore: z.number(),
  maxScore: z.number(),
  percentage: z.number(),
  meetsCriteria: z.boolean(),
  severity,
});

const assessmentResultSchema = z.object({
  assessmentId: z.string(),
  instrument: z.literal("dsm5"),
  userData: z.object({
    name: z.string(),
    gender: gender.nullable(),
    age: z.number().nullable(),
    petPreference: z.enum(["fox", "panda", "frog", "bunny"]).nullable(),
    email: z.string().optional(),
  }),
  domainA: domainScoreSchema,
  domainB: domainScoreSchema,
  presentationType: z.object({
    type: presentationType,
    label: z.string(),
    description: z.string(),
  }),
  dsm5Criteria: z.object({
    meetsSymptomThreshold: z.boolean(),
    multipleSettings: z.boolean(),
    beforeAge12: z.boolean(),
    significantImpact: z.boolean(),
  }),
  interpretation: z.object({
    riskLevel: z.enum(["elevated", "low"]),
    presentationType,
    criteriaMetCount: z.number(),
    genderInsights: z.array(z.string()),
    recommendations: z.array(z.string()),
    clinicalNote: z.string(),
  }),
  responses: z.record(z.string(), likertValue),
  contextResponses: z.record(z.string(), z.string()),
  followUpResponses: z.record(z.string(), likertValue),
  completedAt: z.string(),
});

export const assessmentHistorySchema = z.array(assessmentResultSchema);

export const assessmentStateSchema = z.object({
  currentPhase: z.enum(["intake", "main", "context", "followups", "results"]),
  instrument: z.literal("dsm5"),
  userData: z.object({
    name: z.string(),
    gender: gender.nullable(),
    age: z.number().nullable(),
    petPreference: z.enum(["fox", "panda", "frog", "bunny"]).nullable(),
    email: z.string().optional(),
  }),
  responses: z.record(z.string(), likertValue),
  contextResponses: z.record(z.string(), z.string()),
  followUpResponses: z.record(z.string(), likertValue),
  currentQuestionIndex: z.number(),
  followUpQuestions: z.array(z.object({
    id: z.string(),
    triggerQuestions: z.array(z.string()),
    triggerThreshold: z.number(),
    text: z.string(),
    category: z.string(),
  })),
  results: assessmentResultSchema.nullable(),
  asrsResult: z.null(),
});

// ─── Focus Task Hub (minimal) ───────────────────────────────────────────────

export const taskHistorySchema = z.array(
  z.object({ completedAt: z.string() }).passthrough()
);
