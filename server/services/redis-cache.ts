import Redis from 'ioredis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

export class RedisCache {
  private client: Redis | null = null;
  private isConnected: boolean = false;
  private fallbackCache: Map<string, { value: string; expires: number }> = new Map();

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    
    if (redisUrl) {
      try {
        this.client = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            if (times > 3) {
              console.error('[Redis] Max retries reached, falling back to in-memory cache');
              return null;
            }
            return Math.min(times * 100, 3000);
          },
        });

        this.client.on('connect', () => {
          console.log('[Redis] Connected successfully');
          this.isConnected = true;
        });

        this.client.on('error', (error) => {
          console.error('[Redis] Connection error:', error.message);
          this.isConnected = false;
        });

        this.client.on('close', () => {
          console.log('[Redis] Connection closed');
          this.isConnected = false;
        });
      } catch (error: any) {
        console.error('[Redis] Failed to initialize:', error.message);
        this.client = null;
      }
    } else {
      console.warn('[Redis] No REDIS_URL provided, using in-memory cache');
    }
  }

  async get(key: string): Promise<string | null> {
    // Try Redis first
    if (this.client && this.isConnected) {
      try {
        const value = await this.client.get(key);
        if (value) {
          console.log(`[Redis] Cache HIT: ${key}`);
          return value;
        }
      } catch (error: any) {
        console.error(`[Redis] Get error for ${key}:`, error.message);
      }
    }

    // Fallback to in-memory cache
    const cached = this.fallbackCache.get(key);
    if (cached && cached.expires > Date.now()) {
      console.log(`[Redis] Fallback cache HIT: ${key}`);
      return cached.value;
    }

    // Clean up expired entry
    if (cached) {
      this.fallbackCache.delete(key);
    }

    console.log(`[Redis] Cache MISS: ${key}`);
    return null;
  }

  async set(key: string, value: string, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl || 3600; // Default 1 hour

    // Try Redis first
    if (this.client && this.isConnected) {
      try {
        await this.client.setex(key, ttl, value);
        console.log(`[Redis] Cached: ${key} (TTL: ${ttl}s)`);
        return;
      } catch (error: any) {
        console.error(`[Redis] Set error for ${key}:`, error.message);
      }
    }

    // Fallback to in-memory cache
    this.fallbackCache.set(key, {
      value,
      expires: Date.now() + (ttl * 1000),
    });
    console.log(`[Redis] Fallback cached: ${key} (TTL: ${ttl}s)`);
  }

  async delete(key: string): Promise<void> {
    // Try Redis first
    if (this.client && this.isConnected) {
      try {
        await this.client.del(key);
        console.log(`[Redis] Deleted: ${key}`);
      } catch (error: any) {
        console.error(`[Redis] Delete error for ${key}:`, error.message);
      }
    }

    // Also delete from fallback cache
    this.fallbackCache.delete(key);
  }

  async clear(pattern?: string): Promise<void> {
    // Clear Redis
    if (this.client && this.isConnected) {
      try {
        if (pattern) {
          const keys = await this.client.keys(pattern);
          if (keys.length > 0) {
            await this.client.del(...keys);
            console.log(`[Redis] Cleared ${keys.length} keys matching: ${pattern}`);
          }
        } else {
          await this.client.flushdb();
          console.log('[Redis] Cleared all keys');
        }
      } catch (error: any) {
        console.error('[Redis] Clear error:', error.message);
      }
    }

    // Clear fallback cache
    if (pattern) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      for (const key of this.fallbackCache.keys()) {
        if (regex.test(key)) {
          this.fallbackCache.delete(key);
        }
      }
    } else {
      this.fallbackCache.clear();
    }
  }

  async getStats(): Promise<{
    connected: boolean;
    type: 'redis' | 'memory';
    keys: number;
    memory?: string;
  }> {
    if (this.client && this.isConnected) {
      try {
        const info = await this.client.info('memory');
        const keys = await this.client.dbsize();
        const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
        
        return {
          connected: true,
          type: 'redis',
          keys,
          memory: memoryMatch ? memoryMatch[1] : undefined,
        };
      } catch (error: any) {
        console.error('[Redis] Stats error:', error.message);
      }
    }

    return {
      connected: false,
      type: 'memory',
      keys: this.fallbackCache.size,
    };
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      console.log('[Redis] Disconnected');
    }
  }
}

// Singleton instance
let redisCacheInstance: RedisCache | null = null;

export function getRedisCache(): RedisCache {
  if (!redisCacheInstance) {
    redisCacheInstance = new RedisCache();
  }
  return redisCacheInstance;
}
