/**
 * Cache Service
 * 
 * Provides a simple caching interface with Redis backend
 */

import * as redisCache from './redis-cache';

/**
 * Cache wrapper with automatic key prefixing
 */
export class CacheService {
  private prefix: string;

  constructor(prefix: string = 'cepho') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    return redisCache.get<T>(this.getKey(key));
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    return redisCache.set(this.getKey(key), value, ttl);
  }

  async del(key: string): Promise<void> {
    return redisCache.del(this.getKey(key));
  }

  async delPattern(pattern: string): Promise<void> {
    return redisCache.delPattern(this.getKey(pattern));
  }

  /**
   * Cache wrapper for functions
   * 
   * @param key - Cache key
   * @param fn - Function to execute if cache miss
   * @param ttl - Time to live in seconds
   */
  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }
}

// Default cache instance
export const cache = new CacheService();

// Export Redis functions for direct use
export * from './redis-cache';
