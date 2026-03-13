"use client";

import { Pause, Play, LogOut } from "lucide-react";

interface GamePauseOverlayProps {
  isPaused: boolean;
  onResume: () => void;
  onQuit: () => void;
  accentColor: string;
  bgColor: string;
}

export default function GamePauseOverlay({
  isPaused,
  onResume,
  onQuit,
  accentColor,
  bgColor,
}: GamePauseOverlayProps) {
  return (
    <>
      {/* Pause button — always visible */}
      {!isPaused && (
        <button
          onClick={onResume} // This will be wired to toggle pause on
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-lg border border-[#ffffff20] flex items-center justify-center hover:bg-[#ffffff10] transition-colors"
          aria-label="Pause game"
          style={{ color: accentColor }}
        >
          <Pause size={18} />
        </button>
      )}

      {/* Pause overlay */}
      {isPaused && (
        <div
          className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-6"
          style={{ background: bgColor }}
          role="dialog"
          aria-label="Game paused"
        >
          <div className="text-[48px] mb-2" style={{ color: accentColor }}>
            <Pause size={48} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Game Paused</h2>
          <div className="flex flex-col gap-3 w-[220px]">
            <button
              onClick={onResume}
              className="flex items-center justify-center gap-2 font-bold text-[15px] px-8 py-4 rounded-lg transition-all hover:-translate-y-0.5"
              style={{
                background: accentColor,
                color: bgColor,
              }}
            >
              <Play size={18} />
              Resume
            </button>
            <button
              onClick={onQuit}
              className="flex items-center justify-center gap-2 font-bold text-[15px] px-8 py-4 rounded-lg border border-[#ffffff20] hover:border-[#ffffff40] transition-all text-[#ffffff99] hover:text-white"
            >
              <LogOut size={18} />
              Quit
            </button>
          </div>
          <p className="font-mono text-[11px] text-[#ffffff44] mt-4">
            Press Escape to resume
          </p>
        </div>
      )}
    </>
  );
}
