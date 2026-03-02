/**
 * Game configuration: difficulty, timing, scoring
 */

export const GAME_CONFIG = {
  GONOGO: {
    DURATION_MS: 180000, // 3 minutes
    STIMULUS_INTERVAL_MS: 800,
    RESPONSE_WINDOW_MS: 1000,
    GO_PROBABILITY: 0.75,
  },
  CHRONOS: {
    DURATION_MS: 300000, // 5 minutes
    STIMULUS_INTERVAL_MS: 1500,
    RESPONSE_WINDOW_MS: 2000,
    NUM_ITEMS: 20,
  },
  FOCUS_QUEST: {
    DURATION_MS: 240000, // 4 minutes
    STIMULUS_INTERVAL_MS: 1200,
    RESPONSE_WINDOW_MS: 1500,
    DIFFICULTY_LEVELS: ['easy', 'medium', 'hard'] as const,
  },
} as const;

export const SCORING_MULTIPLIERS = {
  ACCURACY: 1.0,
  SPEED: 0.8,
  CONSISTENCY: 0.6,
} as const;

export const GAME_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  AVERAGE: 60,
  BELOW_AVERAGE: 50,
} as const;
