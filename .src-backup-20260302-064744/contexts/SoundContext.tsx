"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { soundManager, type SoundTrack } from "@/lib/audio";

interface SoundContextValue {
  enabled: boolean;
  toggle: () => void;
  setVolume: (v: number) => void;
  currentTrack: SoundTrack;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [currentTrack] = useState<SoundTrack>("rain");

  const toggle = useCallback(async () => {
    await soundManager.toggle(currentTrack);
    setEnabled(soundManager.enabled);
  }, [currentTrack]);

  const setVolume = useCallback((v: number) => {
    soundManager.setVolume(v);
  }, []);

  useEffect(() => {
    return () => {
      soundManager.destroy();
    };
  }, []);

  return (
    <SoundContext.Provider value={{ enabled, toggle, setVolume, currentTrack }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSoundContext must be used within SoundProvider");
  return ctx;
}
