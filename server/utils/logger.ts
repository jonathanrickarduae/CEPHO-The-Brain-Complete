/**
 * Centralized Logging Utility
 *
 * In development: logs to console with colour and context.
 * In production: logs to console AND ships structured JSON logs to
 * BetterStack (Logtail) when LOGTAIL_SOURCE_TOKEN is set.
 *
 * Set LOGTAIL_SOURCE_TOKEN in the Render dashboard to activate
 * centralised log shipping.
 */

import { Logtail } from "@logtail/node";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

// Accept any value as context — the logger handles serialisation internally
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogContext = any;

class Logger {
  private isDevelopment = process.env.NODE_ENV !== "production";
  private minLevel: LogLevel = this.isDevelopment
    ? LogLevel.DEBUG
    : LogLevel.INFO;
  private logtail: Logtail | null = null;

  constructor() {
    const token = process.env.LOGTAIL_SOURCE_TOKEN;
    if (token) {
      this.logtail = new Logtail(token);
    } else if (!this.isDevelopment) {
      console.warn(
        "[Logger] LOGTAIL_SOURCE_TOKEN is not set — centralised log shipping is DISABLED. " +
          "Set LOGTAIL_SOURCE_TOKEN in the Render dashboard to activate BetterStack log shipping."
      );
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
    ];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    let contextStr = "";
    if (context !== undefined && context !== null) {
      contextStr =
        typeof context === "object"
          ? ` ${JSON.stringify(context)}`
          : ` ${context}`;
    }
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  private ship(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.logtail) return;
    const meta =
      context !== undefined && context !== null
        ? typeof context === "object"
          ? context
          : { context }
        : {};
    switch (level) {
      case LogLevel.DEBUG:
        void this.logtail.debug(message, meta);
        break;
      case LogLevel.INFO:
        void this.logtail.info(message, meta);
        break;
      case LogLevel.WARN:
        void this.logtail.warn(message, meta);
        break;
      case LogLevel.ERROR:
        void this.logtail.error(message, meta);
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
      this.ship(LogLevel.DEBUG, message, context);
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, context));
      this.ship(LogLevel.INFO, message, context);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
      this.ship(LogLevel.WARN, message, context);
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext =
        error instanceof Error
          ? {
              ...(typeof context === "object" ? context : { context }),
              error: error.message,
              stack: error.stack,
            }
          : { ...(typeof context === "object" ? context : { context }), error };
      console.error(this.formatMessage(LogLevel.ERROR, message, errorContext));
      this.ship(LogLevel.ERROR, message, errorContext);
    }
  }

  /** Flush all pending log entries before process shutdown */
  async flush(): Promise<void> {
    if (this.logtail) {
      await this.logtail.flush();
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
