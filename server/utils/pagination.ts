/**
 * Pagination Utilities
 * 
 * Provides cursor-based and offset-based pagination for list endpoints.
 * Supports sorting, filtering, and metadata generation.
 * 
 * Priority 2 - API-02: Pagination for List Endpoints
 */

import { Request } from 'express';
import { logger } from './logger';

const log = logger.module('Pagination');

/**
 * Pagination parameters from request
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Cursor pagination info
 */
export interface CursorPaginationMeta {
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  prevCursor?: string;
  count: number;
}

/**
 * Cursor paginated response
 */
export interface CursorPaginatedResponse<T> {
  data: T[];
  meta: CursorPaginationMeta;
}

/**
 * Default pagination limits
 */
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
export const MIN_LIMIT = 1;

/**
 * Extract pagination parameters from request
 */
export function extractPaginationParams(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(MIN_LIMIT, parseInt(req.query.limit as string) || DEFAULT_LIMIT)
  );
  const cursor = req.query.cursor as string;
  const sort = req.query.sort as string || 'createdAt';
  const order = (req.query.order as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

  return { page, limit, cursor, sort, order };
}

/**
 * Calculate offset from page and limit
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Generate pagination metadata
 */
export function generatePaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNext,
    hasPrev
  };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    meta: generatePaginationMeta(total, page, limit)
  };
}

/**
 * Encode cursor (base64 encoding of timestamp + id)
 */
export function encodeCursor(timestamp: Date | string, id: string | number): string {
  const cursorData = {
    t: new Date(timestamp).getTime(),
    id: String(id)
  };
  return Buffer.from(JSON.stringify(cursorData)).toString('base64');
}

/**
 * Decode cursor
 */
export function decodeCursor(cursor: string): { timestamp: number; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const data = JSON.parse(decoded);
    return {
      timestamp: data.t,
      id: data.id
    };
  } catch (error) {
    log.error('Failed to decode cursor', { cursor, error });
    return null;
  }
}

/**
 * Generate cursor pagination metadata
 */
export function generateCursorPaginationMeta<T extends { id: any; createdAt?: any }>(
  data: T[],
  limit: number,
  sortField: keyof T = 'createdAt' as keyof T
): CursorPaginationMeta {
  const hasNext = data.length > limit;
  const items = hasNext ? data.slice(0, limit) : data;
  
  const meta: CursorPaginationMeta = {
    hasNext,
    hasPrev: false, // Will be determined by presence of cursor in request
    count: items.length
  };

  if (items.length > 0) {
    const lastItem = items[items.length - 1];
    const firstItem = items[0];
    
    if (hasNext) {
      meta.nextCursor = encodeCursor(
        lastItem[sortField] || new Date(),
        lastItem.id
      );
    }
    
    meta.prevCursor = encodeCursor(
      firstItem[sortField] || new Date(),
      firstItem.id
    );
  }

  return meta;
}

/**
 * Create cursor paginated response
 */
export function createCursorPaginatedResponse<T extends { id: any; createdAt?: any }>(
  data: T[],
  limit: number,
  sortField: keyof T = 'createdAt' as keyof T
): CursorPaginatedResponse<T> {
  const meta = generateCursorPaginationMeta(data, limit, sortField);
  const items = meta.hasNext ? data.slice(0, limit) : data;
  
  return {
    data: items,
    meta
  };
}

/**
 * Drizzle offset pagination helper
 */
export function applyOffsetPagination<T>(
  query: any,
  page: number,
  limit: number
): any {
  const offset = calculateOffset(page, limit);
  return query.limit(limit).offset(offset);
}

/**
 * Drizzle cursor pagination helper
 * 
 * Usage:
 * const query = db.select().from(table);
 * const paginatedQuery = applyCursorPagination(query, cursor, limit, 'createdAt', 'id');
 */
export function applyCursorPagination<T>(
  query: any,
  cursor: string | undefined,
  limit: number,
  sortField: string = 'createdAt',
  idField: string = 'id',
  order: 'asc' | 'desc' = 'desc'
): any {
  let paginatedQuery = query;

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      // Add WHERE clause for cursor-based filtering
      // This is database-specific and should be adjusted based on your ORM
      const operator = order === 'desc' ? '<' : '>';
      paginatedQuery = paginatedQuery.where(
        `(${sortField}, ${idField}) ${operator} (?, ?)`,
        [new Date(decoded.timestamp), decoded.id]
      );
    }
  }

  // Fetch limit + 1 to determine if there are more results
  return paginatedQuery.limit(limit + 1);
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(params: PaginationParams): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (params.page !== undefined && params.page < 1) {
    errors.push('Page must be greater than 0');
  }

  if (params.limit !== undefined) {
    if (params.limit < MIN_LIMIT) {
      errors.push(`Limit must be at least ${MIN_LIMIT}`);
    }
    if (params.limit > MAX_LIMIT) {
      errors.push(`Limit must not exceed ${MAX_LIMIT}`);
    }
  }

  if (params.order && !['asc', 'desc'].includes(params.order)) {
    errors.push('Order must be either "asc" or "desc"');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate pagination links for HAL/HATEOAS
 */
export function generatePaginationLinks(
  baseUrl: string,
  page: number,
  limit: number,
  totalPages: number
): Record<string, string> {
  const links: Record<string, string> = {
    self: `${baseUrl}?page=${page}&limit=${limit}`
  };

  if (page > 1) {
    links.first = `${baseUrl}?page=1&limit=${limit}`;
    links.prev = `${baseUrl}?page=${page - 1}&limit=${limit}`;
  }

  if (page < totalPages) {
    links.next = `${baseUrl}?page=${page + 1}&limit=${limit}`;
    links.last = `${baseUrl}?page=${totalPages}&limit=${limit}`;
  }

  return links;
}

/**
 * Pagination middleware
 * Attaches pagination params to request
 */
export function paginationMiddleware() {
  return (req: Request, res: any, next: any) => {
    const params = extractPaginationParams(req);
    const validation = validatePaginationParams(params);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid pagination parameters',
        errors: validation.errors
      });
    }

    (req as any).pagination = params;
    next();
  };
}

/**
 * Get pagination params from request (after middleware)
 */
export function getPaginationParams(req: Request): PaginationParams {
  return (req as any).pagination || extractPaginationParams(req);
}

export default {
  extractPaginationParams,
  calculateOffset,
  generatePaginationMeta,
  createPaginatedResponse,
  encodeCursor,
  decodeCursor,
  generateCursorPaginationMeta,
  createCursorPaginatedResponse,
  applyOffsetPagination,
  applyCursorPagination,
  validatePaginationParams,
  generatePaginationLinks,
  paginationMiddleware,
  getPaginationParams,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MIN_LIMIT
};
