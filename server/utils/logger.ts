/**
 * Centralized Logging Utility
 * Simple console-based logger — no external dependencies required.
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

const colours: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "\x1b[36m",
  [LogLevel.INFO]: "\x1b[32m",
  [LogLevel.WARN]: "\x1b[33m",
  [LogLevel.ERROR]: "\x1b[31m",
};
const reset = "\x1b[0m";

function formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
  const ts = new Date().toISOString();
  const colour = colours[level] ?? "";
  const ctx = context ? ` ${JSON.stringify(context)}` : "";
  return `${colour}[${ts}] [${level}] ${message}${ctx}${reset}`;
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatMessage(LogLevel.DEBUG, message, context));
    }
  },
  info: (message: string, context?: Record<string, unknown>) => {
    console.info(formatMessage(LogLevel.INFO, message, context));
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(formatMessage(LogLevel.WARN, message, context));
  },
  error: (message: string, context?: Record<string, unknown>) => {
    console.error(formatMessage(LogLevel.ERROR, message, context));
  },
};

// Named export for compatibility with `import { log } from "../utils/logger"`
export const log = logger;

export default logger;
