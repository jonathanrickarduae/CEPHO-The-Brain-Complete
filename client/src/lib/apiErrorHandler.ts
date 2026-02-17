import { TRPCClientError } from '@trpc/client';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  shouldRetry: (error, attempt) => {
    // Don't retry client errors (4xx) except rate limiting
    if (error instanceof TRPCClientError) {
      const code = error.data?.httpStatus;
      if (code === 429) return true; // Rate limited - retry
      if (code && code >= 400 && code < 500) return false; // Client error - don't retry
    }
    return attempt < 3;
  }
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === opts.maxRetries || !opts.shouldRetry(error, attempt)) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        opts.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        opts.maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof TRPCClientError) {
    // Handle specific TRPC error codes
    const code = error.data?.code;
    switch (code) {
      case 'UNAUTHORIZED':
        return 'Please sign in to continue.';
      case 'FORBIDDEN':
        return 'You do not have permission to perform this action.';
      case 'NOT_FOUND':
        return 'The requested resource was not found.';
      case 'TIMEOUT':
        return 'The request timed out. Please try again.';
      case 'TOO_MANY_REQUESTS':
        return 'Too many requests. Please wait a moment and try again.';
      case 'INTERNAL_SERVER_ERROR':
        return 'Something went wrong. Our team has been notified.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Unable to connect. Please check your internet connection.';
    }
    return error.message;
  }

  return 'An unexpected error occurred.';
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError')
    );
  }
  return false;
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof TRPCClientError) {
    return error.data?.code === 'UNAUTHORIZED' || error.data?.httpStatus === 401;
  }
  return false;
}

export function isRateLimitError(error: unknown): boolean {
  if (error instanceof TRPCClientError) {
    return error.data?.code === 'TOO_MANY_REQUESTS' || error.data?.httpStatus === 429;
  }
  return false;
}

// Hook for handling API errors with toast notifications
export function handleApiError(error: unknown, showToast?: (message: string) => void) {
  const message = getErrorMessage(error);
  
  if (showToast) {
    showToast(message);
  }
  
  // Log for debugging (but not auth errors which are expected)
  if (!isAuthError(error)) {
    console.error('[API Error]', error);
  }
  
  return message;
}
