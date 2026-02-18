export type Domain = "A" | "B";
export type Gender = "female" | "male" | "non-binary" | "prefer-not-to-say";
export type LikertValue = 0 | 1 | 2 | 3 | 4;
export type Severity = "high" | "moderate" | "mild" | "low";
export type InstrumentType = "dsm5" | "asrs";
export type PresentationType =
  | "combined"
  | "inattentive"
  | "hyperactive"
  | "subthreshold";
export type ASRSRiskLevel = "high_risk" | "low_risk";

export interface LikertScale {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
}

export const LIKERT_LABELS: LikertScale = {
  0: "Never",
  1: "Rarely",
  2: "Sometimes",
  3: "Often",
  4: "Very Often",
};

export interface DSM5Question {
  id: string;
  domain: Domain;
  domainName: string;
  questionNumber: number;
  text: string;
  helpText: string;
  clinicalThreshold: number;
}

export interface ContextQuestion {
  id: string;
  type: "context";
  questionNumber: number;
  text: string;
  helpText: string;
  options: { value: string; label: string }[];
  criteriaKey: string;
}

export interface FollowUpQuestion {
  id: string;
  triggerQuestions: string[];
  triggerThreshold: number;
  text: string;
  category: string;
}

export interface DomainScore {
  domain: Domain;
  domainName: string;
  clinicalCount: number;
  totalQuestions: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
  meetsCriteria: boolean;
  severity: Severity;
}

export interface PresentationResult {
  type: PresentationType;
  label: string;
  description: string;
}

export interface DSM5Criteria {
  meetsSymptomThreshold: boolean;
  multipleSettings: boolean;
  beforeAge12: boolean;
  significantImpact: boolean;
}

export interface Interpretation {
  riskLevel: "elevated" | "low";
  presentationType: PresentationType;
  criteriaMetCount: number;
  genderInsights: string[];
  recommendations: string[];
  clinicalNote: string;
}

export type PetPreference = "cat" | "dog";

export interface UserData {
  name: string;
  gender: Gender | null;
  age: number | null;
  petPreference: PetPreference | null;
}

export interface AssessmentResult {
  assessmentId: string;
  instrument: "dsm5";
  userData: UserData;
  domainA: DomainScore;
  domainB: DomainScore;
  presentationType: PresentationResult;
  dsm5Criteria: DSM5Criteria;
  interpretation: Interpretation;
  responses: Record<string, LikertValue>;
  contextResponses: Record<string, string>;
  followUpResponses: Record<string, LikertValue>;
  completedAt: string;
}

export interface ASRSQuestion {
  id: string;
  questionNumber: number;
  part: "A" | "B";
  domain: "Inattention" | "Hyperactivity";
  text: string;
  shadedThreshold: number[];
}

export interface ASRSPresentationResult {
  type: ASRSRiskLevel;
  label: string;
  description: string;
}

export interface ASRSScores {
  partAShadedCount: number;
  partAHighRisk: boolean;
  inattention: DomainScore;
  hyperactivity: DomainScore;
}

export interface ASRSResult {
  assessmentId: string;
  instrument: "asrs";
  userData: UserData;
  domainA: DomainScore;
  domainB: DomainScore;
  presentationType: ASRSPresentationResult;
  dsm5Criteria: DSM5Criteria;
  interpretation: Interpretation;
  partAShadedCount: number;
  partAHighRisk: boolean;
  responses: Record<string, LikertValue>;
  contextResponses: Record<string, string>;
  followUpResponses: Record<string, LikertValue>;
  completedAt: string;
}
