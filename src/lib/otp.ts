import { createHmac, randomInt } from "crypto";

const OTP_SECRET = process.env.OTP_SECRET || "fayth-otp-default-secret";
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Generate a 6-digit OTP code */
export function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

/** HMAC-hash an OTP so we never store plaintext in cookies */
export function hashOtp(code: string): string {
  return createHmac("sha256", OTP_SECRET).update(code).digest("hex");
}

/** Build the cookie value: hash|expiry */
export function buildOtpCookie(code: string): string {
  const hash = hashOtp(code);
  const expires = Date.now() + OTP_TTL_MS;
  return `${hash}|${expires}`;
}

/** Verify a submitted code against the stored cookie value */
export function verifyOtp(
  code: string,
  cookieValue: string
): { valid: boolean; reason?: string } {
  const [storedHash, expiresStr] = cookieValue.split("|");
  if (!storedHash || !expiresStr) return { valid: false, reason: "Invalid OTP data" };

  if (Date.now() > Number(expiresStr)) return { valid: false, reason: "OTP expired" };

  const inputHash = hashOtp(code);
  if (inputHash !== storedHash) return { valid: false, reason: "Incorrect code" };

  return { valid: true };
}
