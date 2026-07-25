import type { LucideIcon, LucideProps } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Single wrapper around every icon rendered in the app. Guarantees
 * consistent default size/stroke-width and lets us swap the underlying
 * icon library in one place later if needed.
 *
 * Props
 * -----
 * - icon: LucideIcon        — the icon component to render (import from
 *                              '@/components/icons' re-exports, not
 *                              'lucide-react' directly).
 * - size, strokeWidth, className, ...rest: standard Lucide props.
 *
 * Example usage
 * -------------
 * import { Icon, MapPin } from '@/components/icons'
 * <Icon icon={MapPin} className="text-primary-600" />
 *
 * Accessibility
 * -------------
 * Decorative by default (`aria-hidden`); pass `aria-label` explicitly
 * when an icon is the only content of an interactive element (see
 * IconButton, which handles this for you).
 *
 * Future extension
 * -----------------
 * Add a `spin` boolean for loading-icon animation, or a `badge` prop for
 * notification dots.
 */
export interface IconProps extends Omit<LucideProps, 'ref'> {
  icon: LucideIcon
}

export function Icon({
  icon: LucideIconComponent,
  className,
  size = 18,
  strokeWidth = 1.75,
  'aria-hidden': ariaHidden = true,
  ...props
}: IconProps) {
  return (
    <LucideIconComponent
      className={cn('shrink-0', className)}
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden={ariaHidden}
      {...props}
    />
  )
}
