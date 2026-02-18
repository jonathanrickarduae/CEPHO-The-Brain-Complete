/**
 * Comprehensive Error Handling Utility
 * Provides sanitized error responses and detailed logging
 */

import { TRPCError } from '@trpc/server';
import { logger } from './logger';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'INTERNAL_SERVER_ERROR',
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    super(
      `${resource}${id ? ` with id ${id}` : ''} not found`,
      'NOT_FOUND',
      404
    );
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'CONFLICT', 409, details);
    this.name = 'ConflictError';
  }
}

/**
 * Sanitize error for client response
 * Prevents leaking internal details in production
 */
export function sanitizeError(error: unknown): {
  message: string;
  code: string;
  details?: any;
} {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Handle known AppError types
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      details: isDevelopment ? error.details : undefined,
    };
  }

  // Handle database errors
  if (error instanceof Error) {
    if (error.message.includes('duplicate key')) {
      return {
        message: 'Resource already exists',
        code: 'DUPLICATE_ENTRY',
      };
    }

    if (error.message.includes('foreign key constraint')) {
      return {
        message: 'Referenced resource not found',
        code: 'INVALID_REFERENCE',
      };
    }

    if (error.message.includes('violates check constraint')) {
      return {
        message: 'Invalid data provided',
        code: 'CONSTRAINT_VIOLATION',
      };
    }
  }

  // Generic error - don't leak details in production
  return {
    message: isDevelopment && error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred',
    code: 'INTERNAL_SERVER_ERROR',
    details: isDevelopment ? error : undefined,
  };
}

/**
 * Handle errors in tRPC procedures
 */
export function handleTRPCError(error: unknown, context?: string): never {
  const log = logger.module(context || 'API');

  // Log the full error for debugging
  log.error('Request failed', error);

  // Sanitize for client
  const sanitized = sanitizeError(error);

  // Map to tRPC error codes
  let trpcCode: 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'INTERNAL_SERVER_ERROR' = 'INTERNAL_SERVER_ERROR';

  if (error instanceof ValidationError) {
    trpcCode = 'BAD_REQUEST';
  } else if (error instanceof UnauthorizedError) {
    trpcCode = 'UNAUTHORIZED';
  } else if (error instanceof ForbiddenError) {
    trpcCode = 'FORBIDDEN';
  } else if (error instanceof NotFoundError) {
    trpcCode = 'NOT_FOUND';
  } else if (error instanceof ConflictError) {
    trpcCode = 'CONFLICT';
  }

  throw new TRPCError({
    code: trpcCode,
    message: sanitized.message,
    cause: sanitized.details,
  });
}

/**
 * Async error wrapper for services
 */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleTRPCError(error, context);
    }
  }) as T;
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, any>,
  fields: string[]
): void {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(', ')}`,
      { missing }
    );
  }
}

/**
 * Assert resource exists
 */
export function assertExists<T>(
  resource: T | null | undefined,
  resourceName: string,
  id?: string | number
): asserts resource is T {
  if (!resource) {
    throw new NotFoundError(resourceName, id);
  }
}

/**
 * Assert user has permission
 */
export function assertPermission(
  condition: boolean,
  message: string = 'You do not have permission to perform this action'
): asserts condition {
  if (!condition) {
    throw new ForbiddenError(message);
  }
}
