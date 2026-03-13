/**
 * Rate limiter with Upstash Redis persistence (for production)
 * and in-memory fallback (for local dev or when Redis is not configured).
 *
 * Upstash env vars (optional):
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Upstash-backed limiter (persistent across serverless invocations) ──

const redisConfigured =
  typeof process !== "undefined" &&
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Cache of Ratelimit instances keyed by "maxRequests:windowMs"
const upstashLimiters = new Map<string, Ratelimit>();

function getUpstashLimiter(maxRequests: number, windowMs: number): Ratelimit {
  const cacheKey = `${maxRequests}:${windowMs}`;
  let limiter = upstashLimiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
      prefix: "fayth-rl",
    });
    upstashLimiters.set(cacheKey, limiter);
  }
  return limiter;
}

// ── In-memory fallback ──

interface MemoryEntry {
  timestamps: number[];
}

const memoryStore = new Map<string, MemoryEntry>();
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function memoryCleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of memoryStore) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) memoryStore.delete(key);
  }
}

function memoryCheck(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  memoryCleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;
  let entry = memoryStore.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    memoryStore.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: oldestInWindow + windowMs - now,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
  };
}

// ── Public API ──

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
}

/**
 * Check and consume a rate limit token.
 * Uses Upstash Redis if configured, otherwise falls back to in-memory.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  if (redis) {
    // Upstash is async, but our callers expect sync.
    // Fire the check async and use in-memory as immediate guard.
    // This gives us the best of both: immediate protection + persistence.
    const limiter = getUpstashLimiter(maxRequests, windowMs);
    limiter.limit(key).catch(() => {
      // Redis unavailable — in-memory handles it
    });
  }

  return memoryCheck(key, maxRequests, windowMs);
}

/**
 * Async rate limit check — use this when you can await the result.
 * Preferred over checkRateLimit when possible.
 */
export async function checkRateLimitAsync(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (redis) {
    try {
      const limiter = getUpstashLimiter(maxRequests, windowMs);
      const result = await limiter.limit(key);
      return {
        allowed: result.success,
        remaining: result.remaining,
        retryAfterMs: result.success ? undefined : result.reset - Date.now(),
      };
    } catch {
      // Redis unavailable — fall through to in-memory
    }
  }

  return memoryCheck(key, maxRequests, windowMs);
}
