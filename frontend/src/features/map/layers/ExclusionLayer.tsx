import { GeoJSON } from 'react-leaflet'
import type { Layer } from 'leaflet'
import type { Feature } from 'geojson'
import { useMapStore } from '@/store/mapStore'
import { LAYER_DEFINITIONS } from '@/constants/map'
import { useExclusions } from '@/hooks/usePlannerData'

/**
 * Purpose
 * -------
 * Shows where a PUDO node may *not* go — water, wetland, industrial land,
 * military zones, airports, cemeteries and landfill, each buffered by 25 m
 * in the pipeline before candidate sites were generated.
 *
 * This is the layer that explains the gaps. When a stretch of the map has no
 * sites on it, the usual reason is that siting was forbidden there, not that
 * the solver missed it — turning this on makes that visible instead of
 * leaving it to be argued about.
 *
 * Example usage
 * -------------
 * <ExclusionLayer />  // inside <MapContainer>; reads its own data
 */
const definition = LAYER_DEFINITIONS.find((layer) => layer.id === 'exclusion-zones')!

/** Matches the palette used by the Streamlit explorer in analysis/app.py, so
 *  the same category reads the same colour in both tools. */
const CATEGORY_COLORS: Record<string, string> = {
  water: '#2e86de',
  wetland: '#48c9b0',
  industrial: '#95a5a6',
  military: '#e74c3c',
  airport: '#9b59b6',
  cemetery: '#7f8c8d',
  landfill: '#d35400',
}

const FALLBACK_COLOR = '#78788c'

function categoryOf(feature?: Feature): string {
  const category = feature?.properties?.category
  return typeof category === 'string' ? category : 'other'
}

export function ExclusionLayer() {
  const visible = useMapStore((state) => state.activeLayers['exclusion-zones'])
  const zoom = useMapStore((state) => state.zoom)
  const { data } = useExclusions()

  if (!visible || !data || zoom < definition.minZoom || zoom > definition.maxZoom) return null

  const bindCategoryTooltip = (feature: Feature, layer: Layer) => {
    layer.bindTooltip(`Excluded: ${categoryOf(feature)}`, { sticky: true })
  }

  return (
    <GeoJSON
      data={data}
      onEachFeature={bindCategoryTooltip}
      style={(feature) => {
        const color = CATEGORY_COLORS[categoryOf(feature)] ?? FALLBACK_COLOR
        return {
          color,
          weight: 1,
          opacity: 0.7,
          fillColor: color,
          fillOpacity: definition.defaultOpacity,
        }
      }}
    />
  )
}
