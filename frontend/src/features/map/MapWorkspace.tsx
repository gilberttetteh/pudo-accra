import { useEffect, useMemo, useState } from 'react'
import { MapCanvas } from './MapCanvas'
import { MapWorkspaceToolbar } from './MapWorkspaceToolbar'
import { MapSidebarPanel } from './MapSidebarPanel'
import { InspectorPanel, type InspectorTarget } from './InspectorPanel'
import { MapWorkspaceStatusBar } from './MapWorkspaceStatusBar'
import { MapContextMenuHost } from './MapContextMenuHost'
import { useViewportController } from './viewportController'
import { useMapStore } from '@/store/mapStore'
import { useNodeStore } from '@/store/nodeStore'
import {
  DEFAULT_NODE_FILTERS,
  matchesExistingNode,
  matchesCandidateNode,
  type NodeFilters,
} from '@/features/nodes/filtering'
import { toCombinedNode, type CombinedNode } from '@/features/nodes/types'
import { ACCRA_NEIGHBOURHOODS } from '@/mock'
import { MOCK_ROAD_SEGMENTS } from '@/mock/roads'
import { MOCK_COVERAGE_GAPS } from '@/mock/coverageGaps'
import { MOCK_POPULATION_CELLS } from '@/mock/population'
import { rankCandidateNodes } from '@/features/map/analysis/candidateRanking'
import { haversineDistanceMeters } from '@/utils/geo'
import type { SearchResult } from '@/store/mapStore'
import type { MapSearchSuggestion } from '@/components/map/MapSearch'

/**
 * Purpose
 * -------
 * The complete GIS Map Workspace — the primary working surface of the
 * application. Composes MapWorkspaceToolbar (top), MapSidebarPanel
 * (left, now hosting Node Management as its default tab — Phase 5),
 * MapCanvas (center), InspectorPanel (right, opens on selection, now
 * showing full NodeDetailsPanel content), MapWorkspaceStatusBar
 * (bottom), and MapContextMenuHost (right-click menu). Node **data**
 * lives in nodeStore (Phase 5) — this component only computes the
 * filtered/combined views that MapCanvas's layers and the Node
 * Management list both consume, which is what keeps map and list
 * results consistent by construction.
 *
 * Props
 * -----
 * None currently — this is the map feature's root; a future
 * DashboardLayout route will render it directly once routing exists.
 *
 * Example usage
 * -------------
 * <MapWorkspace />
 *
 * Accessibility
 * -------------
 * Delegates to its children's own landmarks; global Ctrl/Cmd+Z /
 * Ctrl/Cmd+Shift+Z keyboard shortcuts drive nodeStore's undo/redo (also
 * available as toolbar buttons).
 *
 * Future extension
 * -----------------
 * Phase 10: replace nodeStore's mock arrays with NodeService-backed
 * TanStack Query data + mutations — MapCanvas's props contract already
 * matches what query/mutation results look like.
 */
