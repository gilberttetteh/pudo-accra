import type { ComponentPropsWithoutRef } from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cn } from '@/utils/cn'
import { Icon, Check } from '@/components/icons'

/**
 * Purpose
 * -------
 * Standard checkbox for multi-select filters (e.g. toggling map layers
 * in FilterPanel, selecting table rows).
 *
 * Props
 * -----
 * - checked / onCheckedChange: controlled state (supports 'indeterminate')
 * - disabled?: boolean
 * - id: string — required so an external <Label htmlFor> can target it
 *
 * Example usage
 * -------------
 * <Checkbox id="layer-flood" checked={showFlood} onCheckedChange={setShowFlood} />
 * <Label htmlFor="layer-flood">Flood zones</Label>
 *
 * Accessibility
 * -------------
 * Built on @radix-ui/react-checkbox — correct `role="checkbox"` and
 * `aria-checked` (including "mixed" for indeterminate) automatically.
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
export type CheckboxProps = ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border-strong bg-surface',
        'transition-colors duration-(--duration-fast) focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-primary-600 data-[state=checked]:bg-primary-600',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="text-white">
        <Icon icon={Check} size={11} strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
