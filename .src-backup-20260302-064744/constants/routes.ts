/**
 * Route constants for type-safe navigation
 */

export const ROUTES = {
  HOME: '/',
  ASSESSMENT: '/assessment',
  INTAKE: '/assessment/intake',
  QUESTIONNAIRE: '/assessment/questionnaire',
  FOCUS_TASK: '/assessment/focus-task',
  GONOGO: '/assessment/gonogo',
  CHRONOS_TASK: '/assessment/chronos-task',
  FOCUS_QUEST: '/assessment/focus-quest',
  RESULTS: '/assessment/results',
  MY_REPORT: '/assessment/my-report',
  HISTORY: '/assessment/history',
  MAP: '/assessment/map',
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];
