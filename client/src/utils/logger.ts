/**
 * Client-Side Logging Utility
 *
 * Provides structured, levelled logging for the frontend.
 * In production, errors are sent to the server for centralised logging.
 * In development, all levels are output to the browser console.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

type LogContext = Record<string, unknown> | string | number | boolean | null;

interface LogEntry {
  timestamp: string;
  level: keyof typeof LogLevel;
  message: string;
  context?: LogContext;
  error?: { message: string; stack?: string };
}

class ClientLogger {
  private readonly isDevelopment = import.meta.env.DEV;
  private readonly minLevel: LogLevel = import.meta.env.DEV
    ? LogLevel.DEBUG
    : LogLevel.WARN;

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private buildEntry(
    level: keyof typeof LogLevel,
    message: string,
    context?: LogContext,
    error?: Error | unknown
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    if (context !== undefined && context !== null) {
      entry.context = context;
    }
    if (error instanceof Error) {
      entry.error = { message: error.message, stack: error.stack };
    } else if (error !== undefined) {
      entry.error = { message: String(error) };
    }
    return entry;
  }

  private output(level: LogLevel, entry: LogEntry): void {
    if (!this.shouldLog(level)) return;
    const prefix = `[${entry.timestamp}] [${entry.level}]`;
    const args: unknown[] = [`${prefix} ${entry.message}`];
    if (entry.context) args.push(entry.context);
    if (entry.error) args.push(entry.error);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(...args);
        break;
      case LogLevel.INFO:
        console.info(...args);
        break;
      case LogLevel.WARN:
        console.warn(...args);
        break;
      case LogLevel.ERROR:
        console.error(...args);
        // In production, send errors to server for centralised logging
        if (!this.isDevelopment) {
          this.sendToServer(entry).catch(() => {
            // Silently ignore — do not cause infinite loops
          });
        }
        break;
    }
  }

  private async sendToServer(entry: LogEntry): Promise<void> {
    try {
      await fetch("/api/client-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
        // Use keepalive so the request survives page unloads
        keepalive: true,
      });
    } catch {
      // Swallow — logging must never break the app
    }
  }

  debug(message: string, context?: LogContext): void {
    this.output(LogLevel.DEBUG, this.buildEntry("DEBUG", message, context));
  }

  info(message: string, context?: LogContext): void {
    this.output(LogLevel.INFO, this.buildEntry("INFO", message, context));
  }

  warn(message: string, context?: LogContext): void {
    this.output(LogLevel.WARN, this.buildEntry("WARN", message, context));
  }

  error(
    message: string,
    error?: Error | unknown,
    context?: LogContext
  ): void {
    this.output(
      LogLevel.ERROR,
      this.buildEntry("ERROR", message, context, error)
    );
  }

  /** Create a scoped logger for a specific module/component */
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

export const logger = new ClientLogger();
export const log = logger;
