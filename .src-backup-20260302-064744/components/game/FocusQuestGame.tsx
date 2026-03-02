"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  calcFocusQuestScores,
  type XTrialRecord,
  type AXTrialRecord,
  type AXTrialType,
  type FocusQuestScores,
} from "@/lib/focus-quest-scoring";
import { saveGameToBundle } from "@/lib/report-bundle";

// ─── Config ────────────────────────────────────────────────────────────────

const CFG = {
  WARMUP: 10,
  X_REAL: 80,
  AX_PRACTICE: 5,
  AX_REAL: 60,
  STIM_DURATION: 600, // ms stimulus visible
  ISI_MIN: 1000,
  ISI_MAX: 1600,
  FEEDBACK_MS: 900,
  GAP_MS: 600,
  JELLYFISH_PROB: 0.2, // X-Test NOGO probability
  AX_PROB: 0.3, // probability of AX sequence
  BX_PROB: 0.15, // probability of BX sequence
} as const;

// ─── Stimuli ────────────────────────────────────────────────────────────────

const X_GO = ["🐟", "🦀", "🐢", "🐙", "🦑"];
const X_NOGO = "🪼"; // red jellyfish
const AX_CUE = "⭐"; // starfish (A)
const AX_TARGET = "🪙"; // gold coin (X)
const AX_B = ["🐟", "🦀", "🐢", "🐙"]; // non-cue creatures (B)
const AX_Y = ["🐚", "🦐", "🐡"]; // non-target after cue (Y)

const HISTORY_KEY = "focus-quest-history";

// ─── Types ──────────────────────────────────────────────────────────────────

type Screen =
  | "welcome"
  | "instructions"
  | "warmup-intro"
  | "game"
  | "x-real-intro"
  | "ax-intro"
  | "ax-practice-intro"
  | "ax-real-intro"
  | "results";

type Phase = "warmup" | "x-test" | "ax-practice" | "ax-test";

interface Stimulus {
  emoji: string;
  isNogo: boolean; // X-Test only
  glow: "red" | "gold" | "teal" | "none";
}

interface FeedbackData {
  label: string;
  color: string;
}

interface HistoryEntry {
  scores: FocusQuestScores;
  completedAt: string;
}

interface Props {
  onComplete?: (scores: FocusQuestScores) => void;
}

// ─── History helpers ────────────────────────────────────────────────────────

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(scores: FocusQuestScores) {
  try {
    const h = loadHistory();
    h.unshift({ scores, completedAt: new Date().toISOString() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 20)));
  } catch {
    // localStorage unavailable
  }
}

// ─── Stimulus generators ────────────────────────────────────────────────────

function pickXStimulus(): Stimulus {
  const isNogo = Math.random() < CFG.JELLYFISH_PROB;
  if (isNogo) return { emoji: X_NOGO, isNogo: true, glow: "red" };
  const emoji = X_GO[Math.floor(Math.random() * X_GO.length)];
  return { emoji, isNogo: false, glow: "none" };
}

/** Pick next AX stimulus, tracking previous for sequence logic */
function pickAXStimulus(
  prevEmoji: string | null,
  isFirst: boolean
): { emoji: string; glow: "gold" | "teal" | "none" } {
  if (isFirst) {
    // First trial: pick a B stimulus (never a coin to avoid phantom AX)
    const emoji = AX_B[Math.floor(Math.random() * AX_B.length)];
    return { emoji, glow: "none" };
  }

  const wasA = prevEmoji === AX_CUE;

  if (wasA) {
    // Previous was starfish — decide AX or AY
    if (Math.random() < CFG.AX_PROB / (CFG.AX_PROB + 0.3)) {
      return { emoji: AX_TARGET, glow: "teal" }; // AX (target!)
    } else {
      const emoji = AX_Y[Math.floor(Math.random() * AX_Y.length)];
      return { emoji, glow: "none" }; // AY
    }
  } else {
    // Previous was B — decide BX or BY
    const r = Math.random();
    if (r < CFG.BX_PROB) {
      return { emoji: AX_TARGET, glow: "teal" }; // BX (critical distractor)
    } else if (r < CFG.BX_PROB + 0.25) {
      return { emoji: AX_CUE, glow: "gold" }; // new A cue
    } else {
      const emoji = AX_B[Math.floor(Math.random() * AX_B.length)];
      return { emoji, glow: "none" }; // BY
    }
  }
}

