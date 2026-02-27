/**
 * Pagination Utilities
 *
 * Shared helpers for offset-based and cursor-based pagination.
 */

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// ─── Offset Pagination ────────────────────────────────────────────────────────

/** Calculate the SQL OFFSET for a given page and limit. */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** Build a standard pagination meta object. */
export function generatePaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/** Create `{ limit, offset }` params suitable for Drizzle/SQL queries. */
export function createPaginationParams(
  page: number,
  limit: number = DEFAULT_LIMIT
): { limit: number; offset: number } {
  return {
    limit: Math.min(limit, MAX_LIMIT),
    offset: calculateOffset(page, limit),
  };
}

// ─── Cursor Pagination ────────────────────────────────────────────────────────

export interface CursorData {
  timestamp: number;
  id: string;
}

/** Encode a cursor from a timestamp + id pair (base64 JSON). */
export function encodeCursor(timestamp: Date, id: string): string {
  const data: CursorData = { timestamp: timestamp.getTime(), id };
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

/** Decode a cursor string; returns null if invalid. */
export function decodeCursor(cursor: string): CursorData | null {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    const data = JSON.parse(decoded) as CursorData;
    if (typeof data.timestamp !== "number" || typeof data.id !== "string") {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export interface CursorPaginationParams {
  after?: string;
  limit?: number;
}

export interface CursorPaginationResult {
  limit: number;
  cursor?: string;
}

/** Build cursor-based pagination params. */
export function createCursorPagination(
  params: CursorPaginationParams
): CursorPaginationResult {
  return {
    limit: Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT),
    cursor: params.after,
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface PaginationValidationResult {
  valid: boolean;
  errors: string[];
}

/** Validate pagination query params and return structured errors. */
export function validatePaginationParams(params: {
  page?: number;
  limit?: number;
  order?: string;
}): PaginationValidationResult {
  const errors: string[] = [];

  if (params.page !== undefined && params.page < 1) {
    errors.push("Page must be greater than 0");
  }
  if (params.limit !== undefined && params.limit < 1) {
    errors.push("Limit must be greater than 0");
  }
  if (params.limit !== undefined && params.limit > MAX_LIMIT) {
    errors.push(`Limit cannot exceed ${MAX_LIMIT}`);
  }
  if (params.order !== undefined && params.order !== "asc" && params.order !== "desc") {
    errors.push('Order must be either "asc" or "desc"');
  }

  return { valid: errors.length === 0, errors };
}
