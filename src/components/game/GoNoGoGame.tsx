"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { calcGoNoGoScores, type TrialRecord, type GoNoGoScores } from "@/lib/gonogo-scoring";
import { saveGameScore } from "@/lib/supabase/game-scores";
import { createClient } from "@/lib/supabase/client";

const CFG = {
  PRACTICE: 20,
  REAL: 160,
  GO_PROBABILITY: 0.7,
  STIM_DURATION: 600,
  ISI_MIN: 1500,
  ISI_MAX: 2500,
  CELLS: 16,
} as const;

const HISTORY_KEY = "focus-task-history";

interface FocusTaskEntry {
  scores: GoNoGoScores;
  completedAt: string;
}

type Screen =
  | "welcome"
  | "instructions"
  | "why-it-matters"
  | "practice-intro"
  | "game"
  | "feedback"
  | "real-intro"
  | "results";

interface FeedbackData {
  icon: string;
  title: string;
  color: string;
  sub: string;
}

interface GoNoGoGameProps {
  onComplete?: (scores: GoNoGoScores) => void;
}

function loadHistory(): FocusTaskEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToHistory(scores: GoNoGoScores) {
  try {
    const history = loadHistory();
    history.unshift({ scores, completedAt: new Date().toISOString() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20))); // keep last 20
  } catch {
    // localStorage unavailable
  }
}

