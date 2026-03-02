"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  calcChronosScores,
  type ChronosTrialRecord,
  type ChronosScores,
} from "@/lib/chronos-scoring";
import { saveGameToBundle } from "@/lib/report-bundle";

const CFG = {
  PRACTICE: 8,
  PHASE1: 20,
  PHASE2: 20,
  QUICK_P1: 2000, // 2 seconds
  SLOW_P1: 5000, // 5 seconds
  QUICK_P2: 1500, // 1.5 seconds (shorter after rule change)
  SLOW_P2: 3500, // 3.5 seconds (shorter after rule change)
  FEEDBACK_MS: 1400,
  GAP_MS: 700,
  PREMATURE_THRESH: 0.5,
} as const;

const HISTORY_KEY = "chronos-sort-history";

type Screen =
  | "welcome"
  | "instructions"
  | "practice-intro"
  | "game"
  | "real-intro"
  | "rule-change"
  | "results";

type Phase = "practice" | "phase1" | "phase2";

interface HeldItem {
  type: "quick" | "slow";
  target: number;
}

interface Feedback {
  label: string;
  sub: string;
  color: string;
}

interface HistoryEntry {
  scores: ChronosScores;
  completedAt: string;
}

interface Props {
  onComplete?: (scores: ChronosScores) => void;
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(scores: ChronosScores) {
  try {
    const h = loadHistory();
    h.unshift({ scores, completedAt: new Date().toISOString() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 20)));
  } catch {
    // localStorage unavailable
  }
}

