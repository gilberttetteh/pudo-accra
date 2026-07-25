import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { Icon, Loader2 } from '@/components/icons'

/**
 * Purpose
 * -------
 * The single button implementation for the whole app. Every clickable
 * action (primary CTAs, toolbar actions, form submits) should use this
 * instead of a raw <button>.
 *
 * Props
 * -----
 * - variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
 * - size: 'sm' | 'md' | 'lg'
 * - isLoading: shows a spinner and disables interaction, preserving width
 * - leftIcon / rightIcon: LucideIcon components rendered inline
 * - asChild: render props onto a child element (e.g. a router <Link>)
 *   instead of a <button>, via Radix Slot — preserves styling without
 *   nesting interactive elements.
 *
 * Example usage
 * -------------
 * <Button variant="primary" size="md" leftIcon={Plus}>Add Node</Button>
 * <Button variant="outline" isLoading>Saving…</Button>
 * <Button asChild variant="ghost"><Link to="/map">Open Map</Link></Button>
 *
 * Variants
 * --------
 * primary (brand action), secondary (neutral filled), outline (bordered),
 * ghost (no background until hover), destructive (irreversible actions),
 * link (inline, text-only).
 *
 * Accessibility
 * -------------
 * Native <button> semantics by default; disabled state sets both the
 * `disabled` attribute and `aria-disabled`. Loading state announces via
 * `aria-busy` so screen readers don't read stale content as final.
 *
 * Future extension
 * -----------------
 * Add a `tone` prop for semantic (success/warning/error) buttons if a
 * future flow needs them beyond `destructive`.
 */
const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium',
    'rounded-md transition-colors duration-(--duration-fast) ease-(--ease-standard)',
    'disabled:pointer-events-none disabled:opacity-50',
    'focus-visible:outline-2 focus-visible:outline-offset-2'
  ),
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
        secondary:
          'bg-surface-tertiary text-text-primary hover:bg-neutral-200 dark:hover:bg-neutral-700',
        outline:
          'border border-border-strong bg-transparent text-text-primary hover:bg-surface-secondary',
        ghost: 'bg-transparent text-text-primary hover:bg-surface-secondary',
        destructive: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800',
        link: 'bg-transparent text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-small',
        md: 'h-9 px-4 text-body',
        lg: 'h-11 px-5 text-body-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  leftIcon?: typeof Loader2
  rightIcon?: typeof Loader2
  children?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    const iconSize = size === 'lg' ? 18 : size === 'sm' ? 14 : 16

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && <Icon icon={Loader2} size={iconSize} className="animate-spin" />}
        {!isLoading && leftIcon && <Icon icon={leftIcon} size={iconSize} />}
        {children}
        {!isLoading && rightIcon && <Icon icon={rightIcon} size={iconSize} />}
      </Comp>
    )
  }
)
Button.displayName = 'Button'
