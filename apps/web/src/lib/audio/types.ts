/**
 * Audio-related type definitions
 */

export type SoundTrack = 'rain' | 'nature' | 'gentle';

export interface AudioConfig {
  defaultVolume: number;
  fadeDuration: number;
  crossfadeDuration: number;
}
