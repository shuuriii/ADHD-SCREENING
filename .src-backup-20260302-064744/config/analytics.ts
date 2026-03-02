/**
 * Analytics configuration
 * Set up tracking services (Google Analytics, Sentry, etc.)
 */

import { env } from './environment';

export const analyticsConfig = {
  enabled: env.enableAnalytics,
  // Add your analytics service configuration here
  // Example: Google Analytics ID, Sentry DSN, etc.
} as const;

export default analyticsConfig;
