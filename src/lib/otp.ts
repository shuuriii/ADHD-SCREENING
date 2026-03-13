import { createHmac, randomInt, timingSafeEqual } from "crypto";

const OTP_SECRET = process.env.OTP_SECRET;
if (!OTP_SECRET) {
  console.warn("[OTP] OTP_SECRET is not set. OTP functionality will fail. Generate one with: openssl rand -base64 32");
}
const SECRET = OTP_SECRET || "MISSING_SECRET_WILL_FAIL";
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Generate a 6-digit OTP code */
export function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

/** HMAC-hash an OTP so we never store plaintext in cookies */
export function hashOtp(code: string): string {
  return createHmac("sha256", SECRET).update(code).digest("hex");
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
  const inputBuf = Buffer.from(inputHash, "hex");
  const storedBuf = Buffer.from(storedHash, "hex");
  if (
    inputBuf.length !== storedBuf.length ||
    !timingSafeEqual(inputBuf, storedBuf)
  ) {
    return { valid: false, reason: "Incorrect code" };
  }

  return { valid: true };
}

/** Build an identity-bound OTP verified token: HMAC(userId|expiry) */
export function buildVerifiedToken(userId: string): string {
  const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const payload = `${userId}|${expiry}`;
  const mac = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${mac}|${userId}|${expiry}`;
}

/** Verify the otp_verified cookie is bound to the current user */
export function verifyVerifiedToken(
  cookieValue: string,
  userId: string
): boolean {
  const parts = cookieValue.split("|");
  if (parts.length !== 3) return false;

  const [mac, storedUserId, expiresStr] = parts;
  if (storedUserId !== userId) return false;
  if (Date.now() > Number(expiresStr)) return false;

  const expectedPayload = `${storedUserId}|${expiresStr}`;
  const expectedMac = createHmac("sha256", SECRET).update(expectedPayload).digest("hex");

  const macBuf = Buffer.from(mac, "hex");
  const expectedBuf = Buffer.from(expectedMac, "hex");

  if (macBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(macBuf, expectedBuf);
}
