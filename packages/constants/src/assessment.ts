/**
 * Assessment-related constants
 */

export const ASSESSMENT_CONSTANTS = {
  // DSM-5
  DSM5_TOTAL_QUESTIONS: 18,
  DSM5_DOMAINS: [
    'inattention',
    'hyperactivity-impulsivity',
  ] as const,

  // ASRS
  ASRS_PART_A_QUESTIONS: 6,
  ASRS_PART_B_QUESTIONS: 12,
  ASRS_CLINICAL_THRESHOLD: 4,
  ASRS_CLINICAL_THRESHOLD_PART_B: 6,

  // Scoring
  CLINICALLY_SIGNIFICANT_THRESHOLD: 6,
  MAXIMUM_SCORE: 54,

  // Games
  GAMES: ['gonogo', 'chronos', 'focusQuest'] as const,
  GAMES_REQUIRED: 1,

  // Sessions
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
} as const;

export const SEVERITY_LEVELS = {
  NORMAL: 'normal',
  MILD: 'mild',
  MODERATE: 'moderate',
  SEVERE: 'severe',
} as const;
