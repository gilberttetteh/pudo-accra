import { Polygon, Tooltip as LeafletTooltip } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { MOCK_ACCESSIBILITY_ZONES } from '@/mock/accessibility'
import { LAYER_DEFINITIONS } from '@/constants/map'
import { scoreToHeatmapColor } from '@/utils/color'

/**
 * Purpose
 * -------
 * Renders per-neighbourhood accessibility zone polygons, colored by
 * accessibility score (reusing the same low/mid/high gradient as the
 * coverage heatmap for visual consistency across "score-colored" map
 * layers).
 *
 * Props
 * -----
 * None — self-contained, reads mapStore directly.
 *
 * Example usage
 * -------------
 * <AccessibilityLayer /> // inside <MapContainer>
 *
 * Accessibility
 * -------------
 * N/A.
 *
 * Future extension
 * -----------------
 * Replace MOCK_ACCESSIBILITY_ZONES with a real composite accessibility
 * index (road density + terrain + isochrone area) once available.
 */
const definition = LAYER_DEFINITIONS.find((layer) => layer.id === 'accessibility-zones')!

export function AccessibilityLayer() {
  const visible = useMapStore((state) => state.activeLayers['accessibility-zones'])
  const opacity = useMapStore((state) => state.layerOpacity['accessibility-zones'])
  const zoom = useMapStore((state) => state.zoom)

  if (!visible || zoom < definition.minZoom || zoom > definition.maxZoom) return null

  return (
    <>
      {MOCK_ACCESSIBILITY_ZONES.map((zone) => (
        <Polygon
          key={zone.id}
          positions={zone.positions}
          pathOptions={{
            stroke: false,
            fillColor: scoreToHeatmapColor(zone.accessibilityScore),
            fillOpacity: 0.35 * opacity,
          }}
        >
          <LeafletTooltip sticky>
            {zone.neighbourhood} — {Math.round(zone.accessibilityScore * 100)}% accessible
          </LeafletTooltip>
        </Polygon>
      ))}
    </>
  )
}
