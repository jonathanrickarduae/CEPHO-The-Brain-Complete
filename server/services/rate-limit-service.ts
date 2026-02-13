/**
 * Rate Limiting Service
 * Prevents abuse and manages API quotas for AI requests
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

class RateLimitService {
  private limits: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  // Default rate limits
  private defaultLimits: Record<string, RateLimitConfig> = {
    'ai-chat': { maxRequests: 100, windowSeconds: 3600 }, // 100 requests per hour
    'ai-generation': { maxRequests: 50, windowSeconds: 3600 }, // 50 generations per hour
    'api-general': { maxRequests: 1000, windowSeconds: 3600 }, // 1000 API calls per hour
  };

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed under rate limit
   * Returns true if allowed, false if rate limit exceeded
   */
  checkLimit(
    key: string,
    limitType: string = 'api-general'
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const config = this.defaultLimits[limitType] || this.defaultLimits['api-general'];
    const now = Date.now();
    const limitKey = `${limitType}:${key}`;

    let entry = this.limits.get(limitKey);

    // Create new entry if doesn't exist or expired
    if (!entry || now > entry.resetAt) {
      entry = {
        count: 0,
        resetAt: now + (config.windowSeconds * 1000)
      };
      this.limits.set(limitKey, entry);
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt
      };
    }

    // Increment count
    entry.count++;

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt
    };
  }

  /**
   * Get current usage for a key
   */
  getUsage(key: string, limitType: string = 'api-general'): {
    count: number;
    limit: number;
    remaining: number;
    resetAt: number;
  } {
    const config = this.defaultLimits[limitType] || this.defaultLimits['api-general'];
    const limitKey = `${limitType}:${key}`;
    const entry = this.limits.get(limitKey);

    if (!entry || Date.now() > entry.resetAt) {
      return {
        count: 0,
        limit: config.maxRequests,
        remaining: config.maxRequests,
        resetAt: Date.now() + (config.windowSeconds * 1000)
      };
    }

    return {
      count: entry.count,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetAt: entry.resetAt
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string, limitType: string = 'api-general'): void {
    const limitKey = `${limitType}:${key}`;
    this.limits.delete(limitKey);
  }

  /**
   * Update rate limit configuration
   */
  setLimit(limitType: string, maxRequests: number, windowSeconds: number): void {
    this.defaultLimits[limitType] = { maxRequests, windowSeconds };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.limits.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`[RateLimit] Cleaned up ${expiredKeys.length} expired entries`);
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalKeys: number;
    activeKeys: number;
    limits: Record<string, RateLimitConfig>;
  } {
    const now = Date.now();
    let activeKeys = 0;

    for (const entry of this.limits.values()) {
      if (now <= entry.resetAt) {
        activeKeys++;
      }
    }

    return {
      totalKeys: this.limits.size,
      activeKeys,
      limits: this.defaultLimits
    };
  }

  /**
   * Shutdown rate limit service
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.limits.clear();
  }
}

// Singleton instance
const rateLimitService = new RateLimitService();

export default rateLimitService;
export { RateLimitService };
