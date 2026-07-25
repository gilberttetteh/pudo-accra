import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Icon } from '@/components/icons'

/**
 * Purpose
 * -------
 * The base single-line text input for all forms (node names, addresses,
 * numeric filters). Wraps native <input> with consistent sizing, focus
 * ring, error state, and optional icon slots.
 *
 * Props
 * -----
 * - size: 'sm' | 'md' | 'lg'
 * - error?: boolean — red border + aria-invalid
 * - leftIcon / rightIcon: LucideIcon
 * - All native <input> props (type, value, onChange, disabled, ...)
 *
 * Example usage
 * -------------
 * <Input placeholder="Node name" leftIcon={MapPin} />
 * <Input type="number" error={!!errors.radius} />
 *
 * Accessibility
 * -------------
 * Forwards `aria-invalid` when `error` is true; always pair with a
 * <Label htmlFor> and, for errors, an adjacent message with
 * `aria-describedby` wired up by the consuming form.
 *
 * Future extension
 * -----------------
 * Add a `prefix`/`suffix` text slot (e.g. "m" for radius fields) distinct
 * from icons.
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
}

const sizeClass = {
  sm: 'h-8 text-small px-2.5',
  md: 'h-9 text-body px-3',
  lg: 'h-11 text-body-lg px-4',
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = 'md', error = false, leftIcon, rightIcon, disabled, ...props }, ref) => {
    const iconSize = size === 'lg' ? 18 : 16
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 text-text-tertiary">
            <Icon icon={leftIcon} size={iconSize} />
          </span>
        )}
        <input
          ref={ref}
          disabled={disabled}
          aria-invalid={error || undefined}
          className={cn(
            'w-full rounded-md border bg-surface text-text-primary placeholder:text-text-tertiary',
            'transition-colors duration-(--duration-fast) ease-(--ease-standard)',
            'focus-visible:outline-2 focus-visible:outline-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-error-400 focus-visible:outline-error-500' : 'border-border-strong',
            sizeClass[size],
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="pointer-events-none absolute right-3 text-text-tertiary">
            <Icon icon={rightIcon} size={iconSize} />
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
