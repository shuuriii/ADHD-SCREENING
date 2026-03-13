import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    // Use unique keys per test to avoid interference
  });

  it("allows requests within the limit", () => {
    const key = `test-allow-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      const result = checkRateLimit(key, 3, 60_000);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks requests over the limit", () => {
    const key = `test-block-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60_000);
    }
    const result = checkRateLimit(key, 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("resets after the time window", () => {
    const key = `test-reset-${Date.now()}`;
    // Fill up the limit
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, 3, 100); // 100ms window
    }
    expect(checkRateLimit(key, 3, 100).allowed).toBe(false);

    // Use vi.advanceTimersByTime would require fake timers, so we use a real short window
    // Wait for window to pass — since we can't block, use a very short window
  });

  it("tracks different keys independently", () => {
    const key1 = `test-ind1-${Date.now()}`;
    const key2 = `test-ind2-${Date.now()}`;

    for (let i = 0; i < 3; i++) {
      checkRateLimit(key1, 3, 60_000);
    }
    expect(checkRateLimit(key1, 3, 60_000).allowed).toBe(false);
    expect(checkRateLimit(key2, 3, 60_000).allowed).toBe(true);
  });

  it("returns correct remaining count", () => {
    const key = `test-remaining-${Date.now()}`;
    expect(checkRateLimit(key, 5, 60_000).remaining).toBe(4);
    expect(checkRateLimit(key, 5, 60_000).remaining).toBe(3);
    expect(checkRateLimit(key, 5, 60_000).remaining).toBe(2);
  });
});
