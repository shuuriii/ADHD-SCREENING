export interface ChronosTrialRecord {
  trial: number;
  phase: 1 | 2; // practice excluded from scoring
  itemType: "quick" | "slow";
  targetDuration: number; // ms
  actualDuration: number; // ms
  error: number; // |actual - target| / target, capped at 2.0
  premature: boolean; // released < 50% of target duration
}

export interface ChronosScores {
  cIM: number; // 0-100 Temporal Memory Index
  cHR: number; // 0-100 Patience / Hyperactivity Index
  cIE: number; // 0-100 Adaptation / Impulsivity Index
  meanErrorPct: number; // mean error as percentage
  prematureRate: number; // % premature releases
  phase1MeanError: number; // phase 1 mean error %
  phase2MeanError: number; // phase 2 mean error %
  totalTrials: number;
}

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

export function calcChronosScores(data: ChronosTrialRecord[]): ChronosScores {
  const p1 = data.filter((t) => t.phase === 1);
  const p2 = data.filter((t) => t.phase === 2);
  const all = data;

  const meanError = avg(all.map((t) => t.error));
  const prematureCount = all.filter((t) => t.premature).length;
  const prematureRate = all.length ? prematureCount / all.length : 0;
  const p1MeanError = avg(p1.map((t) => t.error));
  const p2MeanError = avg(p2.map((t) => t.error));

  // cIM: overall temporal accuracy (lower error = higher score)
  const cIM = Math.max(0, Math.min(100, Math.round(100 - meanError * 100)));

  // cHR: restraint / patience (fewer premature = higher score)
  const cHR = Math.max(
    0,
    Math.min(100, Math.round(100 - prematureRate * 150))
  );

  // cIE: adaptation to rule change
  // 50 = baseline (no change), >50 = improved in phase 2, <50 = got worse
  const adaptationDelta = (p1MeanError - p2MeanError) * 100;
  const cIE = Math.max(0, Math.min(100, Math.round(50 + adaptationDelta)));

  return {
    cIM,
    cHR,
    cIE,
    meanErrorPct: Number((meanError * 100).toFixed(1)),
    prematureRate: Number((prematureRate * 100).toFixed(1)),
    phase1MeanError: Number((p1MeanError * 100).toFixed(1)),
    phase2MeanError: Number((p2MeanError * 100).toFixed(1)),
    totalTrials: all.length,
  };
}
