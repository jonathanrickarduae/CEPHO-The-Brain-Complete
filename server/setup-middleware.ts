import type { Express } from "express";
import express from "express";
import { logger } from "./utils/logger";
import { globalRateLimiter, authRateLimiter } from "./middleware/rate-limiter";
import { configureSecurityHeaders } from "./middleware/security-headers";
import { applySanitizationMiddleware } from "./middleware/input-sanitizer";
import {
  errorTrackerService,
  errorHandlerMiddleware,
} from "./services/monitoring/error-tracker.service";
import {
  httpLoggerMiddleware,
  requestIdMiddleware,
} from "./services/monitoring/logger.service";
import { cacheService } from "./services/cache/redis-cache.service";
import healthRouter from "./routers/health.router";
import {
  csrfTokenMiddleware,
  csrfValidationMiddleware,
  csrfTokenHandler,
} from "./middleware/csrf-protection";
import {
  apmMiddleware,
  metricsHandler,
} from "./services/monitoring/apm.service";
import { apiAnalytics } from "./services/monitoring/api-analytics.service";

/**
 * Setup all middleware for the Express application
 * Priority 1 (Critical) improvements: Security & Performance
 */
export async function setupMiddleware(app: Express) {
  // 1. APM monitoring (must be very early)
  app.use(apmMiddleware);
  // 2. API usage analytics tracking
  app.use(apiAnalytics.trackRequest());
  // 3. Request ID tracking (must be first for logging)
  app.use(requestIdMiddleware);

  // 4. HTTP request logging
  app.use(httpLoggerMiddleware);

  // 5. Initialize error tracking (Sentry)
  if (process.env.SENTRY_DSN) {
    errorTrackerService.initialize(app);
  } else {
  }

  // 6. Security headers (Helmet.js)
  configureSecurityHeaders(app);
  // 7. Body parsing is handled in server/_core/index.ts
  // (Removed duplicate to avoid conflicts)

  // 8. Input sanitization (XSS prevention)
  applySanitizationMiddleware(app);
  // 9. CSRF protection
  app.use(csrfTokenMiddleware);
  app.get("/api/csrf-token", csrfTokenHandler);
  // 9. Rate limiting
  // Apply global rate limiter to all routes
  app.use(globalRateLimiter);

  // Apply strict rate limiter to auth routes
  app.use("/api/auth", authRateLimiter);
  app.use("/api/login", authRateLimiter);
  app.use("/api/register", authRateLimiter);

  // 10. CSRF validation (after rate limiting)
  app.use(csrfValidationMiddleware);

  // 11. Initialize Redis cache
  try {
    await cacheService.connect();
    const stats = await cacheService.getStats();
    if (stats.connected) {
    } else {
    }
  } catch (error) {
  }

  // 12. Metrics endpoint (before health checks)
  // Metrics endpoint - restricted to internal/localhost access only
  app.get("/api/metrics", (req, res, next) => {
    const ip = (req.headers["x-forwarded-for"] as string || req.socket?.remoteAddress || "").split(",")[0].trim();
    const isInternal = ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1" || ip.startsWith("10.") || ip.startsWith("172.") || ip.startsWith("192.168.");
    if (!isInternal) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  }, metricsHandler);
  // 13. Health check routes
  app.use(healthRouter);

  // 14. Client-side error logging endpoint
  // Receives structured error logs from the frontend ErrorBoundary and logger
  app.post("/api/client-log", (req, res) => {
    const entry = req.body;
    if (entry && entry.level === "ERROR") {
      logger.error(
        `[ClientLog] ${entry.message}`,
        new Error(entry.error?.message ?? "Unknown client error"),
        {
          boundary: entry.context?.boundary,
          componentStack: entry.context?.componentStack,
          timestamp: entry.timestamp,
          userAgent: req.headers["user-agent"],
        }
      );
    }
    res.status(204).end();
  });
}

/**
 * Setup error handlers (must be added after all routes)
 */
export function setupErrorHandlers(app: Express) {
  // Sentry error handler (must be before other error handlers)
  if (process.env.SENTRY_DSN) {
    app.use(errorTrackerService.errorHandler());
  }

  // Custom error handler
  app.use(errorHandlerMiddleware);
}

/**
 * Graceful shutdown handler
 */
export async function gracefulShutdown() {
  try {
    // Flush Sentry events
    if (process.env.SENTRY_DSN) {
      await errorTrackerService.flush(2000);
      await errorTrackerService.close(2000);
    }

    // Disconnect Redis
    await cacheService.disconnect();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

// Handle shutdown signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
