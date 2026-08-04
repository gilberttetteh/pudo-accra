import type { ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/utils/cn'
import { Icon, X } from '@/components/icons'

/**
 * Purpose
 * -------
 * Centered, focus-trapping dialog for confirmations, create/edit forms
 * (e.g. "Add candidate node"), and anything that should block interaction
 * with the rest of the page. For a side-anchored panel, use Drawer.
 *
 * Props
 * -----
 * - open / onOpenChange: controlled visibility
 * - title: string (required — always visible, used as the dialog's
 *   accessible name)
 * - description?: string
 * - size: 'sm' | 'md' | 'lg' | 'xl'
 * - children: body content
 * - footer?: ReactNode — action buttons
 *
 * Example usage
 * -------------
 * <Modal open={isOpen} onOpenChange={setIsOpen} title="Add candidate node"
 *   footer={<><Button variant="outline">Cancel</Button><Button>Save</Button></>}>
 *   <NodeForm />
 * </Modal>
 *
 * Accessibility
 * -------------
 * Built on @radix-ui/react-dialog — focus trap, Escape-to-close,
 * `aria-labelledby`/`aria-describedby`, and scroll lock handled
 * automatically. `title` is mandatory to guarantee an accessible name.
 *
 * Future extension
 * -----------------
 * Add a `preventClose` prop for destructive-confirmation flows that must
 * be explicitly acknowledged.
 */
export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children?: ReactNode
  footer?: ReactNode
}

// See Drawer.tsx's comment: named max-w-{sm,md,lg,2xl} utilities are
// silently overridden by this project's own --spacing-* design tokens
// (same names, spacing-scale values). Explicit rem values avoid it.
const sizeClass = {
  sm: 'max-w-[24rem]',
  md: 'max-w-[28rem]',
  lg: 'max-w-[32rem]',
  xl: 'max-w-[42rem]',
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  children,
  footer,
}: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-[1px] data-[state=open]:animate-none" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface shadow-xl',
            sizeClass[size]
          )}
        >
          <div className="flex items-start justify-between border-b border-border p-5">
            <div className="space-y-1">
              <DialogPrimitive.Title className="text-h4 text-text-primary">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="text-small text-text-secondary">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              aria-label="Close dialog"
              className="rounded-md p-1 text-text-tertiary hover:bg-surface-secondary hover:text-text-primary"
            >
              <Icon icon={X} size={18} />
            </DialogPrimitive.Close>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-5">{children}</div>

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


