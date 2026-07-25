import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The base surface container for grouped content — dashboard tiles,
 * form sections, panel backgrounds. Compose with CardHeader/CardTitle/
 * CardDescription/CardContent/CardFooter for consistent internal spacing.
 *
 * Props
 * -----
 * - padded: boolean — applies default internal padding (default true).
 *   Set false when a child (e.g. a table or map) needs to touch the edges.
 * - interactive: boolean — adds hover/active affordance for clickable cards.
 *
 * Example usage
 * -------------
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Coverage Summary</CardTitle>
 *     <CardDescription>Last updated 2 hours ago</CardDescription>
 *   </CardHeader>
 *   <CardContent>...</CardContent>
 * </Card>
 *
 * Accessibility
 * -------------
 * Renders a plain <div>; when `interactive`, consumers should add
 * `role="button"` and `tabIndex={0}` (or use a real <button>/<Link>
 * wrapping the Card) rather than relying on this component alone.
 *
 * Future extension
 * -----------------
 * Add an `elevation` prop (sm/md/lg/floating) once dashboard density is
 * finalized in Phase 6.
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean
  interactive?: boolean
}

export function Card({ className, padded = true, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface shadow-sm',
        padded && 'p-5',
        interactive &&
          'transition-shadow duration-(--duration-fast) hover:shadow-md cursor-pointer',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex flex-col gap-1', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-h4 text-text-primary', className)} {...props} />
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-small text-text-secondary', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-4 flex items-center gap-3 border-t border-border pt-4', className)}
      {...props}
    />
  )
}