export function MapWorkspace() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [filters, setFilters] = useState<NodeFilters>(DEFAULT_NODE_FILTERS)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedNodeId = useMapStore((state) => state.selectedNodeId)
  const selectNode = useMapStore((state) => state.selectNode)
  const selectedGapId = useMapStore((state) => state.selectedGapId)
  const selectGap = useMapStore((state) => state.selectGap)
  const setHighlightedNodeIds = useMapStore((state) => state.setHighlightedNodeIds)
  const setSearchResult = useMapStore((state) => state.setSearchResult)
  const openContextMenu = useMapStore((state) => state.openContextMenu)
  const viewport = useViewportController()

  const existingNodes = useNodeStore((state) => state.existingNodes)
  const candidateNodes = useNodeStore((state) => state.candidateNodes)
  const undo = useNodeStore((state) => state.undo)
  const redo = useNodeStore((state) => state.redo)

  // Global undo/redo keyboard shortcuts, per Phase 5's "use the existing
  // EventBus" undo/redo requirement — nodeStore's command stack is what
  // actually implements it (see store/nodeStore.ts); this just wires the
  // keys, matching the same pattern CommandPalette uses for Cmd/Ctrl+K.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const filteredExistingNodes = useMemo(
    () => existingNodes.filter((node) => matchesExistingNode(node, filters, searchQuery)),
    [existingNodes, filters, searchQuery]
  )

  const filteredCandidateNodes = useMemo(
    () => candidateNodes.filter((node) => matchesCandidateNode(node, filters, searchQuery)),
    [candidateNodes, filters, searchQuery]
  )

  const combinedNodes: CombinedNode[] = useMemo(
    () => [
      ...filteredExistingNodes.map((node) => toCombinedNode(node, 'existing')),
      ...filteredCandidateNodes.map((node) => toCombinedNode(node, 'candidate')),
    ],
    [filteredExistingNodes, filteredCandidateNodes]
  )

  const existingIds = useMemo(
    () => new Set(filteredExistingNodes.map((n) => n.id)),
    [filteredExistingNodes]
  )
  const candidateIds = useMemo(
    () => new Set(filteredCandidateNodes.map((n) => n.id)),
    [filteredCandidateNodes]
  )

  const inspectorTarget: InspectorTarget | null = useMemo(() => {
    if (!selectedNodeId) return null
    const existing = existingNodes.find((node) => node.id === selectedNodeId)
    if (existing) return { kind: 'existing', ...existing }
    const candidate = candidateNodes.find((node) => node.id === selectedNodeId)
    if (candidate) return { kind: 'candidate', ...candidate }
    return null
  }, [selectedNodeId, existingNodes, candidateNodes])

  const selectedGap = useMemo(
    () => MOCK_COVERAGE_GAPS.find((gap) => gap.id === selectedGapId) ?? null,
    [selectedGapId]
  )

  // Phase 6 Step 7 — "Selecting a coverage gap -> highlights nearby nodes
  // -> highlights candidate recommendations -> zooms map -> updates
  // Inspector." Centralized here (rather than duplicated in every
  // trigger — CoverageGapLayer's map click, CoverageGapsSection's list
  // click) so gap selection behaves identically no matter where it's
  // triggered from. InspectorPanel updates automatically since it reads
  // `selectedGap` from this same computation.
  useEffect(() => {
    if (!selectedGap) {
      setHighlightedNodeIds(new Set())
      return
    }

    const nearbyNodeIds = existingNodes
      .filter((node) => haversineDistanceMeters(selectedGap.position, node.position) < 2000)
      .map((node) => node.id)

    const rankedCandidates = rankCandidateNodes(
      candidateNodes,
      existingNodes.map((node) => node.position),
      MOCK_POPULATION_CELLS
    )
    const recommendedCandidateIds = rankedCandidates
      .filter(
        (entry) => haversineDistanceMeters(selectedGap.position, entry.candidate.position) < 3000
      )
      .slice(0, 3)
      .map((entry) => entry.candidate.id)

    setHighlightedNodeIds(new Set([...nearbyNodeIds, ...recommendedCandidateIds]))
    viewport.flyToLocation(selectedGap.position, 14)
    // existingNodes/candidateNodes/viewport intentionally omitted: this
    // effect should only re-run when the *selected gap* changes, not on
    // every node data refresh (which would repeatedly re-fly the map).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGap])

  const handleRowContextMenu = (
    node: CombinedNode,
    event: { clientX: number; clientY: number }
  ) => {
    openContextMenu({
      targetType: node.kind === 'existing' ? 'node' : 'candidate',
      targetId: node.id,
      mapPosition: node.position,
      screenPosition: { x: event.clientX, y: event.clientY },
    })
  }

  const searchSuggestions: MapSearchSuggestion[] = useMemo(() => {
    if (searchQuery.trim().length < 2) return []
    const query = searchQuery.toLowerCase()
    const results: MapSearchSuggestion[] = []

    for (const node of existingNodes) {
      if (results.length >= 8) break
      if (node.name.toLowerCase().includes(query)) {
        results.push({ id: `node:${node.id}`, label: node.name, sublabel: 'Existing node' })
      }
    }
    for (const node of candidateNodes) {
      if (results.length >= 8) break
      if (node.name.toLowerCase().includes(query)) {
        results.push({ id: `candidate:${node.id}`, label: node.name, sublabel: 'Candidate node' })
      }
    }
    for (const road of MOCK_ROAD_SEGMENTS) {
      if (results.length >= 8) break
      if (road.name.toLowerCase().includes(query)) {
        results.push({ id: `road:${road.id}`, label: road.name, sublabel: 'Road' })
      }
    }
    for (const area of ACCRA_NEIGHBOURHOODS) {
      if (results.length >= 8) break
      if (area.name.toLowerCase().includes(query)) {
        results.push({ id: `area:${area.name}`, label: area.name, sublabel: 'Area' })
      }
    }

    return results
  }, [searchQuery, existingNodes, candidateNodes])

  const handleSelectSuggestion = (id: string) => {
    const [type, ...rest] = id.split(':')
    const key = rest.join(':')
    let result: SearchResult | null = null

    if (type === 'node') {
      const node = existingNodes.find((n) => n.id === key)
      if (node) {
        result = { id, label: node.name, type: 'node', position: node.position }
        selectNode(node.id)
      }
    } else if (type === 'candidate') {
      const node = candidateNodes.find((n) => n.id === key)
      if (node) {
        result = { id, label: node.name, type: 'node', position: node.position }
        selectNode(node.id)
      }
    } else if (type === 'road') {
      const road = MOCK_ROAD_SEGMENTS.find((r) => r.id === key)
      if (road) result = { id, label: road.name, type: 'road', position: road.positions[0]! }
    } else if (type === 'area') {
      const area = ACCRA_NEIGHBOURHOODS.find((a) => a.name === key)
      if (area) result = { id, label: area.name, type: 'area', position: [area.lat, area.lng] }
    }

    if (result) setSearchResult(result)
    setSearchQuery('')
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <MapWorkspaceToolbar
        sidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchSuggestions={searchSuggestions}
        onSelectSuggestion={handleSelectSuggestion}
      />

      <div className="flex min-h-0 flex-1">
        {isSidebarOpen && (
          <MapSidebarPanel
            filters={filters}
            onFiltersChange={setFilters}
            combinedNodes={combinedNodes}
            existingIds={existingIds}
            candidateIds={candidateIds}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRowContextMenu={handleRowContextMenu}
            className="hidden md:flex"
          />
        )}

        <div className="min-w-0 flex-1">
          <MapCanvas
            existingNodes={filteredExistingNodes}
            candidateNodes={filteredCandidateNodes}
            onToggleLayerPanel={() => setIsSidebarOpen((current) => !current)}
          />
        </div>

        <InspectorPanel
          node={inspectorTarget}
          gap={selectedGap}
          onClose={() => {
            selectNode(null)
            selectGap(null)
          }}
          className="hidden lg:flex"
        />
      </div>

      <MapWorkspaceStatusBar />

      <MapContextMenuHost />
    </div>
  )
}
