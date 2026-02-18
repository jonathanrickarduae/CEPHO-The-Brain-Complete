/**
 * Redis Cache Service
 * 
 * Provides caching functionality using Redis for improved performance
 */

import Redis from 'ioredis';
import { logger } from '../../utils/logger';
import { cacheHitRate } from '../../services/metrics/prometheus';

const log = logger.module('RedisCache');

let redis: Redis | null = null;

/**
 * Initialize Redis connection
 */
export function initRedis(): Redis | null {
  if (redis) {
    return redis;
  }

  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    log.warn('REDIS_URL not configured, caching disabled');
    return null;
  }

  try {
    redis = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redis.on('connect', () => {
      log.info('Redis connected');
    });

    redis.on('error', (error) => {
      log.error('Redis error:', error);
    });

    redis.on('close', () => {
      log.warn('Redis connection closed');
    });

    return redis;
  } catch (error) {
    log.error('Failed to initialize Redis:', error);
    return null;
  }
}

/**
 * Get value from cache
 * 
 * @param key - Cache key
 * @returns Cached value or null if not found
 */
export async function get<T>(key: string): Promise<T | null> {
  const client = initRedis();
  
  if (!client) {
    return null;
  }

  try {
    const value = await client.get(key);
    
    if (value) {
      cacheHitRate.inc({ operation: 'get', result: 'hit' });
      return JSON.parse(value) as T;
    } else {
      cacheHitRate.inc({ operation: 'get', result: 'miss' });
      return null;
    }
  } catch (error) {
    log.error(`Failed to get cache key ${key}:`, error);
    cacheHitRate.inc({ operation: 'get', result: 'error' });
    return null;
  }
}

/**
 * Set value in cache
 * 
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttl - Time to live in seconds (default: 1 hour)
 */
export async function set(key: string, value: any, ttl: number = 3600): Promise<void> {
  const client = initRedis();
  
  if (!client) {
    return;
  }

  try {
    await client.setex(key, ttl, JSON.stringify(value));
    cacheHitRate.inc({ operation: 'set', result: 'success' });
  } catch (error) {
    log.error(`Failed to set cache key ${key}:`, error);
    cacheHitRate.inc({ operation: 'set', result: 'error' });
  }
}

/**
 * Delete value from cache
 * 
 * @param key - Cache key
 */
export async function del(key: string): Promise<void> {
  const client = initRedis();
  
  if (!client) {
    return;
  }

  try {
    await client.del(key);
    cacheHitRate.inc({ operation: 'delete', result: 'success' });
  } catch (error) {
    log.error(`Failed to delete cache key ${key}:`, error);
    cacheHitRate.inc({ operation: 'delete', result: 'error' });
  }
}

/**
 * Delete multiple keys matching a pattern
 * 
 * @param pattern - Key pattern (e.g., 'user:*')
 */
export async function delPattern(pattern: string): Promise<void> {
  const client = initRedis();
  
  if (!client) {
    return;
  }

  try {
    const keys = await client.keys(pattern);
    
    if (keys.length > 0) {
      await client.del(...keys);
      cacheHitRate.inc({ operation: 'delete_pattern', result: 'success' });
      log.debug(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
    }
  } catch (error) {
    log.error(`Failed to delete keys matching pattern ${pattern}:`, error);
    cacheHitRate.inc({ operation: 'delete_pattern', result: 'error' });
  }
}

/**
 * Get or set value in cache (cache-aside pattern)
 * 
 * @param key - Cache key
 * @param fn - Function to execute if cache miss
 * @param ttl - Time to live in seconds (default: 1 hour)
 * @returns Cached or computed value
 */
export async function getOrSet<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // Try to get from cache
  const cached = await get<T>(key);
  
  if (cached !== null) {
    return cached;
  }

  // Cache miss - execute function
  const value = await fn();
  
  // Store in cache
  await set(key, value, ttl);
  
  return value;
}

/**
 * Close Redis connection
 */
export async function close(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    log.info('Redis connection closed');
  }
}

// Export Redis client for advanced usage
export function getRedisClient(): Redis | null {
  return initRedis();
}
