import { IconButton } from '@/components/ui/IconButton'
import { ChevronLeft, ChevronRight } from '@/components/icons'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Page navigation for Table results and any other paginated list (node
 * directory, activity log).
 *
 * Props
 * -----
 * - page: number (1-indexed)
 * - totalPages: number
 * - onPageChange: (page: number) => void
 * - siblingCount?: number — how many page numbers to show around current
 *
 * Example usage
 * -------------
 * <Pagination page={page} totalPages={12} onPageChange={setPage} />
 *
 * Accessibility
 * -------------
 * Wrapped in `<nav aria-label="Pagination">`; current page marked with
 * `aria-current="page"`; prev/next buttons disable at the bounds.
 *
 * Future extension
 * -----------------
 * Add a page-size selector once Table needs it (Phase 6+ node lists).
 */
export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
  className?: string
}

function getPageNumbers(
  page: number,
  totalPages: number,
  siblingCount: number
): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = []
  const start = Math.max(2, page - siblingCount)
  const end = Math.min(totalPages - 1, page + siblingCount)

  pages.push(1)
  if (start > 2) pages.push('ellipsis')
  for (let index = start; index <= end; index += 1) pages.push(index)
  if (end < totalPages - 1) pages.push('ellipsis')
  if (totalPages > 1) pages.push(totalPages)

  return pages
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null
  const pageNumbers = getPageNumbers(page, totalPages, siblingCount)

  return (
    <nav aria-label="Pagination" className={cn('flex items-center gap-1', className)}>
      <IconButton
        icon={ChevronLeft}
        label="Previous page"
        variant="ghost"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      />

      {pageNumbers.map((entry, index) =>
        entry === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-1.5 text-text-tertiary">
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            aria-current={entry === page ? 'page' : undefined}
            onClick={() => onPageChange(entry)}
            className={cn(
              'h-8 min-w-8 rounded-md px-2 text-small font-medium transition-colors duration-(--duration-fast)',
              entry === page
                ? 'bg-primary-600 text-white'
                : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
            )}
          >
            {entry}
          </button>
        )
      )}

      <IconButton
        icon={ChevronRight}
        label="Next page"
        variant="ghost"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
  )
}
