import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Icon, Search } from '@/components/icons'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Consistent "nothing here" state for empty tables, filtered map results,
 * and unpopulated dashboard sections. Prevents every page from inventing
 * its own empty-state copy/layout.
 *
 * Props
 * -----
 * - title: string
 * - description?: string
 * - icon?: LucideIcon (defaults to Search)
 * - action?: ReactNode — e.g. a "Clear filters" Button
 *
 * Example usage
 * -------------
 * <EmptyState title="No candidate nodes" description="Try widening your filters"
 *   action={<Button variant="outline" onClick={clearFilters}>Clear filters</Button>} />
 *
 * Accessibility
 * -------------
 * Plain semantic markup; heading level intentionally left as a styled
 * <p> rather than an <h*> since empty states are usually nested inside
 * an already-labeled section.
 *
 * Future extension
 * -----------------
 * Add an illustration slot if the visual design calls for it later.
 */
export interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon = Search,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
        className
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-tertiary text-text-tertiary">
        <Icon icon={icon} size={20} />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-body font-medium text-text-primary">{title}</p>
        {description && <p className="text-small text-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  )
}
