import winston from "winston";
import path from "path";

/**
 * Structured Logging Service using Winston
 * Provides consistent logging across the application
 */

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

// Tell winston about our colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define console format (pretty for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    info => `${info.timestamp} [${info.level}]: ${info.message}`
  )
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: process.env.NODE_ENV === "production" ? format : consoleFormat,
  }),

  // Error log file
  new winston.transports.File({
    filename: path.join(process.cwd(), "logs", "error.log"),
    level: "error",
    format,
  }),

  // Combined log file
  new winston.transports.File({
    filename: path.join(process.cwd(), "logs", "combined.log"),
    format,
  }),
];

// Create the logger
const logger = winston.createLogger({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  levels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs", "exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs", "rejections.log"),
    }),
  ],
});

/**
 * Logger Service with structured logging
 */
class LoggerService {
  /**
   * Log error message
   */
  error(message: string, meta?: Record<string, any>) {
    logger.error(message, meta);
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: Record<string, any>) {
    logger.warn(message, meta);
  }

  /**
   * Log info message
   */
  info(message: string, meta?: Record<string, any>) {
    logger.info(message, meta);
  }

  /**
   * Log HTTP request
   */
  http(message: string, meta?: Record<string, any>) {
    logger.http(message, meta);
  }

  /**
   * Log debug message
   */
  debug(message: string, meta?: Record<string, any>) {
    logger.debug(message, meta);
  }

  /**
   * Log with custom level
   */
  log(level: string, message: string, meta?: Record<string, any>) {
    logger.log(level, message, meta);
  }

  /**
   * Create child logger with default metadata
   */
  child(defaultMeta: Record<string, any>) {
    return logger.child(defaultMeta);
  }

  /**
   * Get the underlying Winston logger
   */
  getLogger() {
    return logger;
  }
}

// Export singleton instance
export const loggerService = new LoggerService();

/**
 * Express middleware for logging HTTP requests
 */
export function httpLoggerMiddleware(req: any, res: any, next: any) {
  const start = Date.now();

  // Log request
  loggerService.http(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    userId: req.user?.id,
  });

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - start;
    loggerService.http(
      `${req.method} ${req.url} ${res.statusCode} ${duration}ms`,
      {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        userId: req.user?.id,
      }
    );
  });

  next();
}

/**
 * Request ID middleware for tracking requests
 */
export function requestIdMiddleware(req: any, res: any, next: any) {
  const requestId = req.headers["x-request-id"] || generateRequestId();
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Export logger instance directly for convenience
export default loggerService;
