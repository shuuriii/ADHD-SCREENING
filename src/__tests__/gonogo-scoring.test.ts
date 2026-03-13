import { describe, it, expect } from "vitest";
import { calcGoNoGoScores, type TrialRecord } from "@/lib/gonogo-scoring";

function makeTrials(goCount: number, nogoCount: number, opts?: {
  goRespondRate?: number;
  nogoRespondRate?: number;
  rtRange?: [number, number];
}): TrialRecord[] {
  const respondGo = opts?.goRespondRate ?? 1.0;
  const respondNogo = opts?.nogoRespondRate ?? 0.0;
  const [rtMin, rtMax] = opts?.rtRange ?? [300, 500];
  const trials: TrialRecord[] = [];

  for (let i = 0; i < goCount; i++) {
    const responded = Math.random() < respondGo;
    const rt = responded ? rtMin + Math.random() * (rtMax - rtMin) : -1;
    trials.push({
      trial: i,
      trialType: "go",
      responded,
      rt,
      correct: responded,
    });
  }

  for (let i = 0; i < nogoCount; i++) {
    const responded = Math.random() < respondNogo;
    trials.push({
      trial: goCount + i,
      trialType: "nogo",
      responded,
      rt: responded ? rtMin + Math.random() * (rtMax - rtMin) : -1,
      correct: !responded,
    });
  }

  return trials;
}

describe("calcGoNoGoScores", () => {
  it("returns perfect scores for ideal performance", () => {
    const trials = makeTrials(50, 20, { goRespondRate: 1.0, nogoRespondRate: 0.0, rtRange: [400, 400] });
    const scores = calcGoNoGoScores(trials);

    expect(scores.hits).toBe(50);
    expect(scores.omissions).toBe(0);
    expect(scores.falseAlarms).toBe(0);
    expect(scores.correctRejections).toBe(20);
    expect(scores.goTotal).toBe(50);
    expect(scores.nogoTotal).toBe(20);
    expect(scores.aqvis).toBeGreaterThanOrEqual(90);
    expect(scores.rcqvis).toBe(100);
  });

  it("clamps scores to 0-100", () => {
    // Many omissions and false alarms to push scores negative
    const trials = makeTrials(50, 20, { goRespondRate: 0.1, nogoRespondRate: 0.9, rtRange: [100, 2000] });
    const scores = calcGoNoGoScores(trials);

    expect(scores.aqvis).toBeGreaterThanOrEqual(0);
    expect(scores.aqvis).toBeLessThanOrEqual(100);
    expect(scores.rcqvis).toBeGreaterThanOrEqual(0);
    expect(scores.rcqvis).toBeLessThanOrEqual(100);
  });

  it("handles empty data gracefully", () => {
    const scores = calcGoNoGoScores([]);
    expect(scores.aqvis).toBeGreaterThanOrEqual(0);
    expect(scores.rcqvis).toBeGreaterThanOrEqual(0);
    expect(scores.meanRT).toBe(0);
    expect(scores.goTotal).toBe(0);
    expect(scores.nogoTotal).toBe(0);
  });

  it("computes correct omission and commission percentages", () => {
    const trials: TrialRecord[] = [
      // 4 go trials: 3 responded, 1 omission → 25% omission
      { trial: 0, trialType: "go", responded: true, rt: 400, correct: true },
      { trial: 1, trialType: "go", responded: true, rt: 450, correct: true },
      { trial: 2, trialType: "go", responded: true, rt: 350, correct: true },
      { trial: 3, trialType: "go", responded: false, rt: -1, correct: false },
      // 2 nogo trials: 1 false alarm → 50% commission
      { trial: 4, trialType: "nogo", responded: true, rt: 300, correct: false },
      { trial: 5, trialType: "nogo", responded: false, rt: -1, correct: true },
    ];
    const scores = calcGoNoGoScores(trials);
    expect(scores.omissionPct).toBe(25);
    expect(scores.commissionPct).toBe(50);
    expect(scores.hits).toBe(3);
    expect(scores.falseAlarms).toBe(1);
  });
});
