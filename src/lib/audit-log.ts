/**
 * Structured audit logging for compliance (HIPAA 164.312(b), SOC 2 CC7.1).
 * Logs authentication events, data access, and data modification.
 *
 * In production, these logs are captured by Vercel's log drain
 * and can be shipped to Datadog/Splunk/etc.
 */

export type AuditEvent =
  | "auth.oauth_callback"
  | "auth.otp_sent"
  | "auth.otp_verified"
  | "auth.otp_failed"
  | "auth.signout"
  | "auth.rate_limited"
  | "data.session_saved"
  | "data.questionnaire_saved"
  | "data.game_score_saved"
  | "data.exported"
  | "data.deleted"
  | "data.cleanup"
  | "csrf.rejected";

interface AuditEntry {
  timestamp: string;
  event: AuditEvent;
  userId?: string | null;
  sessionId?: string | null;
  ip?: string;
  meta?: Record<string, unknown>;
}

/**
 * Write a structured audit log entry.
 * Uses JSON format for easy parsing by log aggregation services.
 */
export function audit(
  event: AuditEvent,
  opts: {
    userId?: string | null;
    sessionId?: string | null;
    ip?: string;
    meta?: Record<string, unknown>;
  } = {}
): void {
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    event,
    ...opts,
  };

  // Structured JSON log — picked up by Vercel log drain / stdout
  console.log(JSON.stringify({ audit: true, ...entry }));
}
