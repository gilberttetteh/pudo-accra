import { useCallback, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { NodeListRow } from './NodeListRow'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useMapStore } from '@/store/mapStore'
import { useViewportController } from '@/features/map/viewportController'
import type { CombinedNode, NodeListRowData } from './types'

/**
 * Purpose
 * -------
 * Virtualized (via @tanstack/react-virtual) list of nodes — only rows
 * actually in/near the viewport are mounted, so this scales to
 * thousands of nodes without the browser choking, per Phase 5's
 * "implement a virtualized list for scalability" requirement.
 *
 * Supports: hover (syncs mapStore.hoveredNodeId both ways), single
 * selection (mapStore.selectedNodeId), multi-selection (local Set,
 * lifted to NodeManagementPanel for BulkActionsBar), keyboard
 * navigation (roving tabindex — ArrowUp/Down moves focus, Enter selects
 * + zooms map, Space toggles multi-select), context menu (delegates to
 * mapStore.openContextMenu, reusing MapContextMenuHost), and
 * double-click-to-focus-map (via useViewportController).
 *
 * Props
 * -----
 * - rows: NodeListRowData[] — pre-grouped/sorted by the caller
 * - multiSelectedIds: Set<string> / onToggleMultiSelect: (id) => void
 * - onContextMenu: (node, event) => void
 *
 * Example usage
 * -------------
 * <NodeList rows={groupedRows} multiSelectedIds={selectedIds}
 *   onToggleMultiSelect={toggleId} onContextMenu={openMenu} />
 *
 * Accessibility
 * -------------
 * Container has `role="listbox"` + `aria-multiselectable`; each node row
 * is `role="option"` with `aria-selected`. Roving tabindex means only
 * one row is ever a Tab stop, with arrow keys moving focus — the
 * standard listbox keyboard pattern (WAI-ARIA APG).
 *
 * Future extension
 * -----------------
 * Add sticky group headers (react-virtual supports this) once group
 * lists get long enough that losing the header on scroll is confusing.
 */
export interface NodeListProps {
  rows: NodeListRowData[]
  multiSelectedIds: Set<string>
  onToggleMultiSelect: (id: string) => void
  onContextMenu: (node: CombinedNode, event: { clientX: number; clientY: number }) => void
}

export function NodeList({
  rows,
  multiSelectedIds,
  onToggleMultiSelect,
  onContextMenu,
}: NodeListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [focusedId, setFocusedId] = useState<string | null>(null)

  const selectedNodeId = useMapStore((state) => state.selectedNodeId)
  const hoveredNodeId = useMapStore((state) => state.hoveredNodeId)
  const selectNode = useMapStore((state) => state.selectNode)
  const hoverNode = useMapStore((state) => state.hoverNode)
  const viewport = useViewportController()

  const nodeRowIndices = useMemo(
    () =>
      rows.map((row, index) => (row.type === 'node' ? index : -1)).filter((index) => index >= 0),
    [rows]
  )

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (rows[index]?.type === 'header' ? 32 : 84),
    overscan: 8,
  })

  const focusRowAt = useCallback(
    (rowIndex: number) => {
      const row = rows[rowIndex]
      if (row?.type !== 'node') return
      setFocusedId(row.node.id)
      virtualizer.scrollToIndex(rowIndex, { align: 'auto' })
    },
    [rows, virtualizer]
  )

  const handleKeyDown = (event: KeyboardEvent) => {
    const currentRowIndex = rows.findIndex(
      (row) => row.type === 'node' && row.node.id === focusedId
    )
    const currentPosition = nodeRowIndices.indexOf(currentRowIndex)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = nodeRowIndices[Math.min(nodeRowIndices.length - 1, currentPosition + 1)]
      if (next !== undefined) focusRowAt(next)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      const prev = nodeRowIndices[Math.max(0, currentPosition - 1)]
      if (prev !== undefined) focusRowAt(prev)
    } else if (event.key === 'Enter' && focusedId) {
      event.preventDefault()
      const row = rows.find((r) => r.type === 'node' && r.node.id === focusedId)
      if (row?.type === 'node') {
        selectNode(row.node.id)
        viewport.zoomToNode(row.node.position)
      }
    } else if (event.key === ' ' && focusedId) {
      event.preventDefault()
      onToggleMultiSelect(focusedId)
    }
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No nodes match your filters"
        description="Try adjusting search, filters, or sort."
      />
    )
  }

  return (
    <div
      ref={parentRef}
      role="listbox"
      aria-multiselectable="true"
      aria-label="Nodes"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={() => {
        if (!focusedId && nodeRowIndices.length > 0) focusRowAt(nodeRowIndices[0]!)
      }}
      className="h-full overflow-y-auto outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-500"
    >
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index]!
          const style: CSSProperties = { transform: `translateY(${virtualRow.start}px)` }

          if (row.type === 'header') {
            return (
              <div
                key={virtualRow.key}
                style={style}
                className="absolute left-0 top-0 flex w-full items-center gap-2 bg-surface-secondary px-3 py-1.5 text-caption font-semibold uppercase tracking-wide text-text-tertiary"
              >
                {row.label}
                <span className="text-text-tertiary/70">({row.count})</span>
              </div>
            )
          }

          const node = row.node
          return (
            <NodeListRow
              key={virtualRow.key}
              node={node}
              style={style}
              isSelected={node.id === selectedNodeId}
              isHovered={node.id === hoveredNodeId}
              isFocused={node.id === focusedId}
              isMultiSelected={multiSelectedIds.has(node.id)}
              onSelect={() => {
                setFocusedId(node.id)
                selectNode(node.id)
              }}
              onHover={(hovered) => hoverNode(hovered ? node.id : null)}
              onDoubleClick={() => {
                selectNode(node.id)
                viewport.zoomToNode(node.position)
              }}
              onContextMenu={(event) => onContextMenu(node, event)}
              onToggleMultiSelect={() => onToggleMultiSelect(node.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
