import { Polygon, Tooltip as LeafletTooltip } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { MOCK_COVERAGE_GAPS } from '@/mock/coverageGaps'
import { calculateGapScore, classifyGapPriority } from '@/features/map/analysis/gapDetection'
import { LAYER_DEFINITIONS } from '@/constants/map'

/**
 * Purpose
 * -------
 * Renders coverage-gap polygons (mock/coverageGaps.ts), colored by
 * priority — computed via analysis/gapDetection.ts's pure
 * calculateGapScore/classifyGapPriority rather than a stored field, so
 * the visual always reflects the current scoring formula. Clicking a
 * gap calls mapStore.selectGap, which InspectorPanel and the Coverage
 * Analysis panel both react to (see MapWorkspace's gap-selection
 * side-effect wiring).
 *
 * Props
 * -----
 * None — self-contained, reads mapStore directly.
 *
 * Example usage
 * -------------
 * <CoverageGapLayer /> // inside <MapContainer>
 *
 * Accessibility
 * -------------
 * N/A — see MapContainer's general map accessibility note; gaps are
 * also listed (and selectable) in the Coverage Analysis panel's Gaps
 * section for non-map access.
 *
 * Future extension
 * -----------------
 * Swap MOCK_COVERAGE_GAPS for a real PostGIS-computed gap query once
 * the backend exists (see gapDetection.ts's doc comment).
 */
const PRIORITY_COLOR: Record<'high' | 'medium' | 'low', string> = {
  high: 'var(--color-error-600)',
  medium: 'var(--color-warning-500)',
  low: 'var(--color-info-400)',
}

const definition = LAYER_DEFINITIONS.find((layer) => layer.id === 'coverage-gaps')!

export function CoverageGapLayer() {
  const visible = useMapStore((state) => state.activeLayers['coverage-gaps'])
  const opacity = useMapStore((state) => state.layerOpacity['coverage-gaps'])
  const zoom = useMapStore((state) => state.zoom)
  const selectedGapId = useMapStore((state) => state.selectedGapId)
  const selectGap = useMapStore((state) => state.selectGap)

  if (!visible || zoom < definition.minZoom || zoom > definition.maxZoom) return null

  return (
    <>
      {MOCK_COVERAGE_GAPS.map((gap) => {
        const priority = classifyGapPriority(calculateGapScore(gap))
        const isSelected = gap.id === selectedGapId
        return (
          <Polygon
            key={gap.id}
            positions={gap.positions}
            eventHandlers={{ click: () => selectGap(gap.id) }}
            pathOptions={{
              color: PRIORITY_COLOR[priority],
              weight: isSelected ? 3 : 1.5,
              dashArray: isSelected ? undefined : '5 4',
              fillColor: PRIORITY_COLOR[priority],
              fillOpacity: (isSelected ? 0.4 : 0.22) * opacity,
            }}
          >
            <LeafletTooltip sticky>
              {gap.neighbourhood} — {priority} priority gap ·{' '}
              {gap.populationAffected.toLocaleString()} affected
            </LeafletTooltip>
          </Polygon>
        )
      })}
    </>
  )
}
