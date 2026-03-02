/**
 * Supabase configuration
 */

import { env } from './environment';

export const supabaseConfig = {
  url: env.supabaseUrl,
  anonKey: env.supabaseAnonKey,
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
  },
} as const;

export default supabaseConfig;
