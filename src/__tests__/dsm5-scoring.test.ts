import { describe, it, expect } from "vitest";
import { calculateDomainScore, determinePresentationType, getSeverity } from "@/questionnaire/scoring";
import type { LikertValue, DomainScore } from "@/questionnaire/types";

describe("getSeverity", () => {
  it("returns correct severity levels", () => {
    expect(getSeverity(75)).toBe("high");
    expect(getSeverity(100)).toBe("high");
    expect(getSeverity(50)).toBe("moderate");
    expect(getSeverity(74)).toBe("moderate");
    expect(getSeverity(25)).toBe("mild");
    expect(getSeverity(49)).toBe("mild");
    expect(getSeverity(0)).toBe("low");
    expect(getSeverity(24)).toBe("low");
  });
});

describe("calculateDomainScore", () => {
  it("counts clinical symptoms (>= 3) correctly", () => {
    const responses: Record<string, LikertValue> = {};
    // Domain A: Q1-Q15. Set 6 to "Often" (3), rest to "Never" (0)
    for (let i = 1; i <= 15; i++) {
      responses[`dsm5_a${i}`] = i <= 6 ? 3 : 0;
    }
    const score = calculateDomainScore(responses, "A");
    expect(score.clinicalCount).toBe(6);
    expect(score.meetsCriteria).toBe(true);
    expect(score.domain).toBe("A");
    expect(score.domainName).toBe("Inattention");
  });

  it("correctly identifies subthreshold (< 5 clinical)", () => {
    const responses: Record<string, LikertValue> = {};
    for (let i = 1; i <= 15; i++) {
      responses[`dsm5_a${i}`] = i <= 4 ? 3 : 0;
    }
    const score = calculateDomainScore(responses, "A");
    expect(score.clinicalCount).toBe(4);
    expect(score.meetsCriteria).toBe(false);
  });

  it("counts response >= 3 as clinical, < 3 as not", () => {
    const responses: Record<string, LikertValue> = {};
    for (let i = 1; i <= 15; i++) {
      responses[`dsm5_a${i}`] = 2; // "Sometimes" — not clinical
    }
    const score = calculateDomainScore(responses, "A");
    expect(score.clinicalCount).toBe(0);
    expect(score.totalScore).toBe(30);
  });

  it("computes percentage correctly", () => {
    const responses: Record<string, LikertValue> = {};
    for (let i = 1; i <= 15; i++) {
      responses[`dsm5_a${i}`] = 4; // max: 15 * 4 = 60
    }
    const score = calculateDomainScore(responses, "A");
    expect(score.percentage).toBe(100);
    expect(score.maxScore).toBe(60);
    expect(score.totalScore).toBe(60);
  });
});

describe("determinePresentationType", () => {
  function makeDomain(domain: "A" | "B", clinicalCount: number): DomainScore {
    return {
      domain,
      domainName: domain === "A" ? "Inattention" : "Hyperactivity/Impulsivity",
      clinicalCount,
      totalQuestions: 15,
      totalScore: clinicalCount * 3,
      maxScore: 60,
      percentage: Math.round((clinicalCount * 3 / 60) * 100),
      meetsCriteria: clinicalCount >= 5,
      severity: "moderate",
    };
  }

  it("returns combined when both domains >= 5", () => {
    const result = determinePresentationType(makeDomain("A", 7), makeDomain("B", 6));
    expect(result.type).toBe("combined");
  });

  it("returns inattentive when only domain A >= 5", () => {
    const result = determinePresentationType(makeDomain("A", 7), makeDomain("B", 3));
    expect(result.type).toBe("inattentive");
  });

  it("returns hyperactive when only domain B >= 5", () => {
    const result = determinePresentationType(makeDomain("A", 2), makeDomain("B", 8));
    expect(result.type).toBe("hyperactive");
  });

  it("returns subthreshold when both < 5", () => {
    const result = determinePresentationType(makeDomain("A", 3), makeDomain("B", 4));
    expect(result.type).toBe("subthreshold");
  });

  it("returns combined at exact threshold (5, 5)", () => {
    const result = determinePresentationType(makeDomain("A", 5), makeDomain("B", 5));
    expect(result.type).toBe("combined");
  });
});
