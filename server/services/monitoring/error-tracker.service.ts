import * as Sentry from "@sentry/node";
import {
  httpIntegration,
  expressIntegration,
  setupExpressErrorHandler,
} from "@sentry/node";
import type { Express, Request, Response, NextFunction } from "express";

/**
 * Error Tracking Service using Sentry v10
 * Catches and reports production errors for debugging
 */

class ErrorTrackerService {
  private initialized: boolean = false;

  /**
   * Initialize Sentry error tracking
   */
  initialize(app: Express) {
    const sentryDsn = process.env.SENTRY_DSN;

    if (!sentryDsn) {
      return;
    }

    try {
      Sentry.init({
        dsn: sentryDsn,
        environment: process.env.NODE_ENV || "development",
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

        // Performance monitoring - Sentry v10 API
        integrations: [httpIntegration(), expressIntegration()],

        // Ignore common errors
        ignoreErrors: [
          "Non-Error exception captured",
          "Non-Error promise rejection captured",
        ],

        // Before send hook to filter sensitive data
        beforeSend(event, _hint) {
          if (event.request) {
            delete event.request.cookies;
            if (event.request.headers) {
              delete (event.request.headers as Record<string, unknown>)
                .authorization;
              delete (event.request.headers as Record<string, unknown>).cookie;
            }
          }
          return event;
        },
      });

      // Setup express error handler (Sentry v10 API)
      setupExpressErrorHandler(app);

      this.initialized = true;
    } catch (_error) {}
  }

  /**
   * Error handler middleware (must be added after all routes)
   */
  errorHandler() {
    return (err: Error, req: Request, res: Response, next: NextFunction) => {
      Sentry.captureException(err);
      next(err);
    };
  }

  /**
   * Capture exception manually
   */
  captureException(error: Error, context?: Record<string, unknown>) {
    if (!this.initialized) {
      console.error("Error (Sentry not initialized):", error);
      return;
    }
    Sentry.captureException(error, {
      extra: context,
    });
  }

  /**
   * Capture message
   */
  captureMessage(
    message: string,
    level: Sentry.SeverityLevel = "info",
    context?: Record<string, unknown>
  ) {
    if (!this.initialized) {
      console.log(`Message (Sentry not initialized): ${message}`);
      return;
    }
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }

  /**
   * Set user context
   */
  setUser(user: { id: string; email?: string; username?: string }) {
    if (!this.initialized) return;
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }

  /**
   * Clear user context
   */
  clearUser() {
    if (!this.initialized) return;
    Sentry.setUser(null);
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(
    message: string,
    category: string,
    data?: Record<string, unknown>
  ) {
    if (!this.initialized) return;
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: "info",
    });
  }

  /**
   * Set custom context
   */
  setContext(key: string, context: Record<string, unknown>) {
    if (!this.initialized) return;
    Sentry.setContext(key, context);
  }

  /**
   * Set tag for filtering
   */
  setTag(key: string, value: string) {
    if (!this.initialized) return;
    Sentry.setTag(key, value);
  }

  /**
   * Start a span for performance monitoring (Sentry v10 API)
   */
  startSpan(name: string, op: string) {
    if (!this.initialized) return null;
    return Sentry.startInactiveSpan({ name, op });
  }

  /**
   * Flush events (useful before shutdown)
   */
  async flush(timeout: number = 2000): Promise<boolean> {
    if (!this.initialized) return true;
    try {
      return await Sentry.flush(timeout);
    } catch (_error) {
      return false;
    }
  }

  /**
   * Close Sentry connection
   */
  async close(timeout: number = 2000): Promise<boolean> {
    if (!this.initialized) return true;
    try {
      return await Sentry.close(timeout);
    } catch (_error) {
      return false;
    }
  }
}

// Export singleton instance
export const errorTrackerService = new ErrorTrackerService();

/**
 * Express error handler middleware
 */
export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  errorTrackerService.captureException(err, {
    url: req.url,
    method: req.method,
    userId: (req as Request & { user?: { id: number } }).user?.id,
  });

  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "An error occurred",
  });
}
