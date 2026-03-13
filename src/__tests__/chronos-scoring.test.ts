import { describe, it, expect } from "vitest";
import { calcChronosScores, type ChronosTrialRecord } from "@/lib/chronos-scoring";

describe("calcChronosScores", () => {
  it("returns perfect scores for zero-error, no-premature trials", () => {
    const trials: ChronosTrialRecord[] = Array.from({ length: 10 }, (_, i) => ({
      trial: i,
      phase: (i < 5 ? 1 : 2) as 1 | 2,
      itemType: "quick" as const,
      targetDuration: 1000,
      actualDuration: 1000,
      error: 0,
      premature: false,
    }));
    const scores = calcChronosScores(trials);

    expect(scores.cIM).toBe(100);
    expect(scores.cHR).toBe(100);
    expect(scores.cIE).toBe(50); // no change between phases
    expect(scores.totalTrials).toBe(10);
  });

  it("clamps all scores to 0-100", () => {
    const trials: ChronosTrialRecord[] = Array.from({ length: 10 }, (_, i) => ({
      trial: i,
      phase: (i < 5 ? 1 : 2) as 1 | 2,
      itemType: "quick" as const,
      targetDuration: 1000,
      actualDuration: 3000,
      error: 2.0, // max capped error
      premature: true,
    }));
    const scores = calcChronosScores(trials);

    expect(scores.cIM).toBeGreaterThanOrEqual(0);
    expect(scores.cIM).toBeLessThanOrEqual(100);
    expect(scores.cHR).toBeGreaterThanOrEqual(0);
    expect(scores.cHR).toBeLessThanOrEqual(100);
    expect(scores.cIE).toBeGreaterThanOrEqual(0);
    expect(scores.cIE).toBeLessThanOrEqual(100);
  });

  it("detects adaptation (improvement in phase 2)", () => {
    const trials: ChronosTrialRecord[] = [
      // Phase 1: high error
      ...Array.from({ length: 5 }, (_, i) => ({
        trial: i, phase: 1 as const, itemType: "quick" as const,
        targetDuration: 1000, actualDuration: 1500, error: 0.5, premature: false,
      })),
      // Phase 2: low error
      ...Array.from({ length: 5 }, (_, i) => ({
        trial: i + 5, phase: 2 as const, itemType: "quick" as const,
        targetDuration: 1000, actualDuration: 1100, error: 0.1, premature: false,
      })),
    ];
    const scores = calcChronosScores(trials);

    // Phase 1 error > Phase 2 error → cIE > 50 (improved)
    expect(scores.cIE).toBeGreaterThan(50);
  });

  it("handles empty data", () => {
    const scores = calcChronosScores([]);
    expect(scores.cIM).toBe(100); // 100 - 0*100
    expect(scores.totalTrials).toBe(0);
  });
});
