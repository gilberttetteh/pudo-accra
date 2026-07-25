import { useMemo, useState } from 'react'
import { SearchInput } from '@/components/forms/SearchInput'
import { Select } from '@/components/forms/Select'
import { IconButton } from '@/components/ui/IconButton'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/forms/Checkbox'
import { Label } from '@/components/forms/Label'
import { NodeList } from './NodeList'
import { BulkActionsBar } from './BulkActionsBar'
import { CreateCandidateForm } from './forms/CreateCandidateForm'
import { useMapStore } from '@/store/mapStore'
import { useNodeStore } from '@/store/nodeStore'
import { useToast } from '@/components/feedback/Toast'
import { ArrowUp, ArrowDown, Plus } from '@/components/icons'
import {
  SORT_FIELD_OPTIONS,
  GROUP_FIELD_OPTIONS,
  type NodeSortField,
  type SortDirection,
  type NodeGroupField,
  type CombinedNode,
} from './types'
import { sortCombinedNodes, groupCombinedNodes } from './filtering'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The Node Management tab's full toolset: search (shares state with the
 * map's top search bar — see MapWorkspace), sort, group, multi-select
 * with BulkActionsBar, and the virtualized NodeList. This is the
 * "synchronized left panel dedicated to node management" from Phase 5's
 * spec.
 *
 * Props
 * -----
 * - existingNodes / candidateNodes: CombinedNode[] — already filtered by
 *   MapWorkspace's shared NodeFilters + search query, so this component
 *   only handles sort/group/selection, not filtering itself.
 * - searchQuery / onSearchChange: shared with MapWorkspaceToolbar's
 *   MapSearch so typing in either box updates both Map and List.
 * - onRowContextMenu: (node, event) => void
 *
 * Example usage
 * -------------
 * <NodeManagementPanel combinedNodes={filteredCombined}
 *   searchQuery={query} onSearchChange={setQuery}
 *   onRowContextMenu={openRowMenu} />
 *
 * Accessibility
 * -------------
 * Delegates to NodeList's listbox pattern; sort direction toggle is a
 * labeled IconButton.
 *
 * Future extension
 * -----------------
 * Persist sort/group preference to localStorage, mirroring the
 * Sidebar's collapsed-state persistence from Phase 3.
 */
export interface NodeManagementPanelProps {
  combinedNodes: CombinedNode[]
  existingIds: Set<string>
  candidateIds: Set<string>
  searchQuery: string
  onSearchChange: (value: string) => void
  onRowContextMenu: (node: CombinedNode, event: { clientX: number; clientY: number }) => void
}

export function NodeManagementPanel({
  combinedNodes,
  existingIds,
  candidateIds,
  searchQuery,
  onSearchChange,
  onRowContextMenu,
}: NodeManagementPanelProps) {
  const [sortField, setSortField] = useState<NodeSortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [groupField, setGroupField] = useState<NodeGroupField>('none')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectAllVisible, setSelectAllVisible] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const selectNode = useMapStore((state) => state.selectNode)
  const addCandidate = useNodeStore((state) => state.addCandidate)
  const { showToast } = useToast()

  const rows = useMemo(() => {
    const sorted = sortCombinedNodes(combinedNodes, sortField, sortDirection)
    return groupCombinedNodes(sorted, groupField)
  }, [combinedNodes, sortField, sortDirection, groupField])

  const toggleMultiSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectAllVisible) {
      setSelectedIds(new Set())
      setSelectAllVisible(false)
    } else {
      setSelectedIds(new Set(combinedNodes.map((node) => node.id)))
      setSelectAllVisible(true)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-2.5 border-b border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-caption font-semibold uppercase tracking-wide text-text-tertiary">
            Node Management
          </p>
          <Button size="sm" variant="outline" leftIcon={Plus} onClick={() => setIsCreateOpen(true)}>
            Add candidate
          </Button>
        </div>

        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          onClear={() => onSearchChange('')}
          placeholder="Search name, area, provider, status…"
          size="sm"
        />

        <div className="flex items-center gap-1.5">
          <Select
            value={sortField}
            onValueChange={(value) => setSortField(value as NodeSortField)}
            options={SORT_FIELD_OPTIONS}
            size="sm"
            aria-label="Sort by"
            className="flex-1"
          />
          <IconButton
            icon={sortDirection === 'asc' ? ArrowUp : ArrowDown}
            label={sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'}
            variant="outline"
            size="sm"
            onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
          />
        </div>

        <Select
          value={groupField}
          onValueChange={(value) => setGroupField(value as NodeGroupField)}
          options={GROUP_FIELD_OPTIONS}
          size="sm"
          aria-label="Group by"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all-nodes"
              checked={selectAllVisible}
              onCheckedChange={toggleSelectAll}
            />
            <Label htmlFor="select-all-nodes" className="cursor-pointer text-caption font-normal">
              Select all ({combinedNodes.length})
            </Label>
          </div>
          <span className="text-caption text-text-tertiary">{combinedNodes.length} results</span>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <BulkActionsBar
          selectedIds={selectedIds}
          existingIds={existingIds}
          candidateIds={candidateIds}
          onClear={() => {
            setSelectedIds(new Set())
            setSelectAllVisible(false)
          }}
        />
      )}

      <div className={cn('min-h-0 flex-1')}>
        <NodeList
          rows={rows}
          multiSelectedIds={selectedIds}
          onToggleMultiSelect={toggleMultiSelect}
          onContextMenu={(node, event) => {
            selectNode(node.id)
            onRowContextMenu(node, event)
          }}
        />
      </div>

      <CreateCandidateForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={(values) => {
          const id = `candidate-manual-${Date.now()}`
          addCandidate({
            id,
            name: values.name,
            neighbourhood: values.neighbourhood,
            position: [values.latitude, values.longitude],
            status: 'proposed',
            provider: values.provider,
            suitabilityScore: 0.5,
            accessibilityScore: 0.5,
            nearestRoadDistanceMeters: 200,
            riskLevel: 'low',
            estimatedCoverageGain: 0.1,
            address: values.address,
            lastUpdated: new Date().toISOString(),
          })
          selectNode(id)
          showToast({ tone: 'success', title: 'Candidate created', description: values.name })
        }}
      />
    </div>
  )
}