export default function GoNoGoGame({ onComplete }: GoNoGoGameProps) {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [trialInfo, setTrialInfo] = useState("");
  const [activeCell, setActiveCell] = useState<{ index: number; type: "go" | "nogo" } | null>(null);
  const [hint, setHint] = useState("");
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [scores, setScores] = useState<GoNoGoScores | null>(null);
  const [history, setHistory] = useState<FocusTaskEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const dataRef = useRef<TrialRecord[]>([]);
  const isPracticeRef = useRef(true);
  const idxRef = useRef(0);
  const totalRef = useRef(0);
  const isGoRef = useRef(false);
  const t0Ref = useRef(0);
  const respondedRef = useRef(false);
  const blockedRef = useRef(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const showFeedback = useCallback(
    (isGo: boolean, responded: boolean, rt: number) => {
      let fb: FeedbackData;
      if (isGo && responded) {
        fb = { icon: "\u2713", title: "Correct", color: "#34d399", sub: `${rt}ms` };
      } else if (isGo) {
        fb = { icon: "\u25CB", title: "Missed", color: "#f87171", sub: "You should have tapped" };
      } else if (responded) {
        fb = { icon: "\u2715", title: "Too soon", color: "#f87171", sub: "Don't tap the dark square" };
      } else {
        fb = { icon: "\u2713", title: "Good hold", color: "#34d399", sub: "Correct \u2014 you waited" };
      }
      setFeedback(fb);
      setScreen("feedback");
    },
    []
  );

  const nextTrial = useCallback(() => {
    if (idxRef.current >= totalRef.current) {
      if (isPracticeRef.current) {
        setScreen("real-intro");
      } else {
        const s = calcGoNoGoScores(dataRef.current);
        setScores(s);
        saveToHistory(s);
        setHistory(loadHistory());
        onComplete?.(s);
        // Save to Supabase (fire-and-forget)
        const sessionId = localStorage.getItem("fayth-session-id");
        if (sessionId) {
          createClient().auth.getUser().then(({ data }) => {
            saveGameScore(s, sessionId, data.user?.id);
          });
        }
        setScreen("results");
      }
      return;
    }

    idxRef.current++;
    const isGo = Math.random() < CFG.GO_PROBABILITY;
    const cellIndex = Math.floor(Math.random() * CFG.CELLS);
    isGoRef.current = isGo;
    respondedRef.current = false;
    blockedRef.current = false;

    const phase = isPracticeRef.current ? "PRACTICE \u2014 " : "";
    setTrialInfo(`${phase}TRIAL ${idxRef.current} / ${totalRef.current}`);
    setHint(isGo ? "TAP \u2192 yellow square" : "");
    setProgress((idxRef.current / totalRef.current) * 100);
    setActiveCell({ index: cellIndex, type: isGo ? "go" : "nogo" });
    t0Ref.current = performance.now();

    addTimer(() => {
      blockedRef.current = true;
      setActiveCell(null);

      const rt = respondedRef.current ? Math.round(performance.now() - t0Ref.current) : -1;
      const correct = isGo ? respondedRef.current : !respondedRef.current;

      if (!isPracticeRef.current) {
        dataRef.current.push({
          trial: idxRef.current,
          trialType: isGo ? "go" : "nogo",
          responded: respondedRef.current,
          rt,
          correct,
        });
      }

      if (isPracticeRef.current) {
        showFeedback(isGo, respondedRef.current, rt);
        addTimer(() => {
          setScreen("game");
          addTimer(nextTrial, 800);
        }, 700);
      } else {
        const isi = CFG.ISI_MIN + Math.random() * (CFG.ISI_MAX - CFG.ISI_MIN);
        addTimer(nextTrial, isi);
      }
    }, CFG.STIM_DURATION);
  }, [addTimer, showFeedback, onComplete]);

  const tap = useCallback(() => {
    if (blockedRef.current || respondedRef.current) return;
    respondedRef.current = true;
  }, []);

  // Keyboard handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        tap();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [tap]);

  const startPractice = () => {
    isPracticeRef.current = true;
    totalRef.current = CFG.PRACTICE;
    idxRef.current = 0;
    setScreen("game");
    addTimer(nextTrial, 600);
  };

  const startReal = () => {
    isPracticeRef.current = false;
    totalRef.current = CFG.REAL;
    idxRef.current = 0;
    dataRef.current = [];
    setScreen("game");
    addTimer(nextTrial, 600);
  };

  const restart = () => {
    clearTimers();
    dataRef.current = [];
    idxRef.current = 0;
    setScores(null);
    setActiveCell(null);
    setScreen("welcome");
  };

  const scoreColor = (value: number, threshLow: number, threshHigh: number, invert = false) => {
    if (invert) {
      return value > threshHigh ? "#f87171" : value > threshLow ? "#f5c842" : "#34d399";
    }
    return value < threshLow ? "#f87171" : value < threshHigh ? "#f5c842" : "#34d399";
  };

  const lastEntry = history[0];

  return (
    <div className="min-h-screen bg-[#0d0f14] text-[#dde3f0] flex items-center justify-center font-sans">

      {/* Welcome */}
      {screen === "welcome" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn">
          <p className="font-mono text-[10px] tracking-[3px] uppercase text-[#5a6180] mb-5">
            FocusOS — Cognitive Assessment
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-3">
            Measure your<br /><span className="text-[#f5c842]">Visual Focus</span>
          </h1>
          <p className="font-mono text-[13px] text-[#5a6180] leading-relaxed max-w-[400px] mb-9">
            A grid-based attention task used in clinical ADHD research.<br />
            No right or wrong answers — just respond naturally.
          </p>
          <div className="flex gap-9 mb-8">
            <div>
              <div className="text-[32px] font-extrabold tracking-tight">15<span className="text-base text-[#5a6180]">min</span></div>
              <div className="font-mono text-[10px] text-[#5a6180] uppercase tracking-wider mt-1">Duration</div>
            </div>
            <div>
              <div className="text-[32px] font-extrabold tracking-tight">160</div>
              <div className="font-mono text-[10px] text-[#5a6180] uppercase tracking-wider mt-1">Trials</div>
            </div>
            <div>
              <div className="text-[32px] font-extrabold tracking-tight">4</div>
              <div className="font-mono text-[10px] text-[#5a6180] uppercase tracking-wider mt-1">Scores</div>
            </div>
          </div>

          {/* Previous performance */}
          {lastEntry && (
            <div className="w-full max-w-[380px] mb-8 p-4 bg-[#13161e] border border-[#252a38] rounded-xl">
              <p className="font-mono text-[10px] tracking-[2px] uppercase text-[#5a6180] mb-3">
                Your last attempt — {new Date(lastEntry.completedAt).toLocaleDateString()}
              </p>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <div className="text-[22px] font-extrabold" style={{ color: scoreColor(lastEntry.scores.aqvis, 70, 85) }}>
                    {lastEntry.scores.aqvis}
                  </div>
                  <div className="font-mono text-[9px] text-[#5a6180] uppercase tracking-wider">AQvis</div>
                </div>
                <div className="text-center">
                  <div className="text-[22px] font-extrabold" style={{ color: scoreColor(lastEntry.scores.rcqvis, 70, 85) }}>
                    {lastEntry.scores.rcqvis}
                  </div>
                  <div className="font-mono text-[9px] text-[#5a6180] uppercase tracking-wider">RCQvis</div>
                </div>
                <div className="text-center">
                  <div className="text-[22px] font-extrabold" style={{ color: scoreColor(lastEntry.scores.icv, 25, 35, true) }}>
                    {lastEntry.scores.icv}%
                  </div>
                  <div className="font-mono text-[9px] text-[#5a6180] uppercase tracking-wider">ICV</div>
                </div>
                <div className="text-center">
                  <div className="text-[22px] font-extrabold text-[#dde3f0]">{lastEntry.scores.meanRT}</div>
                  <div className="font-mono text-[9px] text-[#5a6180] uppercase tracking-wider">RT ms</div>
                </div>
              </div>
            </div>
          )}

          <button onClick={() => setScreen("instructions")} className="bg-[#f5c842] text-[#0d0f14] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(245,200,66,0.3)] transition-all">
            {lastEntry ? "Play Again" : "Begin Assessment"}
          </button>
        </div>
      )}

      {/* Instructions */}
      {screen === "instructions" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn">
          <h2 className="text-[22px] font-bold tracking-tight mb-7">How it works</h2>
          <div className="flex gap-4 flex-wrap justify-center mb-6">
            <div className="bg-[#1b1f2b] border border-[#252a38] rounded-xl p-6 w-[168px]">
              <div className="w-[52px] h-[52px] rounded-[10px] mx-auto mb-4 bg-[#f5c842] shadow-[0_0_20px_rgba(245,200,66,0.3)]" />
              <div className="text-[15px] font-bold text-[#f5c842] mb-1.5">Yellow — TAP</div>
              <div className="font-mono text-[11px] text-[#5a6180] leading-relaxed">Press spacebar or tap the screen as fast as you can</div>
            </div>
            <div className="bg-[#1b1f2b] border border-[#252a38] rounded-xl p-6 w-[168px]">
              <div className="w-[52px] h-[52px] rounded-[10px] mx-auto mb-4 bg-[#1b1f2b] border border-[#5a6180]" />
              <div className="text-[15px] font-bold text-[#5a6180] mb-1.5">Dark — WAIT</div>
              <div className="font-mono text-[11px] text-[#5a6180] leading-relaxed">Do nothing. Hold your response completely.</div>
            </div>
          </div>
          <p className="font-mono text-[13px] text-[#5a6180] leading-relaxed max-w-[400px] mb-4">
            A square appears in one cell of a 4x4 grid.<br />
            Yellow = tap fast. Dark = stay still.<br />
            Speed matters, but so does accuracy.
          </p>
          <p className="font-mono text-[11px] text-[#5a6180] leading-relaxed max-w-[400px] mb-9">
            <span className="text-[#4f8ef7]">Keyboard:</span> press Spacebar to respond.{" "}
            <span className="text-[#4f8ef7]">Touch:</span> tap anywhere on the grid.
          </p>
          <button onClick={() => setScreen("why-it-matters")} className="bg-[#f5c842] text-[#0d0f14] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(245,200,66,0.3)] transition-all">
            Got it — next
          </button>
        </div>
      )}

      {/* Why It Matters */}
      {screen === "why-it-matters" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn max-w-[500px] mx-auto">
          <span className="font-mono text-[10px] tracking-[2px] uppercase px-3.5 py-1 rounded bg-[rgba(245,200,66,0.08)] text-[#f5c842] border border-[rgba(245,200,66,0.2)] mb-6">
            Before you start
          </span>
          <h2 className="text-[22px] font-bold tracking-tight mb-6">
            Why 160 trials?<br />Why 15 minutes?
          </h2>

          <div className="flex flex-col gap-3 mb-8 text-left w-full">
            <div className="bg-[#13161e] border border-[#252a38] rounded-xl p-4">
              <div className="text-[#f5c842] font-bold text-[13px] mb-1">Attention isn&apos;t a snapshot</div>
              <div className="font-mono text-[11px] text-[#5a6180] leading-relaxed">
                ADHD affects how attention holds up over time, not just in short bursts. The task needs enough trials to measure whether your focus drifts — something that only shows up after several minutes.
              </div>
            </div>
            <div className="bg-[#13161e] border border-[#252a38] rounded-xl p-4">
              <div className="text-[#4f8ef7] font-bold text-[13px] mb-1">The score needs real data</div>
              <div className="font-mono text-[11px] text-[#5a6180] leading-relaxed">
                Your ICV score (reaction time variability) can only be calculated reliably from 100+ trials. Fewer trials = noisy, unreliable results. 160 is the clinical minimum.
              </div>
            </div>
            <div className="bg-[#13161e] border border-[#252a38] rounded-xl p-4">
              <div className="text-[#34d399] font-bold text-[13px] mb-1">The discomfort is the data</div>
              <div className="font-mono text-[11px] text-[#5a6180] leading-relaxed">
                Feeling bored, restless, or distracted during the task is normal — and meaningful. Your brain&apos;s response to a monotonous sustained task is exactly what&apos;s being measured.
              </div>
            </div>
          </div>

          <p className="font-mono text-[12px] text-[#5a6180] leading-relaxed mb-9">
            Find a quiet spot, put your phone down, and commit to finishing.<br />
            <span className="text-[#dde3f0]">Your results are only valid if you complete the full task.</span>
          </p>

          <button onClick={() => setScreen("practice-intro")} className="bg-[#f5c842] text-[#0d0f14] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(245,200,66,0.3)] transition-all">
            I&apos;m ready — let&apos;s go
          </button>
        </div>
      )}

      {/* Practice Intro */}
      {screen === "practice-intro" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn">
          <span className="font-mono text-[10px] tracking-[2px] uppercase px-3.5 py-1 rounded bg-[rgba(79,142,247,0.1)] text-[#4f8ef7] border border-[rgba(79,142,247,0.2)] mb-5">
            Practice Round
          </span>
          <h2 className="text-[22px] font-bold tracking-tight mb-7">20 practice trials<br />with feedback</h2>
          <p className="font-mono text-[13px] text-[#5a6180] leading-relaxed max-w-[400px] mb-9">
            You&apos;ll see Correct or Too Soon after each tap.<br />Feedback stops in the real task.
          </p>
          <button onClick={startPractice} className="bg-[#f5c842] text-[#0d0f14] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(245,200,66,0.3)] transition-all">
            Start practice
          </button>
        </div>
      )}

      {/* Real Intro */}
      {screen === "real-intro" && (
        <div className="flex flex-col items-center text-center px-6 py-10 animate-fadeIn">
          <span className="font-mono text-[10px] tracking-[2px] uppercase px-3.5 py-1 rounded bg-[rgba(245,200,66,0.1)] text-[#f5c842] border border-[rgba(245,200,66,0.2)] mb-5">
            Real Assessment
          </span>
          <h2 className="text-[22px] font-bold tracking-tight mb-7">Practice complete.<br />Real task begins now.</h2>
          <p className="font-mono text-[13px] text-[#5a6180] leading-relaxed max-w-[400px] mb-9">
            160 trials. No feedback.<br />Stay focused — the task measures attention over time.<br />Take a breath.
          </p>
          <button onClick={startReal} className="bg-[#f5c842] text-[#0d0f14] font-bold text-[15px] px-12 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(245,200,66,0.3)] transition-all">
            I&apos;m ready — begin
          </button>
        </div>
      )}

      {/* Game */}
      {screen === "game" && (
        <div className="flex flex-col items-center gap-5 px-6 py-10">
          <div className="font-mono text-[11px] text-[#5a6180] tracking-wider h-5">{trialInfo}</div>
          <div
            className="grid grid-cols-4 gap-1.5 p-3.5 bg-[#13161e] border border-[#252a38] rounded-[14px] cursor-pointer select-none"
            role="application"
            aria-label="Go/No-Go game grid. Press spacebar or tap to respond to yellow squares."
            onClick={tap}
            onTouchStart={(e) => { e.preventDefault(); tap(); }}
          >
            {Array.from({ length: CFG.CELLS }, (_, i) => (
              <div
                key={i}
                className={`w-[78px] h-[78px] max-sm:w-16 max-sm:h-16 rounded-lg border transition-all duration-75 ${
                  activeCell?.index === i
                    ? activeCell.type === "go"
                      ? "bg-[#f5c842] border-[#f5c842] shadow-[0_0_28px_rgba(245,200,66,0.3)]"
                      : "bg-[#1b1f2b] border-[#5a6180]"
                    : "bg-[#1b1f2b] border-[#252a38]"
                }`}
              />
            ))}
          </div>
          <div className="font-mono text-[11px] text-[#5a6180] h-[18px] tracking-wider">{hint}</div>
          <div className="w-[200px] h-0.5 bg-[#252a38] rounded-full">
            <div className="h-full bg-[#f5c842] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Feedback */}
      {screen === "feedback" && feedback && (
        <div className="flex flex-col items-center gap-2.5 px-6 py-10 animate-fadeIn">
          <div className="text-[52px] leading-none">{feedback.icon}</div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: feedback.color }}>{feedback.title}</div>
          <div className="font-mono text-xs text-[#5a6180]">{feedback.sub}</div>
        </div>
      )}

      {/* Results */}
      {screen === "results" && scores && (
        <div className="flex flex-col items-center text-center px-6 py-16 overflow-y-auto max-h-screen animate-fadeIn">
          <p className="font-mono text-[10px] tracking-[3px] uppercase text-[#5a6180] mb-4">Assessment complete</p>
          <h2 className="text-[22px] font-bold tracking-tight mb-8">Your Focus Map</h2>
          <div className="flex gap-3.5 flex-wrap justify-center mb-7">
            <ScoreCard
              accent="#f5c842"
              value={String(scores.aqvis)}
              color={scoreColor(scores.aqvis, 70, 85)}
              name="AQvis"
              desc="Visual Attention Quotient"
            />
            <ScoreCard
              accent="#4f8ef7"
              value={String(scores.rcqvis)}
              color={scoreColor(scores.rcqvis, 70, 85)}
              name="RCQvis"
              desc="Visual Response Control"
            />
            <ScoreCard
              accent="#34d399"
              value={`${scores.icv}%`}
              color={scoreColor(scores.icv, 25, 35, true)}
              name="ICV"
              desc="Reaction Time Variability"
            />
            <ScoreCard
              accent="#5a6180"
              value={String(scores.meanRT)}
              color="#dde3f0"
              name="Mean RT"
              desc="Milliseconds (avg speed)"
            />
          </div>

          {/* Previous run comparison */}
          {history.length >= 2 && (
            <div className="w-full max-w-[420px] mb-5 p-4 bg-[#13161e] border border-[#252a38] rounded-xl">
              <p className="font-mono text-[10px] tracking-[2px] uppercase text-[#5a6180] mb-3">
                vs last attempt ({new Date(history[1].completedAt).toLocaleDateString()})
              </p>
              <div className="flex justify-center gap-6">
                {[
                  { label: "AQvis", curr: scores.aqvis, prev: history[1].scores.aqvis, invert: false },
                  { label: "RCQvis", curr: scores.rcqvis, prev: history[1].scores.rcqvis, invert: false },
                  { label: "ICV", curr: scores.icv, prev: history[1].scores.icv, invert: true },
                  { label: "RT ms", curr: scores.meanRT, prev: history[1].scores.meanRT, invert: true },
                ].map(({ label, curr, prev, invert }) => {
                  const improved = invert ? curr < prev : curr > prev;
                  const same = curr === prev;
                  const diff = curr - prev;
                  return (
                    <div key={label} className="text-center">
                      <div className="font-mono text-[9px] text-[#5a6180] uppercase tracking-wider mb-1">{label}</div>
                      <div className={`text-[13px] font-bold ${same ? "text-[#5a6180]" : improved ? "text-[#34d399]" : "text-[#f87171]"}`}>
                        {same ? "—" : `${diff > 0 ? "+" : ""}${label === "ICV" || label === "RT ms" ? diff.toFixed(1) : diff}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* History count */}
          {history.length > 1 && (
            <p className="font-mono text-[10px] text-[#5a6180] mb-4">
              {history.length} attempts stored on this device
            </p>
          )}

          <div className="font-mono text-[11px] text-[#5a6180] leading-relaxed max-w-[420px] p-4 border border-[#252a38] rounded-lg bg-[#13161e] mb-5">
            AQvis &lt; 70 or ICV &gt; 35% may indicate attention difficulties.<br />
            These scores are for clinical screening only — not a diagnosis.<br />
            A clinician will review your full profile.
          </div>
          <button onClick={restart} className="bg-transparent text-[#dde3f0] border border-[#252a38] font-bold text-[15px] px-12 py-4 rounded-lg hover:border-[#4f8ef7] hover:text-[#4f8ef7] transition-all">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ accent, value, color, name, desc }: {
  accent: string;
  value: string;
  color: string;
  name: string;
  desc: string;
}) {
  return (
    <div className="bg-[#1b1f2b] border border-[#252a38] rounded-xl py-5 px-6 min-w-[128px] text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }} />
      <div className="text-[38px] font-extrabold tracking-tight leading-none mb-1.5" style={{ color }}>{value}</div>
      <div className="font-mono text-[10px] text-[#5a6180] tracking-[1.5px] uppercase">{name}</div>
      <div className="font-mono text-[10px] text-[#5a6180] mt-1 leading-relaxed">{desc}</div>
    </div>
  );
}
