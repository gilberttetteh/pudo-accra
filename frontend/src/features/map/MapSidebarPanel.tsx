import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/layout/Tabs'
import { LayerControl } from '@/components/map/LayerControl'
import { Legend } from '@/components/map/Legend'
import { HeatmapLegend } from '@/components/map/HeatmapLegend'
import { LAYER_DEFINITIONS } from '@/constants/map'
import { useMapStore } from '@/store/mapStore'
import { NodeFiltersPanel } from '@/features/nodes/NodeFiltersPanel'
import { NodeManagementPanel } from '@/features/nodes/NodeManagementPanel'
import { CoverageAnalysisPanel } from '@/features/map/coverage/CoverageAnalysisPanel'
import { PlannerPanel } from '@/features/map/PlannerPanel'
import type { NodeFilters } from '@/features/nodes/filtering'
import type { CombinedNode } from '@/features/nodes/types'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The Map Workspace's left panel, now four tabs: Nodes (the Phase 5
 * node management surface — search/sort/group/bulk/list), Layers
 * (data-driven off LAYER_DEFINITIONS via LayerControl, unchanged from
 * Phase 4), Filters (the full Phase 5 filter set via NodeFiltersPanel),
 * and Legend. "Nodes" is the default tab since node management is this
 * phase's primary workflow.
 *
 * Props
 * -----
 * - filters / onFiltersChange: NodeFilters state (lifted to
 *   MapWorkspace since MapCanvas needs the filtered node lists too)
 * - combinedNodes / existingIds / candidateIds / searchQuery /
 *   onSearchChange / onRowContextMenu: passed straight through to
 *   NodeManagementPanel
 *
 * Example usage
 * -------------
 * <MapSidebarPanel filters={filters} onFiltersChange={setFilters}
 *   combinedNodes={combined} existingIds={existingIds} candidateIds={candidateIds}
 *   searchQuery={query} onSearchChange={setQuery} onRowContextMenu={openMenu} />
 *
 * Accessibility
 * -------------
 * Built on Tabs (Radix-backed); see NodeManagementPanel/NodeFiltersPanel
 * for their own a11y notes.
 *
 * Future extension
 * -----------------
 * None anticipated beyond what sub-components already note.
 */
export interface MapSidebarPanelProps {
  filters: NodeFilters
  onFiltersChange: (filters: NodeFilters) => void
  combinedNodes: CombinedNode[]
  existingIds: Set<string>
  candidateIds: Set<string>
  searchQuery: string
  onSearchChange: (value: string) => void
  onRowContextMenu: (node: CombinedNode, event: { clientX: number; clientY: number }) => void
  className?: string
}

export function MapSidebarPanel({
  filters,
  onFiltersChange,
  combinedNodes,
  existingIds,
  candidateIds,
  searchQuery,
  onSearchChange,
  onRowContextMenu,
  className,
}: MapSidebarPanelProps) {
  const activeLayers = useMapStore((state) => state.activeLayers)
  const layerOpacity = useMapStore((state) => state.layerOpacity)
  const toggleLayer = useMapStore((state) => state.toggleLayer)
  const setLayerOpacity = useMapStore((state) => state.setLayerOpacity)

  return (
    <div className={cn('flex h-full w-80 flex-col border-r border-border bg-surface', className)}>
      <Tabs defaultValue="planner" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="px-3 pt-2">
          <TabsTrigger value="planner">Planner</TabsTrigger>
          <TabsTrigger value="nodes">Nodes</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="layers">Layers</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="legend">Legend</TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="flex-1 overflow-y-auto p-4">
          <PlannerPanel />
        </TabsContent>

        <TabsContent value="nodes" className="min-h-0 flex-1 overflow-hidden pt-0">
          <NodeManagementPanel
            combinedNodes={combinedNodes}
            existingIds={existingIds}
            candidateIds={candidateIds}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onRowContextMenu={onRowContextMenu}
          />
        </TabsContent>

        <TabsContent value="coverage" className="min-h-0 flex-1 overflow-hidden pt-0">
          <CoverageAnalysisPanel />
        </TabsContent>

        <TabsContent value="layers" className="flex-1 overflow-y-auto p-4">
          <LayerControl
            className="w-full shadow-none"
            layers={LAYER_DEFINITIONS.map((layer) => ({
              id: layer.id,
              label: layer.name,
              icon: layer.icon,
              checked: activeLayers[layer.id],
              opacity: layerOpacity[layer.id],
            }))}
            onToggle={(id) => toggleLayer(id as (typeof LAYER_DEFINITIONS)[number]['id'])}
            onOpacityChange={(id, opacity) =>
              setLayerOpacity(id as (typeof LAYER_DEFINITIONS)[number]['id'], opacity)
            }
          />
        </TabsContent>

        <TabsContent value="filters" className="flex-1 overflow-y-auto p-4">
          <NodeFiltersPanel filters={filters} onFiltersChange={onFiltersChange} />
        </TabsContent>

        <TabsContent value="legend" className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-3">
            <Legend
              className="w-full shadow-none"
              items={[
                {
                  label: 'Existing Node',
                  color: 'var(--color-map-node-existing)',
                  shape: 'circle',
                },
                {
                  label: 'Candidate Node',
                  color: 'var(--color-map-node-candidate)',
                  shape: 'diamond',
                },
                { label: 'Selected', color: 'var(--color-map-node-selected)', shape: 'circle' },
              ]}
            />
            {activeLayers['coverage-gaps'] && (
              <Legend
                className="w-full shadow-none"
                items={[
                  { label: 'High priority gap', color: 'var(--color-error-600)', shape: 'square' },
                  {
                    label: 'Medium priority gap',
                    color: 'var(--color-warning-500)',
                    shape: 'square',
                  },
                  { label: 'Low priority gap', color: 'var(--color-info-400)', shape: 'square' },
                ]}
              />
            )}
            {activeLayers.heatmap && (
              <HeatmapLegend
                className="w-full shadow-none"
                minLabel="Low (0%)"
                maxLabel="High (100%)"
              />
            )}
            {activeLayers['population-density'] && (
              <HeatmapLegend
                title="Population Density"
                className="w-full shadow-none"
                minLabel="Sparse"
                maxLabel="Dense"
              />
            )}
            {activeLayers['accessibility-zones'] && (
              <HeatmapLegend
                title="Accessibility"
                className="w-full shadow-none"
                minLabel="Low"
                maxLabel="High"
              />
            )}
            {activeLayers['isochrones'] && (
              <Legend
                className="w-full shadow-none"
                items={[
                  { label: '5 min walk', color: 'var(--color-success-500)', shape: 'circle' },
                  { label: '10 min walk', color: 'var(--color-info-500)', shape: 'circle' },
                  { label: '15 min walk', color: 'var(--color-warning-500)', shape: 'circle' },
                  { label: '20 min walk', color: 'var(--color-error-500)', shape: 'circle' },
                ]}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
