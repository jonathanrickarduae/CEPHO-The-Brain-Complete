/**
 * usePagination — P4-4
 *
 * Reusable hook for offset-based pagination on list views.
 * Works with any tRPC query that accepts { limit, offset } input.
 */
import { useState, useCallback } from "react";

export interface PaginationState {
  page: number;
  limit: number;
  offset: number;
}

export interface UsePaginationReturn {
  page: number;
  limit: number;
  offset: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setLimit: (limit: number) => void;
  reset: () => void;
}

export function usePagination(
  total: number,
  initialLimit = 20
): UsePaginationReturn {
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState(initialLimit);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const goToPage = useCallback(
    (p: number) => {
      setPage(Math.max(1, Math.min(p, totalPages)));
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    setPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(prev - 1, 1));
  }, []);

  const setLimit = useCallback((l: number) => {
    setLimitState(l);
    setPage(1); // Reset to first page when limit changes
  }, []);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    limit,
    offset,
    totalPages,
    hasNext,
    hasPrev,
    goToPage,
    nextPage,
    prevPage,
    setLimit,
    reset,
  };
}
