import type { ReactNode } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Short, on-hover/on-focus explanatory text — primarily for IconButtons
 * and MapToolbar controls where there's no visible label.
 *
 * Props
 * -----
 * - content: ReactNode
 * - side: 'top' | 'right' | 'bottom' | 'left'
 * - children: the trigger element (a single focusable child)
 *
 * Example usage
 * -------------
 * <Tooltip content="Zoom in">
 *   <IconButton icon={ZoomIn} label="Zoom in" />
 * </Tooltip>
 *
 * Accessibility
 * -------------
 * Built on @radix-ui/react-tooltip — shows on both hover and keyboard
 * focus, with correct `role="tooltip"` and delay handling. Note: the
 * trigger still needs its own accessible name (e.g. IconButton's
 * `label`); Tooltip is supplementary, not a replacement for it.
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
export interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  delayMs?: number
}

export function Tooltip({ content, children, side = 'top', delayMs = 300 }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayMs}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className={cn(
              'z-50 rounded-md bg-neutral-900 px-2.5 py-1.5 text-caption text-white shadow-md dark:bg-neutral-100 dark:text-neutral-900'
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-neutral-900 dark:fill-neutral-100" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
