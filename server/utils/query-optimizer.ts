/**
 * Database Query Optimization Utilities
 * Provides helpers for efficient database queries
 * 
 * Priority 1 - PERF-03
 */

import { cacheService } from '../services/cache/redis-cache.service';

/**
 * Query optimization options
 */
export interface QueryOptions {
  cache?: boolean;
  cacheTTL?: number;
  cacheKey?: string;
  select?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Cached query wrapper
 * Automatically caches query results in Redis
 */
export async function cachedQuery<T>(
  queryFn: () => Promise<T>,
  cacheKey: string,
  ttl: number = 300 // 5 minutes default
): Promise<T> {
  return cacheService.getOrSet(cacheKey, queryFn, ttl);
}

/**
 * Batch query helper
 * Executes multiple queries in parallel
 */
export async function batchQuery<T>(
  queries: Array<() => Promise<T>>
): Promise<T[]> {
  return Promise.all(queries.map(q => q()));
}

/**
 * Paginated query helper
 * Returns paginated results with metadata
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function paginatedQuery<T>(
  queryFn: (limit: number, offset: number) => Promise<T[]>,
  countFn: () => Promise<number>,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResult<T>> {
  const offset = (page - 1) * pageSize;
  
  // Execute query and count in parallel
  const [data, total] = await Promise.all([
    queryFn(pageSize, offset),
    countFn()
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Query result transformer
 * Transforms database results efficiently
 */
export function transformResults<T, R>(
  results: T[],
  transformer: (item: T) => R
): R[] {
  return results.map(transformer);
}

/**
 * Selective field loader
 * Only loads specified fields from database
 */
export function selectFields<T extends Record<string, any>>(
  data: T,
  fields: string[]
): Partial<T> {
  const result: Partial<T> = {};
  for (const field of fields) {
    if (field in data) {
      result[field as keyof T] = data[field];
    }
  }
  return result;
}

/**
 * Query performance logger
 * Logs slow queries for optimization
 */
export async function logSlowQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  threshold: number = 1000 // 1 second
): Promise<T> {
  const start = Date.now();
  try {
    const result = await queryFn();
    const duration = Date.now() - start;
    
    if (duration > threshold) {
      console.warn(`[Query] Slow query detected: ${queryName} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[Query] Failed query: ${queryName} took ${duration}ms`, error);
    throw error;
  }
}

/**
 * Connection pool helper
 * Ensures efficient database connection usage
 */
export class QueryBatcher<T> {
  private queue: Array<() => Promise<T>> = [];
  private processing = false;
  private batchSize: number;
  private batchDelay: number;

  constructor(batchSize: number = 10, batchDelay: number = 50) {
    this.batchSize = batchSize;
    this.batchDelay = batchDelay;
  }

  async add(queryFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await queryFn();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });

      if (!this.processing) {
        this.processBatch();
      }
    });
  }

  private async processBatch() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      await Promise.all(batch.map(fn => fn().catch(err => console.error('Batch query error:', err))));
      
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.batchDelay));
      }
    }

    this.processing = false;
  }
}

/**
 * Index usage checker
 * Helps identify missing indexes
 */
export function generateIndexSuggestions(
  tableName: string,
  frequentFilters: string[],
  frequentSorts: string[]
): string[] {
  const suggestions: string[] = [];

  // Suggest indexes for frequent filters
  for (const filter of frequentFilters) {
    suggestions.push(`CREATE INDEX idx_${tableName}_${filter} ON ${tableName}(${filter});`);
  }

  // Suggest composite indexes for frequent filter + sort combinations
  for (const filter of frequentFilters) {
    for (const sort of frequentSorts) {
      if (filter !== sort) {
        suggestions.push(
          `CREATE INDEX idx_${tableName}_${filter}_${sort} ON ${tableName}(${filter}, ${sort});`
        );
      }
    }
  }

  return suggestions;
}