function getAXTrialType(prevEmoji: string | null, curEmoji: string): AXTrialType {
  const isA = prevEmoji === AX_CUE;
  const isX = curEmoji === AX_TARGET;
  if (isA && isX) return "AX";
  if (isA && !isX) return "AY";
  if (!isA && isX) return "BX";
  return "BY";
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function FocusQuestGame({ onComplete }: Props) {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [stimulus, setStimulus] = useState<Stimulus | null>(null);
  const [showStim, setShowStim] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [trialLabel, setTrialLabel] = useState("");
  const [xProgress, setXProgress] = useState(0);
  const [axProgress, setAXProgress] = useState(0);
  const [scores, setScores] = useState<FocusQuestScores | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const phaseRef = useRef<Phase>("warmup");
  const trialIdxRef = useRef(0);
  const totalRef = useRef(0);
  const respondedRef = useRef(false);
  const blockedRef = useRef(true);
  const isGoRef = useRef(true); // X-Test: is this a GO trial?
  const t0Ref = useRef(0);
  const stimulusRef = useRef<Stimulus | null>(null);

  // AX-Test state
  const prevEmojiRef = useRef<string | null>(null);
  const axEmojiRef = useRef<string>("");
  const isAXTargetRef = useRef(false); // is this an AX trial (should respond)?

  const xDataRef = useRef<XTrialRecord[]>([]);
  const axDataRef = useRef<AXTrialRecord[]>([]);
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

  // ── X-Test trial loop ────────────────────────────────────────────────────

  const nextXTrial = useCallback(() => {
    if (trialIdxRef.current >= totalRef.current) {
      const phase = phaseRef.current;
      if (phase === "warmup") {
        setScreen("x-real-intro");
      } else {
        // x-test complete → go to AX intro
        setScreen("ax-intro");
      }
      return;
    }

    trialIdxRef.current++;
    const stim = pickXStimulus();
    stimulusRef.current = stim;
    isGoRef.current = !stim.isNogo;
    respondedRef.current = false;
    blockedRef.current = false;

    const phase = phaseRef.current;
    const label =
      phase === "warmup"
        ? `PRACTICE — ${trialIdxRef.current} / ${totalRef.current}`
        : `X-TEST — ${trialIdxRef.current} / ${totalRef.current}`;
    setTrialLabel(label);

    if (phase !== "warmup") {
      setXProgress((trialIdxRef.current / totalRef.current) * 100);
    }

    setStimulus(stim);
    setShowStim(true);
    t0Ref.current = performance.now();

    addTimer(() => {
      blockedRef.current = true;
      setShowStim(false);
      setStimulus(null);

      const rt = respondedRef.current
        ? Math.round(performance.now() - t0Ref.current)
        : -1;
      const isGo = isGoRef.current;
      const correct = isGo ? respondedRef.current : !respondedRef.current;

      if (phase !== "warmup") {
        xDataRef.current.push({
          trial: trialIdxRef.current,
          stimulus: stimulusRef.current?.emoji ?? "",
          isNogo: !isGo,
          responded: respondedRef.current,
          rt,
          correct,
        });
      }

      if (phase === "warmup") {
        let fb: FeedbackData;
        if (isGo && respondedRef.current)
          fb = { label: "✓ Correct", color: "#34d399" };
        else if (isGo)
          fb = { label: "○ Missed it", color: "#f87171" };
        else if (respondedRef.current)
          fb = { label: "✗ Don't tap jellyfish!", color: "#f87171" };
        else
          fb = { label: "✓ Good hold", color: "#34d399" };

        setFeedback(fb);
        addTimer(() => {
          setFeedback(null);
          addTimer(nextXTrial, CFG.GAP_MS);
        }, CFG.FEEDBACK_MS);
      } else {
        const isi = CFG.ISI_MIN + Math.random() * (CFG.ISI_MAX - CFG.ISI_MIN);
        addTimer(nextXTrial, isi);
      }
    }, CFG.STIM_DURATION);
  }, [addTimer]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── AX-Test trial loop ───────────────────────────────────────────────────

  const nextAXTrial = useCallback(() => {
    if (trialIdxRef.current >= totalRef.current) {
      const phase = phaseRef.current;
      if (phase === "ax-practice") {
        setScreen("ax-real-intro");
      } else {
        // Done! Calculate scores.
        const s = calcFocusQuestScores(xDataRef.current, axDataRef.current);
        setScores(s);
        saveHistory(s);
        setHistory(loadHistory());
        saveGameToBundle("focusQuest", s);
        onComplete?.(s);
        setScreen("results");
      }
      return;
    }

    trialIdxRef.current++;
    const isFirst = trialIdxRef.current === 1;
    const prev = prevEmojiRef.current;
    const axStim = pickAXStimulus(prev, isFirst);
    axEmojiRef.current = axStim.emoji;

    // Determine if this is an AX trial (only coins can be targets)
    const trialType = isFirst ? "BY" : getAXTrialType(prev, axStim.emoji);
    isAXTargetRef.current = trialType === "AX";

    respondedRef.current = false;
    blockedRef.current = false;

    const phase = phaseRef.current;
    const label =
      phase === "ax-practice"
        ? `AX-PRACTICE — ${trialIdxRef.current} / ${totalRef.current}`
        : `AX-TEST — ${trialIdxRef.current} / ${totalRef.current}`;
    setTrialLabel(label);

    if (phase !== "ax-practice") {
      setAXProgress((trialIdxRef.current / totalRef.current) * 100);
    }

    const stim: Stimulus = {
      emoji: axStim.emoji,
      isNogo: false,
      glow: axStim.glow,
    };
    stimulusRef.current = stim;
    setStimulus(stim);
    setShowStim(true);
    t0Ref.current = performance.now();

    addTimer(() => {
      blockedRef.current = true;
      setShowStim(false);
      const curEmoji = axEmojiRef.current;
      setStimulus(null);

      const rt = respondedRef.current
        ? Math.round(performance.now() - t0Ref.current)
        : -1;
      const isTarget = isAXTargetRef.current;
      const correct = isTarget ? respondedRef.current : !respondedRef.current;

      if (phase !== "ax-practice") {
        const type = isFirst ? "BY" : getAXTrialType(prev, curEmoji);
        axDataRef.current.push({
          trial: trialIdxRef.current,
          prevStimulus: prev ?? "",
          stimulus: curEmoji,
          trialType: type,
          responded: respondedRef.current,
          rt,
          correct,
        });
      }

      // Update previous emoji
      prevEmojiRef.current = curEmoji;

      if (phase === "ax-practice") {
        let fb: FeedbackData;
        if (isTarget && respondedRef.current)
          fb = { label: "✓ Correct!", color: "#34d399" };
        else if (isTarget)
          fb = { label: "○ Missed — Starfish → Coin = TAP", color: "#f87171" };
        else if (respondedRef.current)
          fb = { label: "✗ Don't tap here", color: "#f87171" };
        else
          fb = { label: "✓ Good hold", color: "#34d399" };

        setFeedback(fb);
        addTimer(() => {
          setFeedback(null);
          addTimer(nextAXTrial, CFG.GAP_MS);
        }, CFG.FEEDBACK_MS);
      } else {
        const isi = CFG.ISI_MIN + Math.random() * (CFG.ISI_MAX - CFG.ISI_MIN);
        addTimer(nextAXTrial, isi);
      }
    }, CFG.STIM_DURATION);
  }, [addTimer, onComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Input handling ────────────────────────────────────────────────────────

  const tap = useCallback(() => {
    if (blockedRef.current || respondedRef.current) return;
    respondedRef.current = true;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        tap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tap]);

  // ── Phase starters ────────────────────────────────────────────────────────

  const startPhase = (phase: Phase) => {
    phaseRef.current = phase;
    trialIdxRef.current = 0;
    respondedRef.current = false;
    blockedRef.current = true;
    prevEmojiRef.current = null;

    if (phase === "warmup") totalRef.current = CFG.WARMUP;
    else if (phase === "x-test") {
      totalRef.current = CFG.X_REAL;
      xDataRef.current = [];
    } else if (phase === "ax-practice") {
      totalRef.current = CFG.AX_PRACTICE;
    } else {
      totalRef.current = CFG.AX_REAL;
      axDataRef.current = [];
      prevEmojiRef.current = null;
    }

    setScreen("game");
    const isAX = phase === "ax-practice" || phase === "ax-test";
    addTimer(isAX ? nextAXTrial : nextXTrial, 700);
  };

  const restart = () => {
    clearTimers();
    xDataRef.current = [];
    axDataRef.current = [];
    prevEmojiRef.current = null;
    setScores(null);
    setStimulus(null);
    setFeedback(null);
    setShowStim(false);
    setXProgress(0);
    setAXProgress(0);
    setScreen("welcome");
  };

  // ── Glow styles ───────────────────────────────────────────────────────────

  const glowColor: Record<string, string> = {
    red: "#f87171",
    gold: "#f59e0b",
    teal: "#38bdf8",
    none: "#38bdf8",
  };

  const currentGlow = stimulus?.glow ?? "none";
  const accentColor = glowColor[currentGlow];

  const scoreColor = (v: number, lo: number, hi: number, invert = false) => {
    if (invert) return v > hi ? "#f87171" : v > lo ? "#f5c842" : "#34d399";
    return v < lo ? "#f87171" : v < hi ? "#f5c842" : "#34d399";
  };

  const lastEntry = history[0];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a1628] text-[#e0f2fe] flex items-center justify-center font-sans select-none">

      {/* Welcome */}
      {screen === "welcome" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn">
          <p className="font-mono text-[10px] tracking-[3px] uppercase text-[#4a7fa5] mb-5">
            FocusOS — Cognitive Assessment
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-3">
            <span className="text-[#38bdf8]">Focus Quest</span>
          </h1>
          <p className="font-mono text-[13px] text-[#4a7fa5] leading-relaxed max-w-[400px] mb-9">
            A sea-world attention task used in clinical ADHD research.<br />
            Two phases — impulse control, then working memory.
          </p>

          <div className="flex gap-9 mb-8">
            <div>
              <div className="text-[32px] font-extrabold">20<span className="text-base text-[#4a7fa5]">min</span></div>
              <div className="font-mono text-[10px] text-[#4a7fa5] uppercase tracking-wider mt-1">Duration</div>
            </div>
            <div>
              <div className="text-[32px] font-extrabold">140</div>
              <div className="font-mono text-[10px] text-[#4a7fa5] uppercase tracking-wider mt-1">Trials</div>
            </div>
            <div>
              <div className="text-[32px] font-extrabold">4</div>
              <div className="font-mono text-[10px] text-[#4a7fa5] uppercase tracking-wider mt-1">Scores</div>
            </div>
          </div>

          {lastEntry && (
            <div className="w-full max-w-[380px] mb-8 p-4 bg-[#0f2137] border border-[#1e3a5c] rounded-xl">
              <p className="font-mono text-[10px] tracking-[2px] uppercase text-[#4a7fa5] mb-3">
                Last attempt — {new Date(lastEntry.completedAt).toLocaleDateString()}
              </p>
              <div className="flex justify-center gap-6">
                {[
                  { label: "CPT-X", v: lastEntry.scores.cCPT_X },
                  { label: "CPT-AX", v: lastEntry.scores.cCPT_AX },
                  { label: "cIA", v: lastEntry.scores.cIA },
                  { label: "cHI", v: lastEntry.scores.cHI },
                ].map(({ label, v }) => (
                  <div key={label} className="text-center">
                    <div className="text-[22px] font-extrabold" style={{ color: scoreColor(v, 50, 70) }}>
                      {v}
                    </div>
                    <div className="font-mono text-[9px] text-[#4a7fa5] uppercase tracking-wider">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setScreen("instructions")}
            className="bg-[#38bdf8] text-[#0a1628] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(56,189,248,0.3)] transition-all"
          >
            {lastEntry ? "Play Again" : "Begin Assessment"}
          </button>
        </div>
      )}

      {/* Instructions */}
      {screen === "instructions" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn max-w-[520px] mx-auto">
          <h2 className="text-[22px] font-bold tracking-tight mb-7">Two phases, two skills</h2>

          <div className="flex flex-col gap-3 mb-8 text-left w-full">
            <div className="bg-[#0f2137] border border-[#1e3a5c] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🌊</span>
                <span className="font-bold text-[#38bdf8] text-[13px]">Phase 1 — X-Test (Impulse Control)</span>
              </div>
              <div className="font-mono text-[11px] text-[#4a7fa5] leading-relaxed mb-2">
                Sea creatures swim past one at a time.
              </div>
              <div className="flex gap-4 text-sm">
                <div className="bg-[#0a1628] rounded-lg p-3 text-center flex-1">
                  <div className="text-2xl mb-1">🐟</div>
                  <div className="text-[#34d399] font-bold text-xs">TAP</div>
                  <div className="font-mono text-[10px] text-[#4a7fa5]">any creature</div>
                </div>
                <div className="bg-[#0a1628] rounded-lg p-3 text-center flex-1">
                  <div className="text-2xl mb-1" style={{ filter: "drop-shadow(0 0 8px #f87171)" }}>🪼</div>
                  <div className="text-[#f87171] font-bold text-xs">HOLD</div>
                  <div className="font-mono text-[10px] text-[#4a7fa5]">red jellyfish</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0f2137] border border-[#1e3a5c] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🧠</span>
                <span className="font-bold text-[#f59e0b] text-[13px]">Phase 2 — AX-Test (Working Memory)</span>
              </div>
              <div className="font-mono text-[11px] text-[#4a7fa5] leading-relaxed mb-2">
                Now tap <em>only</em> when a coin 🪙 follows directly after a starfish ⭐.
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="bg-[#0a1628] rounded-lg px-3 py-2 text-center flex-1 min-w-[90px]">
                  <div className="text-lg">⭐ → 🪙</div>
                  <div className="text-[#34d399] font-bold text-[10px]">TAP</div>
                </div>
                <div className="bg-[#0a1628] rounded-lg px-3 py-2 text-center flex-1 min-w-[90px]">
                  <div className="text-lg">⭐ → 🐚</div>
                  <div className="text-[#f87171] font-bold text-[10px]">HOLD</div>
                </div>
                <div className="bg-[#0a1628] rounded-lg px-3 py-2 text-center flex-1 min-w-[90px]">
                  <div className="text-lg">🐟 → 🪙</div>
                  <div className="text-[#f87171] font-bold text-[10px]">HOLD</div>
                </div>
              </div>
            </div>
          </div>

          <p className="font-mono text-[11px] text-[#4a7fa5] leading-relaxed mb-8">
            <span className="text-[#e0f2fe]">Keyboard:</span> Spacebar to respond.{" "}
            <span className="text-[#e0f2fe]">Touch:</span> tap anywhere on the creature.
          </p>

          <button
            onClick={() => setScreen("warmup-intro")}
            className="bg-[#38bdf8] text-[#0a1628] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(56,189,248,0.3)] transition-all"
          >
            Got it — next
          </button>
        </div>
      )}

      {/* Warmup intro */}
      {screen === "warmup-intro" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn">
          <span className="font-mono text-[10px] tracking-[2px] uppercase px-3.5 py-1 rounded bg-[rgba(56,189,248,0.1)] text-[#38bdf8] border border-[rgba(56,189,248,0.2)] mb-5">
            Warm-up
          </span>
          <h2 className="text-[22px] font-bold tracking-tight mb-7">
            10 practice trials<br />with feedback
          </h2>
          <p className="font-mono text-[13px] text-[#4a7fa5] leading-relaxed max-w-[400px] mb-9">
            You&apos;ll see if each response was correct.<br />
            Feedback stops in the real task.
          </p>
          <button
            onClick={() => startPhase("warmup")}
            className="bg-[#38bdf8] text-[#0a1628] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(56,189,248,0.3)] transition-all"
          >
            Start warm-up
          </button>
        </div>
      )}

      {/* X-Test real intro */}
      {screen === "x-real-intro" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn">
          <span className="font-mono text-[10px] tracking-[2px] uppercase px-3.5 py-1 rounded bg-[rgba(56,189,248,0.1)] text-[#38bdf8] border border-[rgba(56,189,248,0.2)] mb-5">
            Phase 1 — Real Assessment
          </span>
          <h2 className="text-[22px] font-bold tracking-tight mb-7">
            Warm-up complete.<br />X-Test begins now.
          </h2>
          <p className="font-mono text-[13px] text-[#4a7fa5] leading-relaxed max-w-[400px] mb-4">
            80 trials. No feedback shown.<br />
            TAP every creature — HOLD for the red jellyfish.
          </p>
          <p className="font-mono text-[11px] text-[#4a7fa5] max-w-[400px] mb-9">
            Stay focused — the task measures whether attention dips over time.
          </p>
          <button
            onClick={() => startPhase("x-test")}
            className="bg-[#38bdf8] text-[#0a1628] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(56,189,248,0.3)] transition-all"
          >
            I&apos;m ready — begin
          </button>
        </div>
      )}

      {/* AX intro */}
      {screen === "ax-intro" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn max-w-[500px] mx-auto">
          <span className="font-mono text-[10px] tracking-[2px] uppercase px-3.5 py-1 rounded bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)] mb-5">
            Phase 2
          </span>
          <h2 className="text-[22px] font-bold tracking-tight mb-4">
            ⭐ The rules have changed
          </h2>
          <p className="font-mono text-[13px] text-[#4a7fa5] leading-relaxed max-w-[380px] mb-6">
            Now you must remember the <em>previous</em> creature.
          </p>
          <div className="bg-[#0f2137] border border-[#1e3a5c] rounded-xl p-5 mb-8 text-left w-full">
            <div className="font-mono text-[12px] text-[#e0f2fe] mb-3 font-bold">Only tap when:</div>
            <div className="text-[28px] mb-2">⭐ → 🪙</div>
            <div className="font-mono text-[11px] text-[#4a7fa5]">Starfish followed immediately by a Gold Coin</div>
            <div className="border-t border-[#1e3a5c] mt-4 pt-4 font-mono text-[11px] text-[#4a7fa5]">
              Any other sequence — hold still.
            </div>
          </div>
          <button
            onClick={() => setScreen("ax-practice-intro")}
            className="bg-[#f59e0b] text-[#0a1628] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(245,158,11,0.3)] transition-all"
          >
            I understand
          </button>
        </div>
      )}

      {/* AX practice intro */}
      {screen === "ax-practice-intro" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn">
          <span className="font-mono text-[10px] tracking-[2px] uppercase px-3.5 py-1 rounded bg-[rgba(79,142,247,0.1)] text-[#4f8ef7] border border-[rgba(79,142,247,0.2)] mb-5">
            AX Practice
          </span>
          <h2 className="text-[22px] font-bold tracking-tight mb-7">
            5 practice trials<br />to learn the sequence
          </h2>
          <p className="font-mono text-[13px] text-[#4a7fa5] leading-relaxed max-w-[400px] mb-9">
            Feedback will show whether you tapped correctly.<br />
            Remember: only tap the 🪙 that follows ⭐.
          </p>
          <button
            onClick={() => startPhase("ax-practice")}
            className="bg-[#38bdf8] text-[#0a1628] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(56,189,248,0.3)] transition-all"
          >
            Start practice
          </button>
        </div>
      )}

      {/* AX real intro */}
      {screen === "ax-real-intro" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn">
          <span className="font-mono text-[10px] tracking-[2px] uppercase px-3.5 py-1 rounded bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)] mb-5">
            AX-Test — Real Assessment
          </span>
          <h2 className="text-[22px] font-bold tracking-tight mb-7">
            Practice complete.<br />AX-Test begins now.
          </h2>
          <p className="font-mono text-[13px] text-[#4a7fa5] leading-relaxed max-w-[400px] mb-9">
            60 trials. No feedback.<br />
            Tap only ⭐ → 🪙. Stay focused.
          </p>
          <button
            onClick={() => startPhase("ax-test")}
            className="bg-[#f59e0b] text-[#0a1628] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(245,158,11,0.3)] transition-all"
          >
            Begin AX-Test
          </button>
        </div>
      )}

      {/* Game */}
      {screen === "game" && (
        <div className="flex flex-col items-center gap-8 px-6 py-10 w-full max-w-[400px] mx-auto">
          <div className="font-mono text-[11px] text-[#4a7fa5] tracking-wider h-5">{trialLabel}</div>

          {/* Stimulus / Feedback area */}
          <div
            className="w-48 h-48 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              background: "#0f2137",
              border: `2px solid ${showStim ? accentColor : "#1e3a5c"}`,
              boxShadow: showStim
                ? `0 0 40px ${accentColor}55, 0 0 15px ${accentColor}33`
                : "none",
              transition: "all 0.1s",
            }}
            onClick={tap}
            onTouchStart={(e) => {
              e.preventDefault();
              tap();
            }}
            role="button"
            aria-label="Response area — tap here or press Spacebar"
          >
            {feedback ? (
              <div className="flex flex-col items-center gap-1 animate-fadeIn">
                <div className="text-[22px] font-bold" style={{ color: feedback.color }}>
                  {feedback.label}
                </div>
              </div>
            ) : showStim && stimulus ? (
              <div
                className="text-[72px] leading-none fq-swim-in"
                style={
                  stimulus.glow === "red"
                    ? { filter: "drop-shadow(0 0 12px #f87171)" }
                    : stimulus.glow === "gold"
                      ? { filter: "drop-shadow(0 0 12px #f59e0b)" }
                      : stimulus.glow === "teal"
                        ? { filter: "drop-shadow(0 0 12px #38bdf8)" }
                        : {}
                }
              >
                {stimulus.emoji}
              </div>
            ) : (
              <div className="w-3 h-3 rounded-full bg-[#1e3a5c]" />
            )}
          </div>

          <p className="font-mono text-[10px] text-[#4a7fa5]">
            Tap circle or press Spacebar to respond
          </p>

          {/* Dual progress bars */}
          <div className="w-full space-y-2">
            <div className="flex items-center gap-2">
              <div className="font-mono text-[9px] text-[#4a7fa5] w-12 text-right shrink-0">X-Test</div>
              <div className="flex-1 h-0.5 bg-[#1e3a5c] rounded-full">
                <div
                  className="h-full bg-[#38bdf8] rounded-full transition-all duration-300"
                  style={{ width: `${xProgress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="font-mono text-[9px] text-[#4a7fa5] w-12 text-right shrink-0">AX-Test</div>
              <div className="flex-1 h-0.5 bg-[#1e3a5c] rounded-full">
                <div
                  className="h-full bg-[#f59e0b] rounded-full transition-all duration-300"
                  style={{ width: `${axProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {screen === "results" && scores && (
        <div className="flex flex-col items-center text-center px-6 py-16 overflow-y-auto max-h-screen animate-fadeIn">
          <p className="font-mono text-[10px] tracking-[3px] uppercase text-[#4a7fa5] mb-4">
            Assessment complete
          </p>
          <h2 className="text-[22px] font-bold tracking-tight mb-8">
            Your Focus Profile
          </h2>

          {/* Primary scores */}
          <div className="flex gap-3.5 flex-wrap justify-center mb-5">
            <ScoreCard accent="#38bdf8" value={String(scores.cCPT_X)} color={scoreColor(scores.cCPT_X, 50, 70)} name="CPT-X" desc="Impulse Control" />
            <ScoreCard accent="#f59e0b" value={String(scores.cCPT_AX)} color={scoreColor(scores.cCPT_AX, 50, 70)} name="CPT-AX" desc="Working Memory" />
            <ScoreCard accent="#34d399" value={String(scores.cIA)} color={scoreColor(scores.cIA, 50, 70)} name="cIA" desc="Inattention Index" />
            <ScoreCard accent="#f87171" value={String(scores.cHI)} color={scoreColor(scores.cHI, 50, 70)} name="cHI" desc="Impulsivity Index" />
          </div>

          {/* X-Test details */}
          <div className="w-full max-w-[420px] mb-4 p-4 bg-[#0f2137] border border-[#1e3a5c] rounded-xl text-left">
            <p className="font-mono text-[10px] tracking-[2px] uppercase text-[#4a7fa5] mb-3">
              X-Test breakdown
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Omissions", v: `${scores.xOmissionPct}%`, hint: "inattention" },
                { label: "Commissions", v: `${scores.xCommissionPct}%`, hint: "impulsivity" },
                { label: "Mean RT", v: `${scores.xMeanRT}ms`, hint: "speed" },
                { label: "RT Var (ICV)", v: `${scores.xICV}%`, hint: "consistency" },
                { label: "d-prime", v: String(scores.dPrime), hint: "AX sensitivity" },
                { label: "AX Errors", v: String(scores.axOmissions + scores.bxErrors), hint: "WM failures" },
              ].map(({ label, v, hint }) => (
                <div key={label} className="text-center">
                  <div className="font-bold text-[15px] text-[#e0f2fe]">{v}</div>
                  <div className="font-mono text-[8px] text-[#4a7fa5] uppercase">{label}</div>
                  <div className="font-mono text-[8px] text-[#2a5a7a]">{hint}</div>
                </div>
              ))}
            </div>
          </div>

          {history.length >= 2 && (
            <div className="w-full max-w-[420px] mb-4 p-4 bg-[#0f2137] border border-[#1e3a5c] rounded-xl">
              <p className="font-mono text-[10px] tracking-[2px] uppercase text-[#4a7fa5] mb-3">
                vs last attempt ({new Date(history[1].completedAt).toLocaleDateString()})
              </p>
              <div className="flex justify-center gap-6">
                {[
                  { label: "CPT-X", curr: scores.cCPT_X, prev: history[1].scores.cCPT_X },
                  { label: "CPT-AX", curr: scores.cCPT_AX, prev: history[1].scores.cCPT_AX },
                  { label: "cIA", curr: scores.cIA, prev: history[1].scores.cIA },
                  { label: "cHI", curr: scores.cHI, prev: history[1].scores.cHI },
                ].map(({ label, curr, prev }) => {
                  const diff = curr - prev;
                  return (
                    <div key={label} className="text-center">
                      <div className="font-mono text-[9px] text-[#4a7fa5] uppercase tracking-wider mb-1">{label}</div>
                      <div className={`text-[13px] font-bold ${diff === 0 ? "text-[#4a7fa5]" : diff > 0 ? "text-[#34d399]" : "text-[#f87171]"}`}>
                        {diff === 0 ? "—" : `${diff > 0 ? "+" : ""}${diff}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="font-mono text-[11px] text-[#4a7fa5] leading-relaxed max-w-[420px] p-4 border border-[#1e3a5c] rounded-lg bg-[#0f2137] mb-5">
            CPT-X {"<"} 50 may indicate impulse control difficulties.<br />
            High BX errors ({scores.bxErrors}) suggest working memory + impulsivity overlap.<br />
            These scores are for screening only — not a diagnosis.
          </div>

          <button
            onClick={restart}
            className="bg-transparent text-[#e0f2fe] border border-[#1e3a5c] font-bold text-[15px] px-12 py-4 rounded-lg hover:border-[#38bdf8] hover:text-[#38bdf8] transition-all"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ accent, value, color, name, desc }: {
  accent: string; value: string; color: string; name: string; desc: string;
}) {
  return (
    <div className="bg-[#0f2137] border border-[#1e3a5c] rounded-xl py-5 px-6 min-w-[120px] text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }} />
      <div className="text-[36px] font-extrabold tracking-tight leading-none mb-1.5" style={{ color }}>{value}</div>
      <div className="font-mono text-[10px] text-[#4a7fa5] tracking-[1.5px] uppercase">{name}</div>
      <div className="font-mono text-[10px] text-[#4a7fa5] mt-1 leading-relaxed">{desc}</div>
    </div>
  );
}
