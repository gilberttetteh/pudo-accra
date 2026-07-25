import { cn } from '@/utils/cn'
import { Icon, Loader2 } from '@/components/icons'

/**
 * Purpose
 * -------
 * An indeterminate loading indicator for moments where content shape is
 * unknown (page transitions, full-panel loads). For known-shape content,
 * prefer Skeleton.
 *
 * Props
 * -----
 * - size: 'sm' | 'md' | 'lg'
 * - label?: string — visible/announced loading message
 *
 * Example usage
 * -------------
 * <Spinner size="lg" label="Loading coverage data…" />
 *
 * Accessibility
 * -------------
 * `role="status"` with the label as visually-hidden text if not shown,
 * so screen readers announce the loading state.
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  showLabel?: boolean
  className?: string
}

const sizeMap = { sm: 14, md: 20, lg: 28 }

export function Spinner({
  size = 'md',
  label = 'Loading',
  showLabel = false,
  className,
}: SpinnerProps) {
  return (
    <div
      role="status"
      className={cn('inline-flex items-center gap-2 text-text-secondary', className)}
    >
      <Icon icon={Loader2} size={sizeMap[size]} className="animate-spin" />
      {showLabel ? (
        <span className="text-small">{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </div>
  )
}
