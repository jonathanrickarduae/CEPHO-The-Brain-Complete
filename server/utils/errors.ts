/**
 * Centralized Error Handling
 * 
 * Provides type-safe, structured error classes for consistent error handling
 * across the CEPHO platform.
 */

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Database
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD = 'DUPLICATE_RECORD',
  
  // External Services
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Business Logic
  OPERATION_FAILED = 'OPERATION_FAILED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: unknown;
  cause?: Error;
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly cause?: Error;
  public readonly timestamp: Date;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: unknown,
    cause?: Error
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.cause = cause;
    this.timestamp = new Date();

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Authentication/Authorization errors (401, 403)
 */
export class AuthError extends AppError {
  constructor(
    code: ErrorCode = ErrorCode.UNAUTHORIZED,
    message: string = 'Authentication required',
    details?: unknown,
    cause?: Error
  ) {
    const statusCode = code === ErrorCode.FORBIDDEN ? 403 : 401;
    super(code, message, statusCode, details, cause);
    this.name = 'AuthError';
  }
}

/**
 * Validation errors (400)
 */
export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed',
    details?: unknown,
    cause?: Error
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details, cause);
    this.name = 'ValidationError';
  }
}

/**
 * Not found errors (404)
 */
export class NotFoundError extends AppError {
  constructor(
    resource: string = 'Resource',
    details?: unknown,
    cause?: Error
  ) {
    super(
      ErrorCode.RECORD_NOT_FOUND,
      `${resource} not found`,
      404,
      details,
      cause
    );
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict errors (409)
 */
export class ConflictError extends AppError {
  constructor(
    message: string = 'Resource conflict',
    details?: unknown,
    cause?: Error
  ) {
    super(ErrorCode.RESOURCE_CONFLICT, message, 409, details, cause);
    this.name = 'ConflictError';
  }
}

/**
 * External service errors (502, 503)
 */
export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message: string = 'External service error',
    details?: unknown,
    cause?: Error
  ) {
    super(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      `${service}: ${message}`,
      502,
      details,
      cause
    );
    this.name = 'ExternalServiceError';
  }
}

/**
 * Database errors (500)
 */
export class DatabaseError extends AppError {
  constructor(
    message: string = 'Database operation failed',
    details?: unknown,
    cause?: Error
  ) {
    super(ErrorCode.DATABASE_ERROR, message, 500, details, cause);
    this.name = 'DatabaseError';
  }
}

/**
 * Rate limiting errors (429)
 */
export class RateLimitError extends AppError {
  constructor(
    message: string = 'Rate limit exceeded',
    details?: unknown,
    cause?: Error
  ) {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429, details, cause);
    this.name = 'RateLimitError';
  }
}

/**
 * Helper function to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Helper function to convert unknown errors to AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      ErrorCode.INTERNAL_ERROR,
      error.message,
      500,
      undefined,
      error
    );
  }

  return new AppError(
    ErrorCode.INTERNAL_ERROR,
    'An unknown error occurred',
    500,
    { originalError: error }
  );
}

/**
 * Error handler middleware helper
 */
export function formatErrorResponse(error: AppError) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    },
  };
}
