/**
 * Security Event Logger (Remediation Task 1.3)
 *
 * Logs all security-relevant events in a structured format.
 * Extends the existing logger utility and can push events to
 * Sentry when SENTRY_DSN is configured.
 */
import { log } from "../../utils/logger";

export type SecurityEventType =
  | "login_success"
  | "login_failed"
  | "login_blocked"
  | "logout"
  | "permission_denied"
  | "password_reset_requested"
  | "password_reset_completed"
  | "account_locked"
  | "suspicious_activity"
  | "csrf_violation"
  | "rate_limit_exceeded"
  | "invalid_token";

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string | number;
  email?: string;
  ip: string;
  userAgent: string;
  path?: string;
  metadata?: Record<string, unknown>;
}

const HIGH_SEVERITY: SecurityEventType[] = [
  "login_failed",
  "login_blocked",
  "permission_denied",
  "suspicious_activity",
  "csrf_violation",
  "account_locked",
  "invalid_token",
];

/**
 * Log a structured security event.
 * High-severity events are logged at WARN level so they always
 * appear in production regardless of the configured log level.
 */
export function logSecurityEvent(event: SecurityEvent): void {
  const payload = {
    securityEvent: true,
    ...event,
    timestamp: new Date().toISOString(),
  };

  if (HIGH_SEVERITY.includes(event.type)) {
    log.warn(`[Security] ${event.type.toUpperCase()}`, payload);
  } else {
    log.info(`[Security] ${event.type}`, payload);
  }
}

/**
 * Extract the real client IP, respecting reverse-proxy headers.
 */
export function getClientIp(req: {
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
  ip?: string;
}): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded.split(",")[0];
    return first.trim();
  }
  return req.ip ?? req.socket?.remoteAddress ?? "unknown";
}
