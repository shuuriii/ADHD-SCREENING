/**
 * Clamp a score to 0-100 range. Provides server-side defense
 * in case client-side clamping is bypassed.
 */
export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Clamp a percentage to 0-100 range.
 */
export function clampPct(value: number): number {
  return Math.max(0, Math.min(100, value));
}
