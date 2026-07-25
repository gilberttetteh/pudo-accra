import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Multi-line text input for descriptions/notes (e.g. candidate node
 * justification, PR-style change notes on a planning decision).
 *
 * Props
 * -----
 * - error?: boolean
 * - All native <textarea> props
 *
 * Example usage
 * -------------
 * <Textarea rows={4} placeholder="Notes about this candidate location" />
 *
 * Accessibility
 * -------------
 * Same conventions as Input: pair with <Label htmlFor>, forwards
 * aria-invalid on error.
 *
 * Future extension
 * -----------------
 * Add auto-resize behavior if long-form notes become common.
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error = false, disabled, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        aria-invalid={error || undefined}
        className={cn(
          'w-full resize-y rounded-md border bg-surface px-3 py-2 text-body text-text-primary placeholder:text-text-tertiary',
          'transition-colors duration-(--duration-fast) ease-(--ease-standard)',
          'focus-visible:outline-2 focus-visible:outline-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-error-400 focus-visible:outline-error-500' : 'border-border-strong',
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'
