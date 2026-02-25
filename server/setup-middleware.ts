import type { Express } from 'express';
import express from 'express';
import { globalRateLimiter, authRateLimiter } from './middleware/rate-limiter';
import { configureSecurityHeaders } from './middleware/security-headers';
import { applySanitizationMiddleware } from './middleware/input-sanitizer';
import { errorTrackerService, errorHandlerMiddleware } from './services/monitoring/error-tracker.service';
import { httpLoggerMiddleware, requestIdMiddleware } from './services/monitoring/logger.service';
import { cacheService } from './services/cache/redis-cache.service';
import healthRouter from './routers/health.router';

/**
 * Setup all middleware for the Express application
 * Priority 1 (Critical) improvements: Security & Performance
 */
export async function setupMiddleware(app: Express) {
  console.log('[Middleware] Setting up security and performance middleware...');

  // 1. Request ID tracking (must be first for logging)
  app.use(requestIdMiddleware);

  // 2. HTTP request logging
  app.use(httpLoggerMiddleware);

  // 3. Initialize error tracking (Sentry)
  if (process.env.SENTRY_DSN) {
    errorTrackerService.initialize(app);
    console.log('[Middleware] ✅ Error tracking initialized');
  } else {
    console.log('[Middleware] ⚠️  Sentry DSN not configured, error tracking disabled');
  }

  // 4. Security headers (Helmet.js)
  configureSecurityHeaders(app);
  console.log('[Middleware] ✅ Security headers configured');

  // 5. Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 6. Input sanitization (XSS prevention)
  applySanitizationMiddleware(app);
  console.log('[Middleware] ✅ Input sanitization enabled');

  // 7. Rate limiting
  // Apply global rate limiter to all routes
  app.use(globalRateLimiter);
  console.log('[Middleware] ✅ Global rate limiting enabled (100 req/15min)');

  // Apply strict rate limiter to auth routes
  app.use('/api/auth', authRateLimiter);
  app.use('/api/login', authRateLimiter);
  app.use('/api/register', authRateLimiter);
  console.log('[Middleware] ✅ Auth rate limiting enabled (5 req/15min)');

  // 8. Initialize Redis cache
  try {
    await cacheService.connect();
    const stats = await cacheService.getStats();
    if (stats.connected) {
      console.log('[Middleware] ✅ Redis cache connected');
    } else {
      console.log('[Middleware] ⚠️  Redis not configured, caching disabled');
    }
  } catch (error) {
    console.log('[Middleware] ⚠️  Redis connection failed, caching disabled');
  }

  // 9. Health check routes
  app.use(healthRouter);
  console.log('[Middleware] ✅ Health check endpoints registered');

  console.log('[Middleware] All middleware setup complete');
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

  console.log('[Middleware] ✅ Error handlers configured');
}

/**
 * Graceful shutdown handler
 */
export async function gracefulShutdown() {
  console.log('[Shutdown] Gracefully shutting down...');

  try {
    // Flush Sentry events
    if (process.env.SENTRY_DSN) {
      await errorTrackerService.flush(2000);
      await errorTrackerService.close(2000);
    }

    // Disconnect Redis
    await cacheService.disconnect();

    console.log('[Shutdown] Cleanup complete');
    process.exit(0);
  } catch (error) {
    console.error('[Shutdown] Error during cleanup:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
