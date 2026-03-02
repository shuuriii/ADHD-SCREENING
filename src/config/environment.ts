/**
 * Environment configuration
 * Centralized environment variable management with type safety
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

function validateEnv() {
  const missing = requiredEnvVars.filter(
    (env) => !process.env[env]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

export const env = {
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

  // App
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Features
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableDebug: process.env.NEXT_PUBLIC_DEBUG === 'true',
} as const;

// Validate on module load in development
if (env.isDev) {
  try {
    validateEnv();
  } catch (error) {
    console.warn('Environment validation warning:', error);
  }
}

export default env;
