import { Modal } from '@/components/layout/Modal'
import { Button } from '@/components/ui/Button'

/**
 * Purpose
 * -------
 * Generic confirmation dialog reused by every destructive/consequential
 * node action (Approve, Reject, Archive, Delete, and each bulk action).
 * One implementation instead of one bespoke dialog per action.
 *
 * Props
 * -----
 * - open / onOpenChange
 * - title / description
 * - confirmLabel: string (default "Confirm")
 * - tone: 'default' | 'destructive' — controls the confirm button variant
 * - onConfirm: () => void
 *
 * Example usage
 * -------------
 * <ConfirmDialog open={open} onOpenChange={setOpen} title="Delete candidate?"
 *   description="This can be undone with Ctrl+Z." tone="destructive"
 *   confirmLabel="Delete" onConfirm={handleDelete} />
 *
 * Accessibility
 * -------------
 * Inherits Modal's focus trap and labeled-dialog semantics.
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  tone?: 'default' | 'destructive'
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  tone = 'default',
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={tone === 'destructive' ? 'destructive' : 'primary'}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-small text-text-secondary">
        This action can be undone with the Undo button or Ctrl/Cmd+Z.
      </p>
    </Modal>
  )
}
