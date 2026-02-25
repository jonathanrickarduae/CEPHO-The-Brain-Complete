import * as Sentry from '@sentry/node';
import type { Express, Request, Response, NextFunction } from 'express';

/**
 * Error Tracking Service using Sentry
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
      console.warn('Sentry DSN not configured. Error tracking disabled.');
      return;
    }

    try {
      Sentry.init({
        dsn: sentryDsn,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        
        // Performance monitoring
        integrations: [
          // HTTP integration
          new Sentry.Integrations.Http({ tracing: true }),
          // Express integration
          new Sentry.Integrations.Express({ app }),
        ],

        // Ignore common errors
        ignoreErrors: [
          'Non-Error exception captured',
          'Non-Error promise rejection captured',
        ],

        // Before send hook to filter sensitive data
        beforeSend(event, hint) {
          // Remove sensitive data from error context
          if (event.request) {
            delete event.request.cookies;
            if (event.request.headers) {
              delete event.request.headers.authorization;
              delete event.request.headers.cookie;
            }
          }
          return event;
        },
      });

      // Request handler must be the first middleware
      app.use(Sentry.Handlers.requestHandler());

      // TracingHandler creates a trace for every incoming request
      app.use(Sentry.Handlers.tracingHandler());

      this.initialized = true;
      console.log('✅ Sentry error tracking initialized');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Error handler middleware (must be added after all routes)
   */
  errorHandler() {
    return Sentry.Handlers.errorHandler({
      shouldHandleError(error) {
        // Capture all errors with status code >= 500
        return true;
      },
    });
  }

  /**
   * Capture exception manually
   */
  captureException(error: Error, context?: Record<string, any>) {
    if (!this.initialized) {
      console.error('Error (Sentry not initialized):', error);
      return;
    }

    Sentry.captureException(error, {
      extra: context,
    });
  }

  /**
   * Capture message
   */
  captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
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
  addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
    if (!this.initialized) return;

    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  }

  /**
   * Set custom context
   */
  setContext(key: string, context: Record<string, any>) {
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
   * Start transaction for performance monitoring
   */
  startTransaction(name: string, op: string) {
    if (!this.initialized) return null;

    return Sentry.startTransaction({
      name,
      op,
    });
  }

  /**
   * Flush events (useful before shutdown)
   */
  async flush(timeout: number = 2000): Promise<boolean> {
    if (!this.initialized) return true;

    try {
      return await Sentry.flush(timeout);
    } catch (error) {
      console.error('Sentry flush error:', error);
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
    } catch (error) {
      console.error('Sentry close error:', error);
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
  next: NextFunction
) {
  // Log error
  console.error('Error:', err);

  // Capture in Sentry
  errorTrackerService.captureException(err, {
    url: req.url,
    method: req.method,
    userId: (req as any).user?.id,
  });

  // Send error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
}
