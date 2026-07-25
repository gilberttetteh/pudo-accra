import { Polygon, Tooltip as LeafletTooltip } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { MOCK_FLOOD_ZONES } from '@/mock/floodZones'
import { LAYER_DEFINITIONS } from '@/constants/map'

/**
 * Purpose
 * -------
 * Renders the Flood Zones layer's mock risk polygons. Self-contained,
 * same rationale as RoadLayer — subscribes only to this layer's own
 * visibility/opacity plus zoom.
 *
 * Props
 * -----
 * None.
 *
 * Example usage
 * -------------
 * <FloodLayer /> // inside <MapContainer>
 *
 * Accessibility
 * -------------
 * N/A.
 *
 * Future extension
 * -----------------
 * Swap MOCK_FLOOD_ZONES for real hydrological risk data once available.
 */
const definition = LAYER_DEFINITIONS.find((layer) => layer.id === 'flood-zones')!
const RISK_STROKE: Record<string, string> = {
  moderate: 'var(--color-warning-400)',
  high: 'var(--color-warning-600)',
  severe: 'var(--color-error-600)',
}
const RISK_FILL_OPACITY: Record<string, number> = { moderate: 0.12, high: 0.2, severe: 0.28 }

export function FloodLayer() {
  const visible = useMapStore((state) => state.activeLayers['flood-zones'])
  const opacity = useMapStore((state) => state.layerOpacity['flood-zones'])
  const zoom = useMapStore((state) => state.zoom)

  if (!visible || zoom < definition.minZoom || zoom > definition.maxZoom) return null

  return (
    <>
      {MOCK_FLOOD_ZONES.map((zone) => (
        <Polygon
          key={zone.id}
          positions={zone.positions}
          pathOptions={{
            color: RISK_STROKE[zone.riskLevel],
            weight: 1.5,
            fillColor: 'var(--color-error-500)',
            fillOpacity: RISK_FILL_OPACITY[zone.riskLevel] * opacity,
          }}
        >
          <LeafletTooltip sticky>
            {zone.label} — {zone.riskLevel} risk
          </LeafletTooltip>
        </Polygon>
      ))}
    </>
  )
}
