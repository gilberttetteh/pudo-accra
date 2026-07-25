import type { ReactNode } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Anchored floating panel for richer on-demand content than a Tooltip
 * (e.g. a mini date-range picker, a legend detail, quick filter form)
 * that doesn't warrant a full Drawer.
 *
 * Props
 * -----
 * - trigger: ReactNode
 * - children: panel content
 * - open / onOpenChange: optional controlled mode
 * - side / align: placement
 *
 * Example usage
 * -------------
 * <Popover trigger={<Button variant="outline">Filters</Button>}>
 *   <FilterPanel />
 * </Popover>
 *
 * Accessibility
 * -------------
 * Built on @radix-ui/react-popover — focus management and
 * `aria-expanded`/`aria-controls` handled automatically.
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
export interface PopoverProps {
  trigger: ReactNode
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  className?: string
}

export function Popover({
  trigger,
  children,
  open,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  className,
}: PopoverProps) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={6}
          className={cn(
            'z-50 rounded-lg border border-border bg-surface p-4 shadow-lg outline-none',
            className
          )}
        >
          {children}
          <PopoverPrimitive.Arrow className="fill-surface" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
