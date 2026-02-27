/**
 * Centralized Logging Utility
 * 
 * Provides structured logging with levels and context.
 * In production, can be extended to send logs to external services (Sentry, LogRocket, etc.)
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Accept any value as context - objects, strings, booleans, etc.
type LogContext = any;

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';
  private minLevel: LogLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    let contextStr = '';
    if (context !== undefined && context !== null) {
      contextStr = typeof context === 'object' ? ` ${JSON.stringify(context)}` : ` ${context}`;
    }
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = error instanceof Error
        ? { ...(typeof context === 'object' ? context : { context }), error: error.message, stack: error.stack }
        : { ...(typeof context === 'object' ? context : { context }), error };
      console.error(this.formatMessage(LogLevel.ERROR, message, errorContext));
    }
  }

  // Convenience method for logging with module context
  module(moduleName: string) {
    return {
      debug: (message: string, context?: LogContext) =>
        this.debug(`[${moduleName}] ${message}`, context),
      info: (message: string, context?: LogContext) =>
        this.info(`[${moduleName}] ${message}`, context),
      warn: (message: string, context?: LogContext) =>
        this.warn(`[${moduleName}] ${message}`, context),
      error: (message: string, error?: Error | unknown, context?: LogContext) =>
        this.error(`[${moduleName}] ${message}`, error, context),
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = logger;
