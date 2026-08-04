import type { ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/utils/cn'
import { Icon, X } from '@/components/icons'

/**
 * Purpose
 * -------
 * Side-anchored panel for node detail inspection, filter configuration,
 * or map layer settings — content the user references alongside the map
 * rather than a blocking modal. Shares Radix Dialog's a11y guarantees.
 *
 * Props
 * -----
 * - open / onOpenChange: controlled visibility
 * - title: string (required)
 * - side: 'left' | 'right' (default 'right')
 * - width: 'sm' | 'md' | 'lg'
 * - children, footer
 *
 * Example usage
 * -------------
 * <Drawer open={isOpen} onOpenChange={setIsOpen} title="Node details" side="right">
 *   <NodeDetailPanel node={selectedNode} />
 * </Drawer>
 *
 * Accessibility
 * -------------
 * Same guarantees as Modal (focus trap, Escape-to-close, labeled
 * regions) via @radix-ui/react-dialog.
 *
 * Future extension
 * -----------------
 * Add a `nonModal` mode (no overlay, no focus trap) for a persistent
 * "always open on desktop" panel once the Map page layout is finalized.
 */
export interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  side?: 'left' | 'right'
  width?: 'sm' | 'md' | 'lg'
  children?: ReactNode
  footer?: ReactNode
}

// Explicit rem values (Tailwind's own default max-w-{xs,sm,md} scale)
// rather than the named utilities themselves — this project's Phase 2
// design tokens define --spacing-xs/sm/md/lg/... (0.25rem/0.5rem/1rem/...
// for padding/gap use), which share names with Tailwind's built-in
// sizing scale and silently override it: max-w-sm was resolving to
// 8px (--spacing-sm) instead of the expected 24rem. Arbitrary values
// sidestep the collision entirely.
const widthClass = { sm: 'max-w-[20rem]', md: 'max-w-[24rem]', lg: 'max-w-[28rem]' }
const sideClass = {
  left: 'left-0 border-r data-[state=closed]:-translate-x-full',
  right: 'right-0 border-l data-[state=closed]:translate-x-full',
}

export function Drawer({
  open,
  onOpenChange,
  title,
  side = 'right',
  width = 'md',
  children,
  footer,
}: DrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-neutral-900/40" />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-y-0 z-50 flex w-full flex-col border-border bg-surface shadow-xl',
            'transition-transform duration-(--duration-base) ease-(--ease-standard)',
            widthClass[width],
            sideClass[side]
          )}
        >
          <div className="flex items-center justify-between border-b border-border p-5">
            <DialogPrimitive.Title className="text-h4 text-text-primary">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close panel"
              className="rounded-md p-1 text-text-tertiary hover:bg-surface-secondary hover:text-text-primary"
            >
              <Icon icon={X} size={18} />
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-5">{children}</div>

          {footer && (
            <div className="flex items-center justify-end gap-3 border-t border-border p-5">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}


