import type { ComponentPropsWithoutRef } from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Binary on/off toggle for settings and quick layer visibility toggles
 * (e.g. "Show heatmap" in the map toolbar).
 *
 * Props
 * -----
 * - checked / onCheckedChange, disabled, id
 *
 * Example usage
 * -------------
 * <Switch id="dark-mode" checked={isDark} onCheckedChange={toggleTheme} />
 *
 * Accessibility
 * -------------
 * Built on @radix-ui/react-switch — correct `role="switch"` and
 * `aria-checked` automatically.
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
export function Switch({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'relative h-5 w-9 shrink-0 rounded-full bg-neutral-300 transition-colors duration-(--duration-fast)',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-primary-600 dark:bg-neutral-700',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-(--duration-fast)',
          'data-[state=checked]:translate-x-[18px]'
        )}
      />
    </SwitchPrimitive.Root>
  )
}
