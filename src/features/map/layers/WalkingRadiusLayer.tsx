import { Circle, Tooltip as LeafletTooltip } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { LAYER_DEFINITIONS } from '@/constants/map'
import { formatDistance } from '@/utils/formatters'
import type { MockNode, MockCandidateNode } from '@/mock/nodes'

/**
 * Purpose
 * -------
 * A single fixed-radius "what's within X meters" buffer around the
 * selected node — a quick-glance complement to the multi-band
 * IsochroneLayer (which shows four time-based rings). Distinct use
 * case: this answers "what's physically nearby" (as-the-crow-flies),
 * while Isochrones answer "what's within a walking time" (network
 * approximation).
 *
 * Props
 * -----
 * - existingNodes / candidateNodes: to resolve the selected node's position
 * - radiusMeters: number (default 500)
 *
 * Example usage
 * -------------
 * <WalkingRadiusLayer existingNodes={nodes} candidateNodes={candidates} />
 *
 * Accessibility
 * -------------
 * N/A.
 *
 * Future extension
 * -----------------
 * Add a radius slider control in the Coverage panel once multiple
 * preset buffer sizes are needed.
 */
const definition = LAYER_DEFINITIONS.find((layer) => layer.id === 'walking-radius')!
const DEFAULT_RADIUS_METERS = 500

export function WalkingRadiusLayer({
  existingNodes,
  candidateNodes,
  radiusMeters = DEFAULT_RADIUS_METERS,
}: {
  existingNodes: MockNode[]
  candidateNodes: MockCandidateNode[]
  radiusMeters?: number
}) {
  const visible = useMapStore((state) => state.activeLayers['walking-radius'])
  const opacity = useMapStore((state) => state.layerOpacity['walking-radius'])
  const zoom = useMapStore((state) => state.zoom)
  const selectedNodeId = useMapStore((state) => state.selectedNodeId)

  const selected =
    existingNodes.find((node) => node.id === selectedNodeId) ??
    candidateNodes.find((node) => node.id === selectedNodeId)

  if (!visible || !selected || zoom < definition.minZoom || zoom > definition.maxZoom) return null

  return (
    <Circle
      center={selected.position}
      radius={radiusMeters}
      pathOptions={{
        color: 'var(--color-secondary-500)',
        weight: 1.5,
        fillColor: 'var(--color-secondary-400)',
        fillOpacity: 0.15 * opacity,
      }}
    >
      <LeafletTooltip sticky>
        {formatDistance(radiusMeters)} radius from {selected.name}
      </LeafletTooltip>
    </Circle>
  )
}
