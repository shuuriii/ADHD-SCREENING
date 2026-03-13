/**
 * CSRF protection via Origin header verification.
 * Rejects cross-origin POST/DELETE requests that don't match the expected origin.
 */

const ALLOWED_ORIGINS = new Set([
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean) as string[]);

/** Allow any *.vercel.app subdomain (covers preview deployments) */
function isVercelOrigin(hostname: string): boolean {
  return hostname.endsWith(".vercel.app");
}

export function verifyCsrf(request: Request): { valid: boolean; error?: string } {
  const method = request.method.toUpperCase();

  // Only check state-changing methods
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { valid: true };
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // At least one must be present
  if (!origin && !referer) {
    return { valid: false, error: "Missing Origin/Referer header" };
  }

  // Derive the request's own hostname for same-origin comparison
  const requestHostname =
    request.headers.get("host")?.replace(/:\d+$/, "") ||
    new URL(request.url).hostname;

  // Check Origin header first (most reliable)
  if (origin) {
    if (ALLOWED_ORIGINS.has(origin)) return { valid: true };
    try {
      const originUrl = new URL(origin);
      if (originUrl.hostname === requestHostname) return { valid: true };
      if (isVercelOrigin(originUrl.hostname)) return { valid: true };
      for (const allowed of ALLOWED_ORIGINS) {
        const allowedUrl = new URL(allowed);
        if (originUrl.hostname === allowedUrl.hostname) return { valid: true };
      }
    } catch {
      // Invalid URL
    }
    return { valid: false, error: "Origin not allowed" };
  }

  // Fallback to Referer
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.hostname === requestHostname) return { valid: true };
      if (isVercelOrigin(refererUrl.hostname)) return { valid: true };
      for (const allowed of ALLOWED_ORIGINS) {
        const allowedUrl = new URL(allowed);
        if (refererUrl.hostname === allowedUrl.hostname) return { valid: true };
      }
    } catch {
      // Invalid URL
    }
    return { valid: false, error: "Referer not allowed" };
  }

  return { valid: false, error: "CSRF validation failed" };
}
