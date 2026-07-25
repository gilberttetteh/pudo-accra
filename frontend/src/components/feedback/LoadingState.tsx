import { Spinner } from './Spinner'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Full-panel/full-page loading placeholder — a centered Spinner with a
 * message, used while a route or major data section is fetching. Distinct
 * from Skeleton (shape-preserving, inline) and Spinner (small, inline).
 *
 * Props
 * -----
 * - message?: string
 * - fullHeight?: boolean — fills parent height (min-h-full) vs a fixed
 *   compact block, useful inside Cards vs whole pages.
 *
 * Example usage
 * -------------
 * <LoadingState message="Loading nodes…" />
 *
 * Accessibility
 * -------------
 * Delegates `role="status"` to the inner Spinner.
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
export interface LoadingStateProps {
  message?: string
  fullHeight?: boolean
  className?: string
}

export function LoadingState({
  message = 'Loading…',
  fullHeight = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-text-secondary',
        fullHeight && 'min-h-full',
        className
      )}
    >
      <Spinner size="lg" />
      <p className="text-small">{message}</p>
    </div>
  )
}
