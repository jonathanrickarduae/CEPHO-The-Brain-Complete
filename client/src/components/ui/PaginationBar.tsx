/**
 * PaginationBar — P4-4
 *
 * Reusable pagination control bar that wraps the existing Pagination UI.
 * Renders Previous/Next buttons plus page number buttons.
 */
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import type { UsePaginationReturn } from "@/hooks/usePagination";

interface PaginationBarProps {
  pagination: UsePaginationReturn;
  /** Optional: show a summary like "Showing 1–20 of 150" */
  total?: number;
  className?: string;
}

export function PaginationBar({
  pagination,
  total,
  className,
}: PaginationBarProps) {
  const { page, limit, totalPages, hasNext, hasPrev, goToPage } = pagination;

  if (totalPages <= 1) return null;

  // Build page numbers to show: always show first, last, current ±1, with ellipsis
  const pages: Array<number | "ellipsis"> = [];
  const range = new Set<number>();
  range.add(1);
  range.add(totalPages);
  for (
    let i = Math.max(2, page - 1);
    i <= Math.min(totalPages - 1, page + 1);
    i++
  ) {
    range.add(i);
  }
  const sorted = Array.from(range).sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      pages.push("ellipsis");
    }
    pages.push(sorted[i]);
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total ?? page * limit);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 ${className ?? ""}`}
      role="navigation"
      aria-label="Pagination"
    >
      {total !== undefined && (
        <p className="text-sm text-muted-foreground">
          Showing {start}–{end} of {total}
        </p>
      )}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={e => {
                e.preventDefault();
                if (hasPrev) goToPage(page - 1);
              }}
              aria-disabled={!hasPrev}
              className={!hasPrev ? "pointer-events-none opacity-40" : ""}
            />
          </PaginationItem>

          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={e => {
                    e.preventDefault();
                    goToPage(p);
                  }}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={e => {
                e.preventDefault();
                if (hasNext) goToPage(page + 1);
              }}
              aria-disabled={!hasNext}
              className={!hasNext ? "pointer-events-none opacity-40" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
