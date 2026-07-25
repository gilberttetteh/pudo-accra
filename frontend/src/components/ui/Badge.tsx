import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Small status/category label. Used for node status (Active/Candidate),
 * coverage tiers, and table cell tags.
 *
 * Props
 * -----
 * - tone: 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info'
 * - size: 'sm' | 'md'
 * - dot: renders a small leading status dot instead of a filled pill
 *
 * Example usage
 * -------------
 * <Badge tone="success">Covered</Badge>
 * <Badge tone="warning" dot>Pending review</Badge>
 *
 * Variants
 * --------
 * Six semantic tones map directly to the design token color scales.
 *
 * Accessibility
 * -------------
 * Purely presentational (`role="status"` omitted by default since badges
 * are usually adjacent to other labeled content); pass `aria-label` if a
 * badge is the only indicator of state.
 *
 * Future extension
 * -----------------
 * Add a `removable` variant with a close icon for filter chips.
 */
const badgeVariants = cva('inline-flex items-center gap-1.5 rounded-full font-medium w-fit', {
  variants: {
    tone: {
      neutral: 'bg-surface-tertiary text-text-secondary',
      primary: 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300',
      success: 'bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-300',
      warning: 'bg-warning-100 text-warning-700 dark:bg-warning-950 dark:text-warning-300',
      error: 'bg-error-100 text-error-700 dark:bg-error-950 dark:text-error-300',
      info: 'bg-info-100 text-info-700 dark:bg-info-950 dark:text-info-300',
    },
    size: {
      sm: 'text-caption px-2 py-0.5',
      md: 'text-small px-2.5 py-1',
    },
  },
  defaultVariants: { tone: 'neutral', size: 'sm' },
})

const dotToneClasses: Record<string, string> = {
  neutral: 'bg-neutral-400',
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-info-500',
}

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export function Badge({
  className,
  tone = 'neutral',
  size,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size }), className)} {...props}>
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', dotToneClasses[tone ?? 'neutral'])} />
      )}
      {children}
    </span>
  )
}
