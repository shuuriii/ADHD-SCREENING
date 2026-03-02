/**
 * Global type definitions barrel export
 * Consolidated from scattered type definitions throughout the app
 */

// Re-export all types from questionnaire (for backward compatibility)
export type {
  Domain,
  Gender,
  LikertValue,
  Severity,
  InstrumentType,
  PresentationType,
  ASRSRiskLevel,
  LikertScale,
  DSM5Question,
  ContextQuestion,
  FollowUpQuestion,
  DomainScore,
  PresentationResult,
  DSM5Criteria,
  Interpretation,
  PetPreference,
  UserData,
  AssessmentResult,
  ASRSQuestion,
  ASRSPresentationResult,
  ASRSScores,
  ASRSResult,
} from '@/questionnaire/types';

// Additional types can be added here
export type GameType = 'gonogo' | 'chronos' | 'focusQuest';

export interface GameScore {
  gameType: GameType;
  score: number;
  accuracy: number;
  responseTime: number;
  completedAt: string;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
  status: number;
}
