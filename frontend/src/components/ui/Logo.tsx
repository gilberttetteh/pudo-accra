import { Icon, MapPin } from '@/components/icons'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The app brand mark, used in Sidebar, TopNav (public), and AuthLayout.
 * A placeholder wordmark + icon badge until a real logo asset exists.
 *
 * Props
 * -----
 * - collapsed?: boolean — renders icon-only (for the collapsed Sidebar state)
 * - size: 'sm' | 'md'
 *
 * Example usage
 * -------------
 * <Logo />
 * <Logo collapsed />
 *
 * Accessibility
 * -------------
 * Renders as a link-free, static mark; wrap in a router <Link to="/"> at
 * the call site if it should be clickable (Sidebar/TopNav do this).
 *
 * Future extension
 * -----------------
 * Swap the icon badge for a real SVG wordmark asset when brand design
 * is finalized.
 */
export interface LogoProps {
  collapsed?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function Logo({ collapsed = false, size = 'md', className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-md bg-primary-600 text-white',
          size === 'md' ? 'h-8 w-8' : 'h-6 w-6'
        )}
      >
        <Icon icon={MapPin} size={size === 'md' ? 18 : 14} strokeWidth={2} />
      </span>
      {!collapsed && (
        <span
          className={cn(
            'font-semibold text-text-primary',
            size === 'md' ? 'text-body' : 'text-small'
          )}
        >
          Accra PUDO
        </span>
      )}
    </div>
  )
}
