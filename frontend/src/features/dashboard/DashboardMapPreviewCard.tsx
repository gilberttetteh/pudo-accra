import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { LayerControl } from '@/components/map/LayerControl'
import { X, ExternalLink } from '@/components/icons'
import { MapCanvas } from '@/features/map/MapCanvas'
import { LAYER_DEFINITIONS, type LayerId } from '@/constants/map'
import { useMapStore } from '@/store/mapStore'
import type { MockNode, MockCandidateNode } from '@/mock/nodes'

/**
 * Purpose
 * -------
 * Lightweight embedded preview of the real GIS workspace (Step 4). This
 * does NOT reimplement the map — it renders the actual `MapCanvas` (same
 * component MapWorkspace uses) inside a fixed-height card, so pan/zoom/
 * layer toggling/node selection are the exact same code path as the
 * full workspace, not a parallel "preview" implementation. Because
 * mapStore is a single global store, panning or selecting a node here
 * updates the same state the full Map Workspace reads — opening it
 * afterwards shows exactly where the planner left off.
 *
 * Props
 * -----
 * - existingNodes / candidateNodes: MockNode[] / MockCandidateNode[]
 * - onOpenMapWorkspace?: () => void — navigates to the full workspace;
 *   left as an optional no-op since Phase 7 has no router wired up yet
 *   (isolation build) — pass this in once routing exists.
 *
 * Accessibility
 * -------------
 * The "Open full workspace" button gives keyboard/screen-reader users a
 * non-map way to reach the same functionality the preview offers.
 */
export interface DashboardMapPreviewCardProps {
  existingNodes: MockNode[]
  candidateNodes: MockCandidateNode[]
  onOpenMapWorkspace?: () => void
}

export function DashboardMapPreviewCard({
  existingNodes,
  candidateNodes,
  onOpenMapWorkspace,
}: DashboardMapPreviewCardProps) {
  const [isLayerPanelOpen, setLayerPanelOpen] = useState(false)
  const activeLayers = useMapStore((state) => state.activeLayers)
  const toggleLayer = useMapStore((state) => state.toggleLayer)

  const layerItems = LAYER_DEFINITIONS.map((layer) => ({
    id: layer.id,
    label: layer.name,
    checked: activeLayers[layer.id],
    icon: layer.icon,
  }))

  return (
    <Card className="flex flex-col gap-4">
      <CardHeader className="flex-row items-start justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Map Preview</CardTitle>
          <CardDescription>Live view of the GIS workspace — pan, zoom, and select</CardDescription>
        </div>
        <Button variant="outline" size="sm" rightIcon={ExternalLink} onClick={onOpenMapWorkspace}>
          Open full workspace
        </Button>
      </CardHeader>

      <div className="relative h-[360px] w-full overflow-hidden rounded-lg border border-border">
        <MapCanvas
          existingNodes={existingNodes}
          candidateNodes={candidateNodes}
          onToggleLayerPanel={() => setLayerPanelOpen((open) => !open)}
        />

        {isLayerPanelOpen && (
          <div className="absolute right-4 top-4 z-[500] w-56 rounded-lg border border-border bg-surface p-3 shadow-floating">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-small font-medium text-text-primary">Layers</span>
              <IconButton
                icon={X}
                label="Close layer panel"
                size="sm"
                variant="ghost"
                onClick={() => setLayerPanelOpen(false)}
              />
            </div>
            <LayerControl layers={layerItems} onToggle={(id) => toggleLayer(id as LayerId)} />
          </div>
        )}
      </div>
    </Card>
  )
}
