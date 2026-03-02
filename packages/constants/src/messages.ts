/**
 * User-facing messages and copy
 */

export const MESSAGES = {
  // Assessment
  COMPLETE_QUESTIONNAIRE: 'Complete the questionnaire first',
  COMPLETE_GAME: 'Complete a cognitive game to unlock PDF',
  COMPLETE_BOTH: 'Complete both questionnaire and at least one cognitive game',

  // Games
  GAME_SELECT_PROMPT: 'Choose a cognitive game to test your attention and focus',
  GAME_INSTRUCTIONS: 'Focus and respond as quickly and accurately as possible',

  // Results
  RESULTS_LOADING: 'Analyzing your responses...',
  RESULTS_ERROR: 'Unable to load results. Please try again.',

  // Errors
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  ERROR_NETWORK: 'Network error. Please check your connection.',
  ERROR_AUTH: 'Authentication failed. Please log in again.',
  ERROR_TIMEOUT: 'Request timed out. Please try again.',

  // Success
  SUCCESS_SAVED: 'Your progress has been saved',
  SUCCESS_SUBMITTED: 'Assessment submitted successfully',

  // PDF
  PDF_GENERATING: 'Generating your report...',
  PDF_READY: 'Your report is ready to download',

  // Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email',
  INVALID_AGE: 'Please enter a valid age',
} as const;
