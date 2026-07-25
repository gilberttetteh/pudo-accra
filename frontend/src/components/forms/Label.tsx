import type { ComponentPropsWithoutRef } from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Accessible form field label. Always pair with an input via `htmlFor`
 * (or by nesting) rather than a bare <label>.
 *
 * Props
 * -----
 * - required?: boolean — appends a visual + accessible required marker
 *
 * Example usage
 * -------------
 * <Label htmlFor="node-name" required>Node name</Label>
 * <Input id="node-name" />
 *
 * Accessibility
 * -------------
 * Built on @radix-ui/react-label, which correctly forwards clicks to the
 * associated control.
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
export interface LabelProps extends ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  required?: boolean
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      className={cn('text-small font-medium text-text-primary', className)}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-error-500" aria-hidden="true">
          *
        </span>
      )}
    </LabelPrimitive.Root>
  )
}
