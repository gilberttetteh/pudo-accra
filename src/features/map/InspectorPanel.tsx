import { IconButton } from '@/components/ui/IconButton'
import { X } from '@/components/icons'
import { NodeDetailsPanel, type NodeDetailsTarget } from '@/features/nodes/NodeDetailsPanel'
import { GapInspectorPanel } from '@/features/map/coverage/GapInspectorPanel'
import type { CoverageGap } from '@/mock/coverageGaps'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The Map Workspace's right panel shell — owns the collapse/expand
 * width animation and the close button, delegating content to either
 * NodeDetailsPanel (node selected) or GapInspectorPanel (coverage gap
 * selected — Phase 6's "Coverage Inspector"). mapStore guarantees these
 * two selections are mutually exclusive (selecting one clears the
 * other), so at most one of `node`/`gap` is ever set. Renders nothing
 * (width collapses to 0) when neither is selected.
 *
 * Props
 * -----
 * - node: NodeDetailsTarget | null
 * - gap: CoverageGap | null
 * - onClose: () => void
 *
 * Example usage
 * -------------
 * <InspectorPanel node={selectedNode} gap={selectedGap} onClose={handleClose} />
 *
 * Accessibility
 * -------------
 * Landmark `<aside aria-label="Selection details">`; close button has
 * an explicit label.
 *
 * Future extension
 * -----------------
 * None anticipated — this shell is intentionally thin.
 */
export type InspectorTarget = NodeDetailsTarget

export interface InspectorPanelProps {
  node: InspectorTarget | null
  gap: CoverageGap | null
  onClose: () => void
  className?: string
}

export function InspectorPanel({ node, gap, onClose, className }: InspectorPanelProps) {
  const hasContent = !!node || !!gap

  return (
    <aside
      aria-label="Selection details"
      className={cn(
        'flex h-full flex-col overflow-hidden border-l border-border bg-surface transition-[width] duration-(--duration-base) ease-(--ease-standard)',
        hasContent ? 'w-96' : 'w-0 border-l-0',
        className
      )}
    >
      {hasContent && (
        <>
          <div className="flex items-center justify-between border-b border-border p-3">
            <p className="text-small font-semibold text-text-primary">
              {gap ? 'Coverage Inspector' : 'Node Details'}
            </p>
            <IconButton
              icon={X}
              label="Close inspector"
              variant="ghost"
              size="sm"
              onClick={onClose}
            />
          </div>
          <div className="min-h-0 flex-1">
            {gap ? <GapInspectorPanel gap={gap} /> : node ? <NodeDetailsPanel node={node} /> : null}
          </div>
        </>
      )}
    </aside>
  )
}
