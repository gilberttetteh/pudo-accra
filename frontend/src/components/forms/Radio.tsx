import type { ComponentPropsWithoutRef } from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Mutually-exclusive choice input (e.g. distance unit: meters/minutes,
 * export format). Compose RadioGroup + RadioItem.
 *
 * Props
 * -----
 * RadioGroup: value / onValueChange, orientation
 * RadioItem: value, id, disabled
 *
 * Example usage
 * -------------
 * <RadioGroup value={unit} onValueChange={setUnit}>
 *   <div className="flex items-center gap-2">
 *     <RadioItem value="meters" id="unit-m" />
 *     <Label htmlFor="unit-m">Meters</Label>
 *   </div>
 * </RadioGroup>
 *
 * Accessibility
 * -------------
 * Built on @radix-ui/react-radio-group — arrow-key navigation and
 * `role="radiogroup"`/`radio` semantics handled automatically.
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
export const RadioGroup = RadioGroupPrimitive.Root

export function RadioItem({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        'flex h-4 w-4 items-center justify-center rounded-full border border-border-strong bg-surface',
        'transition-colors duration-(--duration-fast) focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-primary-600',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="h-2 w-2 rounded-full bg-primary-600" />
    </RadioGroupPrimitive.Item>
  )
}
