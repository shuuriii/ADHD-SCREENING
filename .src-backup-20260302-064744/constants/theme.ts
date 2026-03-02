/**
 * Theme constants for colors, spacing, and typography
 */

export const COLORS = {
  primary: '#1a8f5a',
  primaryLight: '#46a83c',
  secondary: '#6b7280',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  background: '#ffffff',
  surface: '#f9fafb',
  border: '#e5e7eb',
  text: '#111827',
  textMuted: '#6b7280',
} as const;

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

export const BORDER_RADIUS = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '1rem',
  full: '9999px',
} as const;

export const TRANSITIONS = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
} as const;