export default function ChronosSortGame({ onComplete }: Props) {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [heldItem, setHeldItem] = useState<HeldItem | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [trialLabel, setTrialLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [scores, setScores] = useState<ChronosScores | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const phaseRef = useRef<Phase>("practice");
  const trialIdxRef = useRef(0);
  const totalRef = useRef(0);
  const holdStartRef = useRef(0);
  const itemRef = useRef<HeldItem | null>(null);
  const isHoldingRef = useRef(false);
  const stateRef = useRef<"idle" | "holding" | "post">("idle");
  const dataRef = useRef<ChronosTrialRecord[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const spawnItem = useCallback(() => {
    const type: "quick" | "slow" = Math.random() < 0.5 ? "quick" : "slow";
    const phase = phaseRef.current;
    const target =
      phase === "phase2"
        ? type === "quick"
          ? CFG.QUICK_P2
          : CFG.SLOW_P2
        : type === "quick"
          ? CFG.QUICK_P1
          : CFG.SLOW_P1;

    const item: HeldItem = { type, target };
    itemRef.current = item;
    setHeldItem(item);

    const phaseStr =
      phase === "practice"
        ? "PRACTICE"
        : phase === "phase1"
          ? "PHASE 1"
          : "PHASE 2";
    setTrialLabel(`${phaseStr} — TRIAL ${trialIdxRef.current} / ${totalRef.current}`);
    setProgress(((trialIdxRef.current - 1) / totalRef.current) * 100);
    stateRef.current = "idle";
  }, []);

  const endTrial = useCallback(
    (actualDuration: number) => {
      const item = itemRef.current;
      if (!item) return;

      const { type, target } = item;
      const phase = phaseRef.current;
      const error = Math.min(Math.abs(actualDuration - target) / target, 2);
      const premature = actualDuration < target * CFG.PREMATURE_THRESH;

      if (phase !== "practice") {
        dataRef.current.push({
          trial: trialIdxRef.current,
          phase: phase === "phase1" ? 1 : 2,
          itemType: type,
          targetDuration: target,
          actualDuration: Math.round(actualDuration),
          error,
          premature,
        });
      }

      const diff = actualDuration - target;
      const diffAbs = Math.abs(diff);
      let label: string, sub: string, color: string;

      if (premature) {
        label = "⚡ Released too early";
        sub =
          phase === "practice" ? `${(diffAbs / 1000).toFixed(1)}s too soon` : "";
        color = "#f87171";
      } else if (error < 0.15) {
        label = "✓ Excellent timing!";
        sub =
          phase === "practice"
            ? `${diff > 0 ? "+" : ""}${(diff / 1000).toFixed(1)}s`
            : "";
        color = "#34d399";
      } else if (error < 0.35) {
        label = diff > 0 ? "⏱ A bit long" : "⚡ A bit short";
        sub =
          phase === "practice"
            ? `${diff > 0 ? "+" : ""}${(diff / 1000).toFixed(1)}s`
            : "";
        color = "#f5c842";
      } else {
        label = diff > 0 ? "⏱ Way too long" : "⚡ Way too short";
        sub =
          phase === "practice"
            ? `${diff > 0 ? "+" : ""}${(diff / 1000).toFixed(1)}s`
            : "";
        color = "#f87171";
      }

      setFeedback({ label, sub, color });
      setHeldItem(null);
      itemRef.current = null;

      addTimer(() => {
        setFeedback(null);
        trialIdxRef.current++;

        if (trialIdxRef.current > totalRef.current) {
          if (phase === "practice") {
            setScreen("real-intro");
          } else if (phase === "phase1") {
            setScreen("rule-change");
          } else {
            const s = calcChronosScores(dataRef.current);
            setScores(s);
            saveHistory(s);
            setHistory(loadHistory());
            saveGameToBundle("chronos", s);
            onComplete?.(s);
            setScreen("results");
          }
          return;
        }

        addTimer(spawnItem, CFG.GAP_MS);
      }, CFG.FEEDBACK_MS);
    },
    [addTimer, spawnItem, onComplete]
  );

  const startHold = useCallback(() => {
    if (stateRef.current !== "idle" || !itemRef.current) return;
    stateRef.current = "holding";
    isHoldingRef.current = true;
    holdStartRef.current = performance.now();
    setIsHolding(true);
  }, []);

  const endHold = useCallback(() => {
    if (!isHoldingRef.current || stateRef.current !== "holding") return;
    const duration = performance.now() - holdStartRef.current;
    isHoldingRef.current = false;
    stateRef.current = "post";
    setIsHolding(false);
    endTrial(duration);
  }, [endTrial]);

  // Keyboard: spacebar hold
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        startHold();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        endHold();
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [startHold, endHold]);

  const startPhase = (phase: Phase) => {
    phaseRef.current = phase;
    trialIdxRef.current = 1;
    if (phase === "practice") {
      totalRef.current = CFG.PRACTICE;
    } else if (phase === "phase1") {
      totalRef.current = CFG.PHASE1;
      dataRef.current = [];
    } else {
      totalRef.current = CFG.PHASE2;
    }
    setScreen("game");
    addTimer(spawnItem, 700);
  };

  const restart = () => {
    clearTimers();
    dataRef.current = [];
    trialIdxRef.current = 0;
    isHoldingRef.current = false;
    stateRef.current = "idle";
    setScores(null);
    setHeldItem(null);
    setFeedback(null);
    setIsHolding(false);
    setScreen("welcome");
  };

  const itemColor =
    heldItem?.type === "quick"
      ? "#00d4c8"
      : heldItem?.type === "slow"
        ? "#f59e0b"
        : "#f5c842";

  const lastEntry = history[0];

  const scoreColor = (v: number, lo: number, hi: number, invert = false) => {
    if (invert)
      return v > hi ? "#f87171" : v > lo ? "#f5c842" : "#34d399";
    return v < lo ? "#f87171" : v < hi ? "#f5c842" : "#34d399";
  };

  // CSS custom property trick for dynamic keyframe color
  const chargeStyle = isHolding
    ? ({
        "--charge-lo": `${itemColor}44`,
        "--charge-hi": `${itemColor}99`,
        animation: "chronos-charge 0.65s ease-in-out infinite",
        borderColor: itemColor,
        background: `${itemColor}1a`,
        transform: "scale(1.02)",
      } as React.CSSProperties)
    : {
        borderColor: `${itemColor}55`,
        background: `${itemColor}0d`,
        transition: "all 0.2s",
      };

  return (
    <div className="min-h-screen bg-[#0d0f14] text-[#dde3f0] flex items-center justify-center font-sans">

      {/* Welcome */}
      {screen === "welcome" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn">
          <p className="font-mono text-[10px] tracking-[3px] uppercase text-[#5a6180] mb-5">
            FocusOS — Cognitive Assessment
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-3">
            The<br /><span className="text-[#00d4c8]">Chronos Sort</span>
          </h1>
          <p className="font-mono text-[13px] text-[#5a6180] leading-relaxed max-w-[400px] mb-9">
            A time estimation task measuring time blindness.<br />
            Hold. Release. Trust your internal clock — no timer shown.
          </p>
          <div className="flex gap-9 mb-8">
            <div>
              <div className="text-[32px] font-extrabold tracking-tight">
                5<span className="text-base text-[#5a6180]">min</span>
              </div>
              <div className="font-mono text-[10px] text-[#5a6180] uppercase tracking-wider mt-1">Duration</div>
            </div>
            <div>
              <div className="text-[32px] font-extrabold tracking-tight">40</div>
              <div className="font-mono text-[10px] text-[#5a6180] uppercase tracking-wider mt-1">Trials</div>
            </div>
            <div>
              <div className="text-[32px] font-extrabold tracking-tight">3</div>
              <div className="font-mono text-[10px] text-[#5a6180] uppercase tracking-wider mt-1">Scores</div>
            </div>
          </div>

          {lastEntry && (
            <div className="w-full max-w-[380px] mb-8 p-4 bg-[#13161e] border border-[#252a38] rounded-xl">
              <p className="font-mono text-[10px] tracking-[2px] uppercase text-[#5a6180] mb-3">
                Last attempt — {new Date(lastEntry.completedAt).toLocaleDateString()}
              </p>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <div className="text-[22px] font-extrabold" style={{ color: scoreColor(lastEntry.scores.cIM, 50, 70) }}>
                    {lastEntry.scores.cIM}
                  </div>
                  <div className="font-mono text-[9px] text-[#5a6180] uppercase tracking-wider">cIM</div>
                </div>
                <div className="text-center">
                  <div className="text-[22px] font-extrabold" style={{ color: scoreColor(lastEntry.scores.cHR, 60, 80) }}>
                    {lastEntry.scores.cHR}
                  </div>
                  <div className="font-mono text-[9px] text-[#5a6180] uppercase tracking-wider">cHR</div>
                </div>
                <div className="text-center">
                  <div className="text-[22px] font-extrabold" style={{ color: scoreColor(lastEntry.scores.cIE, 40, 60) }}>
                    {lastEntry.scores.cIE}
                  </div>
                  <div className="font-mono text-[9px] text-[#5a6180] uppercase tracking-wider">cIE</div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setScreen("instructions")}
            className="bg-[#00d4c8] text-[#0d0f14] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,212,200,0.3)] transition-all"
          >
            {lastEntry ? "Play Again" : "Begin Assessment"}
          </button>
        </div>
      )}

      {/* Instructions */}
      {screen === "instructions" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn max-w-[500px] mx-auto">
          <h2 className="text-[22px] font-bold tracking-tight mb-7">How it works</h2>
          <div className="flex gap-4 flex-wrap justify-center mb-6">
            <div className="bg-[#1b1f2b] border border-[#252a38] rounded-xl p-5 w-[148px]">
              <div className="text-3xl mb-3">⚡</div>
              <div className="text-[14px] font-bold text-[#00d4c8] mb-1.5">QUICK</div>
              <div className="font-mono text-[10px] text-[#5a6180] leading-relaxed">Shorter hold time. Release sooner.</div>
            </div>
            <div className="bg-[#1b1f2b] border border-[#252a38] rounded-xl p-5 w-[148px]">
              <div className="text-3xl mb-3">🕐</div>
              <div className="text-[14px] font-bold text-[#f59e0b] mb-1.5">SLOW</div>
              <div className="font-mono text-[10px] text-[#5a6180] leading-relaxed">Longer hold time. Wait longer.</div>
            </div>
          </div>
          <div className="flex flex-col gap-3 mb-8 text-left w-full">
            <div className="bg-[#13161e] border border-[#252a38] rounded-xl p-4">
              <div className="text-[#00d4c8] font-bold text-[13px] mb-1">Press and hold</div>
              <div className="font-mono text-[11px] text-[#5a6180] leading-relaxed">
                Hold the HOLD button (or spacebar) until you feel the item is charged, then release.
              </div>
            </div>
            <div className="bg-[#13161e] border border-[#252a38] rounded-xl p-4">
              <div className="text-[#f59e0b] font-bold text-[13px] mb-1">No timer shown</div>
              <div className="font-mono text-[11px] text-[#5a6180] leading-relaxed">
                There is no visible clock. Use your internal sense of time only.
              </div>
            </div>
            <div className="bg-[#13161e] border border-[#252a38] rounded-xl p-4">
              <div className="text-[#f5c842] font-bold text-[13px] mb-1">Rules change halfway</div>
              <div className="font-mono text-[11px] text-[#5a6180] leading-relaxed">
                After 20 real trials, the required hold times shift. Recalibrate.
              </div>
            </div>
          </div>
          <button
            onClick={() => setScreen("practice-intro")}
            className="bg-[#00d4c8] text-[#0d0f14] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,212,200,0.3)] transition-all"
          >
            Got it — next
          </button>
        </div>
      )}

      {/* Practice Intro */}
      {screen === "practice-intro" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn">
          <span className="font-mono text-[10px] tracking-[2px] uppercase px-3.5 py-1 rounded bg-[rgba(79,142,247,0.1)] text-[#4f8ef7] border border-[rgba(79,142,247,0.2)] mb-5">
            Practice Round
          </span>
          <h2 className="text-[22px] font-bold tracking-tight mb-7">
            8 practice trials<br />with detailed feedback
          </h2>
          <p className="font-mono text-[13px] text-[#5a6180] leading-relaxed max-w-[400px] mb-9">
            You&apos;ll see exactly how far off your timing was.<br />
            Use this to calibrate your internal clock.
          </p>
          <button
            onClick={() => startPhase("practice")}
            className="bg-[#00d4c8] text-[#0d0f14] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,212,200,0.3)] transition-all"
          >
            Start practice
          </button>
        </div>
      )}

      {/* Game */}
      {screen === "game" && (
        <div className="flex flex-col items-center gap-8 px-6 py-10 w-full max-w-[400px] mx-auto">
          <div className="font-mono text-[11px] text-[#5a6180] tracking-wider h-5">
            {trialLabel}
          </div>

          {/* Item display area */}
          <div className="w-full h-[200px] flex items-center justify-center">
            {feedback ? (
              <div className="flex flex-col items-center gap-2 animate-fadeIn">
                <div className="text-[26px] font-bold" style={{ color: feedback.color }}>
                  {feedback.label}
                </div>
                {feedback.sub && (
                  <div className="font-mono text-sm text-[#5a6180]">{feedback.sub}</div>
                )}
              </div>
            ) : heldItem ? (
              <div
                className="w-full h-full rounded-2xl border-2 flex flex-col items-center justify-center gap-3"
                style={chargeStyle}
              >
                <div className="text-[52px] leading-none">
                  {heldItem.type === "quick" ? "⚡" : "🕐"}
                </div>
                <div
                  className="font-bold text-xl tracking-wider"
                  style={{ color: itemColor }}
                >
                  {heldItem.type.toUpperCase()}
                </div>
                <div className="font-mono text-[11px] text-[#5a6180]">
                  {isHolding ? "charging..." : "hold the button below"}
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>

          {/* Hold button */}
          <button
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={(e) => {
              e.preventDefault();
              startHold();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              endHold();
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              endHold();
            }}
            disabled={!heldItem || !!feedback}
            className="w-full h-20 rounded-2xl font-bold text-xl tracking-widest uppercase transition-all duration-150 select-none touch-none"
            style={{
              background: isHolding ? itemColor : "#1b1f2b",
              color:
                isHolding
                  ? "#0d0f14"
                  : !heldItem || feedback
                    ? "#5a6180"
                    : "#dde3f0",
              border: `2px solid ${
                isHolding
                  ? itemColor
                  : !heldItem || feedback
                    ? "#252a38"
                    : "#3a4258"
              }`,
              boxShadow: isHolding ? `0 0 40px ${itemColor}66` : "none",
              cursor: !heldItem || feedback ? "default" : "pointer",
            }}
          >
            {isHolding ? "CHARGING..." : "HOLD"}
          </button>

          <p className="font-mono text-[10px] text-[#5a6180]">
            Spacebar also works
          </p>

          {/* Progress bar */}
          <div className="w-full h-0.5 bg-[#252a38] rounded-full">
            <div
              className="h-full bg-[#00d4c8] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Real Intro (after practice) */}
      {screen === "real-intro" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn">
          <span className="font-mono text-[10px] tracking-[2px] uppercase px-3.5 py-1 rounded bg-[rgba(0,212,200,0.1)] text-[#00d4c8] border border-[rgba(0,212,200,0.2)] mb-5">
            Real Assessment
          </span>
          <h2 className="text-[22px] font-bold tracking-tight mb-7">
            Practice complete.<br />Real task begins now.
          </h2>
          <p className="font-mono text-[13px] text-[#5a6180] leading-relaxed max-w-[400px] mb-4">
            20 trials. Minimal feedback shown.<br />
            Hold times are the same as practice.
          </p>
          <p className="font-mono text-[11px] text-[#5a6180] leading-relaxed max-w-[400px] mb-9">
            <span className="text-[#dde3f0]">Remember:</span> ⚡ QUICK = shorter hold — 🕐 SLOW = longer hold.
          </p>
          <button
            onClick={() => startPhase("phase1")}
            className="bg-[#00d4c8] text-[#0d0f14] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,212,200,0.3)] transition-all"
          >
            I&apos;m ready — begin
          </button>
        </div>
      )}

      {/* Rule Change screen */}
      {screen === "rule-change" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn max-w-[500px] mx-auto">
          <span className="font-mono text-[10px] tracking-[2px] uppercase px-3.5 py-1 rounded bg-[rgba(248,113,113,0.1)] text-[#f87171] border border-[rgba(248,113,113,0.2)] mb-5">
            Phase Shift
          </span>
          <h2 className="text-[22px] font-bold tracking-tight mb-4">
            ⚠ The timing has changed
          </h2>
          <p className="font-mono text-[13px] text-[#5a6180] leading-relaxed max-w-[380px] mb-8">
            The required hold times have shifted for the next 20 trials.
            Both QUICK and SLOW now require{" "}
            <span className="text-[#dde3f0]">different durations</span>.
          </p>
          <div className="flex gap-4 mb-8">
            <div className="bg-[#13161e] border border-[#252a38] rounded-xl p-4 text-center w-[140px]">
              <div className="text-[#00d4c8] font-bold text-[13px] mb-1">⚡ QUICK</div>
              <div className="font-mono text-[10px] text-[#5a6180]">Shorter than before</div>
            </div>
            <div className="bg-[#13161e] border border-[#252a38] rounded-xl p-4 text-center w-[140px]">
              <div className="text-[#f59e0b] font-bold text-[13px] mb-1">🕐 SLOW</div>
              <div className="font-mono text-[10px] text-[#5a6180]">Shorter than before</div>
            </div>
          </div>
          <p className="font-mono text-[12px] text-[#5a6180] leading-relaxed mb-9">
            Recalibrate your sense of time.<br />
            <span className="text-[#dde3f0]">Trust your instincts.</span>
          </p>
          <button
            onClick={() => startPhase("phase2")}
            className="bg-[#f87171] text-[#0d0f14] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(248,113,113,0.3)] transition-all"
          >
            I understand — continue
          </button>
        </div>
      )}

      {/* Results */}
      {screen === "results" && scores && (
        <div className="flex flex-col items-center text-center px-6 py-16 overflow-y-auto max-h-screen animate-fadeIn">
          <p className="font-mono text-[10px] tracking-[3px] uppercase text-[#5a6180] mb-4">
            Assessment complete
          </p>
          <h2 className="text-[22px] font-bold tracking-tight mb-8">
            Your Temporal Profile
          </h2>

          <div className="flex gap-3.5 flex-wrap justify-center mb-7">
            <ScoreCard
              accent="#00d4c8"
              value={String(scores.cIM)}
              color={scoreColor(scores.cIM, 50, 70)}
              name="cIM"
              desc="Temporal Memory"
            />
            <ScoreCard
              accent="#f87171"
              value={String(scores.cHR)}
              color={scoreColor(scores.cHR, 60, 80)}
              name="cHR"
              desc="Patience Index"
            />
            <ScoreCard
              accent="#f59e0b"
              value={String(scores.cIE)}
              color={scoreColor(scores.cIE, 40, 60)}
              name="cIE"
              desc="Adaptation Index"
            />
            <ScoreCard
              accent="#5a6180"
              value={`${scores.meanErrorPct}%`}
              color="#dde3f0"
              name="Avg Error"
              desc="Mean timing error"
            />
          </div>

          {/* Phase comparison */}
          <div className="w-full max-w-[420px] mb-5 p-4 bg-[#13161e] border border-[#252a38] rounded-xl">
            <p className="font-mono text-[10px] tracking-[2px] uppercase text-[#5a6180] mb-3">
              Adaptation to rule change
            </p>
            <div className="flex justify-center gap-8 mb-3">
              <div className="text-center">
                <div className="font-mono text-[9px] text-[#5a6180] uppercase tracking-wider mb-1">
                  Phase 1 Error
                </div>
                <div className="text-[18px] font-bold text-[#dde3f0]">
                  {scores.phase1MeanError}%
                </div>
              </div>
              <div className="text-[#5a6180] flex items-center">→</div>
              <div className="text-center">
                <div className="font-mono text-[9px] text-[#5a6180] uppercase tracking-wider mb-1">
                  Phase 2 Error
                </div>
                <div
                  className="text-[18px] font-bold"
                  style={{
                    color:
                      scores.phase2MeanError < scores.phase1MeanError
                        ? "#34d399"
                        : "#f87171",
                  }}
                >
                  {scores.phase2MeanError}%
                </div>
              </div>
            </div>
            <p
              className="font-mono text-[10px]"
              style={{
                color:
                  scores.phase2MeanError < scores.phase1MeanError
                    ? "#34d399"
                    : "#f87171",
              }}
            >
              {scores.phase2MeanError < scores.phase1MeanError
                ? "✓ You adapted well to the new timing rules"
                : "Adaptation was challenging — a key ADHD marker"}
            </p>
          </div>

          {history.length >= 2 && (
            <div className="w-full max-w-[420px] mb-5 p-4 bg-[#13161e] border border-[#252a38] rounded-xl">
              <p className="font-mono text-[10px] tracking-[2px] uppercase text-[#5a6180] mb-3">
                vs last attempt ({new Date(history[1].completedAt).toLocaleDateString()})
              </p>
              <div className="flex justify-center gap-6">
                {[
                  { label: "cIM", curr: scores.cIM, prev: history[1].scores.cIM },
                  { label: "cHR", curr: scores.cHR, prev: history[1].scores.cHR },
                  { label: "cIE", curr: scores.cIE, prev: history[1].scores.cIE },
                ].map(({ label, curr, prev }) => {
                  const diff = curr - prev;
                  return (
                    <div key={label} className="text-center">
                      <div className="font-mono text-[9px] text-[#5a6180] uppercase tracking-wider mb-1">
                        {label}
                      </div>
                      <div
                        className={`text-[13px] font-bold ${
                          diff === 0
                            ? "text-[#5a6180]"
                            : diff > 0
                              ? "text-[#34d399]"
                              : "text-[#f87171]"
                        }`}
                      >
                        {diff === 0 ? "—" : `${diff > 0 ? "+" : ""}${diff}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="font-mono text-[11px] text-[#5a6180] leading-relaxed max-w-[420px] p-4 border border-[#252a38] rounded-lg bg-[#13161e] mb-5">
            Time blindness is strongly linked to inattentive ADHD.<br />
            cIM {"<"} 50 or high premature release rate may indicate temporal processing differences.<br />
            These scores are for screening only — not a diagnosis.
          </div>

          <button
            onClick={restart}
            className="bg-transparent text-[#dde3f0] border border-[#252a38] font-bold text-[15px] px-12 py-4 rounded-lg hover:border-[#00d4c8] hover:text-[#00d4c8] transition-all"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

function ScoreCard({
  accent,
  value,
  color,
  name,
  desc,
}: {
  accent: string;
  value: string;
  color: string;
  name: string;
  desc: string;
}) {
  return (
    <div className="bg-[#1b1f2b] border border-[#252a38] rounded-xl py-5 px-6 min-w-[128px] text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }} />
      <div
        className="text-[38px] font-extrabold tracking-tight leading-none mb-1.5"
        style={{ color }}
      >
        {value}
      </div>
      <div className="font-mono text-[10px] text-[#5a6180] tracking-[1.5px] uppercase">
        {name}
      </div>
      <div className="font-mono text-[10px] text-[#5a6180] mt-1 leading-relaxed">
        {desc}
      </div>
    </div>
  );
}
