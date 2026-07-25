import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Select } from '@/components/forms/Select'
import { ConfirmDialog } from './ConfirmDialog'
import { X, CheckCircle2, XCircle, Download, Trash2 } from '@/components/icons'
import { useNodeStore } from '@/store/nodeStore'
import { useToast } from '@/components/feedback/Toast'
import { PROVIDERS, type Provider, type NodeStatus } from '@/mock/nodes'

/**
 * Purpose
 * -------
 * Appears above the node list when one or more rows are multi-selected.
 * Implements Approve Selected / Reject Selected / Export Selected /
 * Delete Selected / Change Status / Assign Provider — each mutating
 * action goes through nodeStore (so it's undoable) and is gated behind
 * ConfirmDialog. Approve/Reject only apply to candidates in the
 * selection; Change Status/Archive-style actions only apply to existing
 * nodes — mixed selections apply each action to whichever subset it's
 * valid for and the toast reports how many were affected.
 *
 * Props
 * -----
 * - selectedIds: Set<string>
 * - onClear: () => void
 *
 * Example usage
 * -------------
 * <BulkActionsBar selectedIds={selectedIds} onClear={() => setSelectedIds(new Set())} />
 *
 * Accessibility
 * -------------
 * Standard toolbar of real buttons; each destructive action is gated by
 * ConfirmDialog (focus-trapped, labeled).
 *
 * Future extension
 * -----------------
 * Wire "Export Selected" to a real GeoJSON/CSV export once that
 * pipeline exists (currently a toast placeholder, consistent with the
 * map toolbar's Export button from Phase 4).
 */
export interface BulkActionsBarProps {
  selectedIds: Set<string>
  existingIds: Set<string>
  candidateIds: Set<string>
  onClear: () => void
}

const STATUS_OPTIONS: { value: NodeStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'offline', label: 'Offline' },
  { value: 'archived', label: 'Archived' },
]

export function BulkActionsBar({
  selectedIds,
  existingIds,
  candidateIds,
  onClear,
}: BulkActionsBarProps) {
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | 'delete' | null>(null)
  const [statusValue, setStatusValue] = useState<NodeStatus>('active')
  const [providerValue, setProviderValue] = useState<Provider>(PROVIDERS[0])

  const bulkApproveCandidates = useNodeStore((state) => state.bulkApproveCandidates)
  const bulkRejectCandidates = useNodeStore((state) => state.bulkRejectCandidates)
  const bulkDeleteCandidates = useNodeStore((state) => state.bulkDeleteCandidates)
  const bulkChangeStatus = useNodeStore((state) => state.bulkChangeStatus)
  const bulkAssignProvider = useNodeStore((state) => state.bulkAssignProvider)
  const { showToast } = useToast()

  const selectedCandidateIds = [...selectedIds].filter((id) => candidateIds.has(id))
  const selectedExistingIds = [...selectedIds].filter((id) => existingIds.has(id))

  const runConfirmed = () => {
    if (confirmAction === 'approve' && selectedCandidateIds.length > 0) {
      bulkApproveCandidates(selectedCandidateIds)
      showToast({ tone: 'success', title: `Approved ${selectedCandidateIds.length} candidates` })
    } else if (confirmAction === 'reject' && selectedCandidateIds.length > 0) {
      bulkRejectCandidates(selectedCandidateIds)
      showToast({ tone: 'success', title: `Rejected ${selectedCandidateIds.length} candidates` })
    } else if (confirmAction === 'delete' && selectedCandidateIds.length > 0) {
      bulkDeleteCandidates(selectedCandidateIds)
      showToast({ tone: 'success', title: `Deleted ${selectedCandidateIds.length} candidates` })
    }
    onClear()
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-secondary px-3 py-2">
        <span className="text-caption font-medium text-text-primary">
          {selectedIds.size} selected
        </span>

        <Button
          size="sm"
          variant="outline"
          leftIcon={CheckCircle2}
          onClick={() => setConfirmAction('approve')}
          disabled={selectedCandidateIds.length === 0}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          leftIcon={XCircle}
          onClick={() => setConfirmAction('reject')}
          disabled={selectedCandidateIds.length === 0}
        >
          Reject
        </Button>
        <Button
          size="sm"
          variant="outline"
          leftIcon={Download}
          onClick={() =>
            showToast({
              tone: 'info',
              title: 'Export coming soon',
              description: 'Not wired up in this phase yet.',
            })
          }
        >
          Export
        </Button>
        <Button
          size="sm"
          variant="destructive"
          leftIcon={Trash2}
          onClick={() => setConfirmAction('delete')}
          disabled={selectedCandidateIds.length === 0}
        >
          Delete
        </Button>

        <div className="flex items-center gap-1.5">
          <Select
            value={statusValue}
            onValueChange={(value) => setStatusValue(value as NodeStatus)}
            options={STATUS_OPTIONS}
            size="sm"
            aria-label="Bulk status"
            className="w-32"
          />
          <Button
            size="sm"
            variant="outline"
            disabled={selectedExistingIds.length === 0}
            onClick={() => {
              bulkChangeStatus(selectedExistingIds, statusValue)
              showToast({
                tone: 'success',
                title: `Updated status for ${selectedExistingIds.length} nodes`,
              })
              onClear()
            }}
          >
            Set status
          </Button>
        </div>

        <div className="flex items-center gap-1.5">
          <Select
            value={providerValue}
            onValueChange={(value) => setProviderValue(value as Provider)}
            options={PROVIDERS.map((provider) => ({ value: provider, label: provider }))}
            size="sm"
            aria-label="Bulk provider"
            className="w-40"
          />
          <Button
            size="sm"
            variant="outline"
            disabled={selectedExistingIds.length === 0}
            onClick={() => {
              bulkAssignProvider(selectedExistingIds, providerValue)
              showToast({
                tone: 'success',
                title: `Assigned provider for ${selectedExistingIds.length} nodes`,
              })
              onClear()
            }}
          >
            Assign
          </Button>
        </div>

        <IconButton
          icon={X}
          label="Clear selection"
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="ml-auto"
        />
      </div>

      <ConfirmDialog
        open={confirmAction === 'approve'}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={`Approve ${selectedCandidateIds.length} candidates?`}
        confirmLabel="Approve"
        onConfirm={runConfirmed}
      />
      <ConfirmDialog
        open={confirmAction === 'reject'}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={`Reject ${selectedCandidateIds.length} candidates?`}
        confirmLabel="Reject"
        tone="destructive"
        onConfirm={runConfirmed}
      />
      <ConfirmDialog
        open={confirmAction === 'delete'}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={`Delete ${selectedCandidateIds.length} candidates?`}
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={runConfirmed}
      />
    </>
  )
}
