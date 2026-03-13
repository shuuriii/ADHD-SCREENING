import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the env before importing
vi.stubEnv("OTP_SECRET", "test-secret-for-unit-tests-32bytes!!");

import { generateOtp, hashOtp, buildOtpCookie, verifyOtp } from "@/lib/otp";

describe("OTP", () => {
  describe("generateOtp", () => {
    it("returns a 6-digit string", () => {
      const code = generateOtp();
      expect(code).toMatch(/^\d{6}$/);
    });

    it("generates different codes on successive calls", () => {
      const codes = new Set(Array.from({ length: 10 }, () => generateOtp()));
      // At least some should be different (extremely unlikely all 10 are the same)
      expect(codes.size).toBeGreaterThan(1);
    });
  });

  describe("hashOtp", () => {
    it("returns a hex string", () => {
      const hash = hashOtp("123456");
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("is deterministic for same input", () => {
      expect(hashOtp("123456")).toBe(hashOtp("123456"));
    });

    it("produces different hashes for different inputs", () => {
      expect(hashOtp("123456")).not.toBe(hashOtp("654321"));
    });
  });

  describe("buildOtpCookie", () => {
    it("returns hash|expiry format", () => {
      const cookie = buildOtpCookie("123456");
      const [hash, expiry] = cookie.split("|");
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
      expect(Number(expiry)).toBeGreaterThan(Date.now());
    });
  });

  describe("verifyOtp", () => {
    it("accepts correct code within TTL", () => {
      const code = "123456";
      const cookie = buildOtpCookie(code);
      const result = verifyOtp(code, cookie);
      expect(result).toEqual({ valid: true });
    });

    it("rejects incorrect code", () => {
      const cookie = buildOtpCookie("123456");
      const result = verifyOtp("000000", cookie);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Incorrect code");
    });

    it("rejects expired OTP", () => {
      const hash = hashOtp("123456");
      const expiredCookie = `${hash}|${Date.now() - 1000}`;
      const result = verifyOtp("123456", expiredCookie);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("OTP expired");
    });

    it("rejects malformed cookie value", () => {
      const result = verifyOtp("123456", "malformed");
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Invalid OTP data");
    });
  });
});
