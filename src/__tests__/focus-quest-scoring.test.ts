import { describe, it, expect } from "vitest";
import { calcFocusQuestScores, type XTrialRecord, type AXTrialRecord } from "@/lib/focus-quest-scoring";

describe("calcFocusQuestScores", () => {
  function makeXTrials(goCount: number, nogoCount: number): XTrialRecord[] {
    const trials: XTrialRecord[] = [];
    for (let i = 0; i < goCount; i++) {
      trials.push({
        trial: i, stimulus: "green", isNogo: false,
        responded: true, rt: 400, correct: true,
      });
    }
    for (let i = 0; i < nogoCount; i++) {
      trials.push({
        trial: goCount + i, stimulus: "red", isNogo: true,
        responded: false, rt: -1, correct: true,
      });
    }
    return trials;
  }

  function makeAXTrials(): AXTrialRecord[] {
    // 10 AX trials (all correct), 5 BX, 5 AY, 5 BY
    const trials: AXTrialRecord[] = [];
    for (let i = 0; i < 10; i++) {
      trials.push({
        trial: i, prevStimulus: "A", stimulus: "X", trialType: "AX",
        responded: true, rt: 350, correct: true,
      });
    }
    for (let i = 0; i < 5; i++) {
      trials.push({
        trial: 10 + i, prevStimulus: "B", stimulus: "X", trialType: "BX",
        responded: false, rt: -1, correct: true,
      });
    }
    for (let i = 0; i < 5; i++) {
      trials.push({
        trial: 15 + i, prevStimulus: "A", stimulus: "Y", trialType: "AY",
        responded: false, rt: -1, correct: true,
      });
    }
    for (let i = 0; i < 5; i++) {
      trials.push({
        trial: 20 + i, prevStimulus: "B", stimulus: "Y", trialType: "BY",
        responded: false, rt: -1, correct: true,
      });
    }
    return trials;
  }

  it("returns high scores for perfect performance", () => {
    const xTrials = makeXTrials(40, 10);
    const axTrials = makeAXTrials();
    const scores = calcFocusQuestScores(xTrials, axTrials);

    expect(scores.cCPT_X).toBeGreaterThanOrEqual(80);
    expect(scores.cIA).toBeGreaterThanOrEqual(80);
    expect(scores.cHI).toBe(100);
    expect(scores.xHits).toBe(40);
    expect(scores.xFalseAlarms).toBe(0);
    expect(scores.totalTrials).toBe(75);
  });

  it("clamps all scores to 0-100", () => {
    // Terrible performance: all omissions on go, all false alarms on nogo
    const xTrials: XTrialRecord[] = [
      ...Array.from({ length: 20 }, (_, i) => ({
        trial: i, stimulus: "green", isNogo: false,
        responded: false, rt: -1, correct: false,
      } as XTrialRecord)),
      ...Array.from({ length: 10 }, (_, i) => ({
        trial: 20 + i, stimulus: "red", isNogo: true,
        responded: true, rt: 200, correct: false,
      } as XTrialRecord)),
    ];
    const axTrials: AXTrialRecord[] = [
      ...Array.from({ length: 5 }, (_, i) => ({
        trial: i, prevStimulus: "A", stimulus: "X", trialType: "AX" as const,
        responded: false, rt: -1, correct: false,
      })),
      ...Array.from({ length: 5 }, (_, i) => ({
        trial: 5 + i, prevStimulus: "B", stimulus: "X", trialType: "BX" as const,
        responded: true, rt: 200, correct: false,
      })),
    ];
    const scores = calcFocusQuestScores(xTrials, axTrials);

    expect(scores.cCPT_X).toBeGreaterThanOrEqual(0);
    expect(scores.cCPT_X).toBeLessThanOrEqual(100);
    expect(scores.cCPT_AX).toBeGreaterThanOrEqual(0);
    expect(scores.cCPT_AX).toBeLessThanOrEqual(100);
    expect(scores.cIA).toBeGreaterThanOrEqual(0);
    expect(scores.cIA).toBeLessThanOrEqual(100);
    expect(scores.cHI).toBeGreaterThanOrEqual(0);
    expect(scores.cHI).toBeLessThanOrEqual(100);
  });

  it("handles empty data", () => {
    const scores = calcFocusQuestScores([], []);
    expect(scores.totalTrials).toBe(0);
    expect(scores.cCPT_X).toBeGreaterThanOrEqual(0);
  });
});
