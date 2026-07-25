import { Polygon, Tooltip as LeafletTooltip } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { MOCK_COVERAGE_POLYGONS } from '@/mock/coverage'
import { LAYER_DEFINITIONS } from '@/constants/map'

/**
 * Purpose
 * -------
 * Renders the Coverage Areas layer's mock service-radius polygons.
 * Self-contained, same rationale as RoadLayer/FloodLayer.
 *
 * Props
 * -----
 * None.
 *
 * Example usage
 * -------------
 * <CoverageLayer /> // inside <MapContainer>
 *
 * Accessibility
 * -------------
 * N/A.
 *
 * Future extension
 * -----------------
 * Swap MOCK_COVERAGE_POLYGONS for CoverageService-computed polygons
 * once the backend's spatial analysis pipeline exists.
 */
const definition = LAYER_DEFINITIONS.find((layer) => layer.id === 'coverage-areas')!

export function CoverageLayer() {
  const visible = useMapStore((state) => state.activeLayers['coverage-areas'])
  const opacity = useMapStore((state) => state.layerOpacity['coverage-areas'])
  const zoom = useMapStore((state) => state.zoom)

  if (!visible || zoom < definition.minZoom || zoom > definition.maxZoom) return null

  return (
    <>
      {MOCK_COVERAGE_POLYGONS.map((polygon) => (
        <Polygon
          key={polygon.id}
          positions={polygon.positions}
          pathOptions={{
            color: 'var(--color-primary-500)',
            weight: 1,
            fillColor: 'var(--color-primary-400)',
            fillOpacity: 0.12 * opacity * 2,
          }}
        >
          <LeafletTooltip sticky>
            {polygon.neighbourhood} — {Math.round(polygon.coverageScore * 100)}% covered
          </LeafletTooltip>
        </Polygon>
      ))}
    </>
  )
}
