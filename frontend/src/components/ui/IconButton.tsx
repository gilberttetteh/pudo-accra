import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { Icon, Loader2 } from '@/components/icons'
import type { LucideIcon } from 'lucide-react'

/**
 * Purpose
 * -------
 * A square, icon-only button for toolbars, table row actions, and map
 * controls (zoom, locate, layers). Use instead of wrapping <Icon> in a
 * bare <Button> to get correct square sizing and a required a11y label.
 *
 * Props
 * -----
 * - icon: LucideIcon (required)
 * - label: string (required) — used as aria-label, since there's no
 *   visible text for screen readers to read.
 * - variant: 'solid' | 'outline' | 'ghost'
 * - size: 'sm' | 'md' | 'lg'
 * - isLoading, disabled
 *
 * Example usage
 * -------------
 * <IconButton icon={ZoomIn} label="Zoom in" variant="outline" size="sm" />
 *
 * Accessibility
 * -------------
 * `label` is required at the type level and rendered as `aria-label`,
 * so this component cannot be used without an accessible name.
 *
 * Future extension
 * -----------------
 * Add a `tooltip` prop that wraps the button in the Tooltip component
 * once map toolbars need on-hover labels (see MapToolbar).
 */
const iconButtonVariants = cva(
  cn(
    'inline-flex items-center justify-center rounded-md transition-colors',
    'duration-(--duration-fast) ease-(--ease-standard)',
    'disabled:pointer-events-none disabled:opacity-50',
    'focus-visible:outline-2 focus-visible:outline-offset-2'
  ),
  {
    variants: {
      variant: {
        solid: 'bg-primary-600 text-white hover:bg-primary-700',
        outline:
          'border border-border-strong bg-surface text-text-primary hover:bg-surface-secondary',
        ghost:
          'bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary',
      },
      size: {
        sm: 'h-7 w-7',
        md: 'h-9 w-9',
        lg: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'outline', size: 'md' },
  }
)

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonVariants> {
  icon: LucideIcon
  label: string
  isLoading?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, label, isLoading, disabled, ...props }, ref) => {
    const iconSize = size === 'lg' ? 20 : size === 'sm' ? 14 : 16
    return (
      <button
        ref={ref}
        type="button"
        className={cn(iconButtonVariants({ variant, size }), className)}
        aria-label={label}
        title={label}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        <Icon
          icon={isLoading ? Loader2 : icon}
          size={iconSize}
          className={isLoading ? 'animate-spin' : undefined}
        />
      </button>
    )
  }
)
IconButton.displayName = 'IconButton'
