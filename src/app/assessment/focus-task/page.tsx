"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface TaskStatus {
  completedAt: string | null;
}

function readHistory(key: string): TaskStatus {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { completedAt: null };
    const arr = JSON.parse(raw);
    return { completedAt: arr[0]?.completedAt ?? null };
  } catch {
    return { completedAt: null };
  }
}

export default function FocusTaskHub() {
  const [gonogo, setGonogo] = useState<TaskStatus>({ completedAt: null });
  const [chronos, setChronos] = useState<TaskStatus>({ completedAt: null });
  const [focus, setFocus] = useState<TaskStatus>({ completedAt: null });

  useEffect(() => {
    setGonogo(readHistory("focus-task-history"));
    setChronos(readHistory("chronos-sort-history"));
    setFocus(readHistory("focus-quest-history"));
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0f14] text-[#dde3f0] flex items-center justify-center font-sans">
      <div className="text-center px-6 py-10 max-w-[600px] w-full">
        <p className="font-mono text-[10px] tracking-[3px] uppercase text-[#5a6180] mb-5">
          FocusOS — Cognitive Assessment
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
          Cognitive Battery
        </h1>
        <p className="font-mono text-[13px] text-[#5a6180] leading-relaxed max-w-md mx-auto mb-10">
          Three tasks. Three dimensions of executive function.<br />
          Complete all for a full cognitive profile.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
          {/* Go/No-Go card */}
          <Link
            href="/assessment/gonogo"
            className="block bg-[#1b1f2b] border border-[#252a38] rounded-2xl p-6 text-left hover:border-[#f5c842] hover:shadow-[0_0_30px_rgba(245,200,66,0.08)] transition-all group flex-1 max-w-[260px] mx-auto sm:mx-0"
          >
            <div className="text-4xl mb-4">⬛</div>
            <div className="font-bold text-[17px] text-[#f5c842] mb-1.5">
              Go / No-Go
            </div>
            <div className="font-mono text-[11px] text-[#5a6180] mb-4 leading-relaxed">
              Visual attention &amp; impulse control.<br />
              React fast to yellow squares. Hold still for dark ones.
            </div>
            <div className="font-mono text-[9px] text-[#5a6180] tracking-wider uppercase mb-3">
              Measures: AQvis · RCQvis · ICV · RT
            </div>
            {gonogo.completedAt ? (
              <div className="font-mono text-[9px] text-[#34d399]">
                ✓ Last played {new Date(gonogo.completedAt).toLocaleDateString()}
              </div>
            ) : (
              <div className="font-mono text-[9px] text-[#5a6180]">Not yet attempted</div>
            )}
          </Link>

          {/* Chronos Sort card */}
          <Link
            href="/assessment/chronos-task"
            className="block bg-[#1b1f2b] border border-[#252a38] rounded-2xl p-6 text-left hover:border-[#00d4c8] hover:shadow-[0_0_30px_rgba(0,212,200,0.08)] transition-all group flex-1 max-w-[260px] mx-auto sm:mx-0"
          >
            <div className="text-4xl mb-4">⏱</div>
            <div className="font-bold text-[17px] text-[#00d4c8] mb-1.5">
              Chronos Sort
            </div>
            <div className="font-mono text-[11px] text-[#5a6180] mb-4 leading-relaxed">
              Time estimation &amp; adaptation.<br />
              Hold until you feel it&apos;s right — no timer shown.
            </div>
            <div className="font-mono text-[9px] text-[#5a6180] tracking-wider uppercase mb-3">
              Measures: cIM · cHR · cIE
            </div>
            {chronos.completedAt ? (
              <div className="font-mono text-[9px] text-[#34d399]">
                ✓ Last played {new Date(chronos.completedAt).toLocaleDateString()}
              </div>
            ) : (
              <div className="font-mono text-[9px] text-[#5a6180]">Not yet attempted</div>
            )}
          </Link>

          {/* Focus Quest card */}
          <Link
            href="/assessment/focus-quest"
            className="block bg-[#0f2137] border border-[#1e3a5c] rounded-2xl p-6 text-left hover:border-[#38bdf8] hover:shadow-[0_0_30px_rgba(56,189,248,0.08)] transition-all group flex-1 max-w-[260px] mx-auto sm:mx-0"
          >
            <div className="text-4xl mb-4">🌊</div>
            <div className="font-bold text-[17px] text-[#38bdf8] mb-1.5">
              Focus Quest
            </div>
            <div className="font-mono text-[11px] text-[#5a6180] mb-4 leading-relaxed">
              Impulse control &amp; working memory.<br />
              Sea creatures + starfish/coin CPT.
            </div>
            <div className="font-mono text-[9px] text-[#5a6180] tracking-wider uppercase mb-3">
              Measures: CPT-X · CPT-AX · cIA · cHI
            </div>
            {focus.completedAt ? (
              <div className="font-mono text-[9px] text-[#34d399]">
                ✓ Last played {new Date(focus.completedAt).toLocaleDateString()}
              </div>
            ) : (
              <div className="font-mono text-[9px] text-[#5a6180]">Not yet attempted</div>
            )}
          </Link>
        </div>

        <p className="font-mono text-[10px] text-[#5a6180] mt-8">
          Results are saved locally on your device.
        </p>
      </div>
    </div>
  );
}
