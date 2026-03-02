"use client";

import { SoundProvider } from "@/contexts/SoundContext";
import SoundToggle from "@/components/ui/SoundToggle";

export default function SoundToggleWrapper() {
  return (
    <SoundProvider>
      <SoundToggle />
    </SoundProvider>
  );
}
