"use client";

import { useSoundContext } from "@/contexts/SoundContext";

export function useSound() {
  return useSoundContext();
}
