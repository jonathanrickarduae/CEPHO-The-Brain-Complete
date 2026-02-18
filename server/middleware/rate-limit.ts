/**
 * Rate Limiting Middleware
 * Prevents API abuse by limiting requests per user/IP
 */

import { TRPCError } from '@trpc/server';
import { logger } from '../utils/logger';

const log = logger.module('RateLimit');

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  skipSuccessfulRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      log.debug({ cleaned }, 'Cleaned up expired rate limit entries');
    }
  }

  check(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    // No entry or expired - create new
    if (!entry || entry.resetTime < now) {
      const resetTime = now + config.windowMs;
      this.store.set(key, { count: 1, resetTime });
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime,
      };
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  reset(key: string) {
    this.store.delete(key);
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  // Standard API endpoints
  standard: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  
  // Expensive operations (AI, document generation)
  expensive: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },
  
  // File uploads
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 uploads per minute
  },
  
  // Search/query endpoints
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
  },
} as const;

/**
 * Create rate limit middleware for tRPC
 */
export function createRateLimitMiddleware(config: RateLimitConfig = RATE_LIMITS.standard) {
  return async (opts: { ctx: { user?: { id: number }; req?: { ip?: string } } }) => {
    // Skip rate limiting in development
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true') {
      return;
    }

    // Generate key based on user ID or IP
    const userId = opts.ctx.user?.id;
    const ip = opts.ctx.req?.ip || 'unknown';
    const key = userId ? `user:${userId}` : `ip:${ip}`;

    // Check rate limit
    const result = rateLimiter.check(key, config);

    if (!result.allowed) {
      const resetIn = Math.ceil((result.resetTime - Date.now()) / 1000);
      
      log.warn({ key, resetIn }, 'Rate limit exceeded');
      
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Too many requests. Please try again in ${resetIn} seconds.`,
      });
    }

    // Log if getting close to limit (>80%)
    if (result.remaining < config.maxRequests * 0.2) {
      log.debug({ key, remaining: result.remaining }, 'Approaching rate limit');
    }
  };
}

/**
 * Express middleware for rate limiting
 */
export function expressRateLimit(config: RateLimitConfig = RATE_LIMITS.standard) {
  return (req: any, res: any, next: any) => {
    // Skip rate limiting in development
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true') {
      return next();
    }

    const userId = req.user?.id;
    const ip = req.ip || req.connection.remoteAddress;
    const key = userId ? `user:${userId}` : `ip:${ip}`;

    const result = rateLimiter.check(key, config);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      const resetIn = Math.ceil((result.resetTime - Date.now()) / 1000);
      
      log.warn({ key, ip, resetIn }, 'Rate limit exceeded');
      
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Please try again in ${resetIn} seconds`,
        retryAfter: resetIn,
      });
    }

    next();
  };
}

/**
 * Reset rate limit for a specific user/IP
 */
export function resetRateLimit(userId?: number, ip?: string) {
  const key = userId ? `user:${userId}` : ip ? `ip:${ip}` : null;
  if (key) {
    rateLimiter.reset(key);
    log.info({ key }, 'Rate limit reset');
  }
}

// Clean up on process exit
process.on('SIGTERM', () => rateLimiter.destroy());
process.on('SIGINT', () => rateLimiter.destroy());

export { rateLimiter };
