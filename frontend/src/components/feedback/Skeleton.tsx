import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * A pulsing placeholder block for content that is still loading (table
 * cells, card values, avatars). Prefer this over a bare Spinner when the
 * final content's shape/size is known ahead of time — it reduces layout
 * shift.
 *
 * Props
 * -----
 * Accepts all <div> props; shape/size is controlled via className
 * (e.g. `h-4 w-24`, `h-9 w-9 rounded-full` for an avatar placeholder).
 *
 * Example usage
 * -------------
 * <Skeleton className="h-4 w-32" />
 * <Skeleton className="h-9 w-9 rounded-full" />
 *
 * Accessibility
 * -------------
 * `aria-hidden="true"` — the loading state itself should be announced
 * once, at a container level (e.g. via `aria-busy` on the parent), not
 * per-skeleton.
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-surface-tertiary', className)}
      {...props}
    />
  )
}
