import { Fragment } from 'react'
import { Icon, ChevronRight } from '@/components/icons'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Shows the user's location within a hierarchical page structure
 * (Dashboard > Nodes > Node #128). Framework-agnostic: accepts plain
 * `href`s so it works whether pages use React Router's <Link> or not
 * once wired in Phase 4 (this component itself renders anchor tags for
 * now and can be swapped to a router-aware Link at that point).
 *
 * Props
 * -----
 * - items: { label: string; href?: string }[] — last item (no href)
 *   renders as the current page, non-interactive.
 *
 * Example usage
 * -------------
 * <Breadcrumb items={[{ label: 'Dashboard', href: '/' }, { label: 'Nodes', href: '/nodes' }, { label: 'Node #128' }]} />
 *
 * Accessibility
 * -------------
 * Wrapped in `<nav aria-label="Breadcrumb">`; current page marked with
 * `aria-current="page"`.
 *
 * Future extension
 * -----------------
 * Swap internal <a> for React Router's <Link> once routing lands
 * (Phase 4) — keep this component's public API unchanged.
 */
export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-small', className)}>
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <Fragment key={item.label}>
              <li className="flex items-center gap-1.5">
                {item.href && !isLast ? (
                  <a href={item.href} className="text-text-secondary hover:text-text-primary">
                    {item.label}
                  </a>
                ) : (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className="font-medium text-text-primary"
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && <Icon icon={ChevronRight} size={13} className="text-text-tertiary" />}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
