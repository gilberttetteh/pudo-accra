import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * A semantic horizontal or vertical rule for separating sections within
 * cards, toolbars, and menus.
 *
 * Props
 * -----
 * - orientation: 'horizontal' | 'vertical'
 * - label?: string — optional centered label ("OR") for horizontal dividers
 *
 * Example usage
 * -------------
 * <Divider />
 * <Divider orientation="vertical" className="h-6" />
 * <Divider label="OR" />
 *
 * Accessibility
 * -------------
 * Renders with `role="separator"` and `aria-orientation`.
 *
 * Future extension
 * -----------------
 * None anticipated — intentionally minimal.
 */
export interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  label?: string
  className?: string
}

export function Divider({ orientation = 'horizontal', label, className }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('w-px self-stretch bg-border', className)}
      />
    )
  }

  if (label) {
    return (
      <div className={cn('flex items-center gap-3', className)} role="separator">
        <div className="h-px flex-1 bg-border" />
        <span className="text-caption text-text-tertiary">{label}</span>
        <div className="h-px flex-1 bg-border" />
      </div>
    )
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn('h-px w-full bg-border', className)}
    />
  )
}
