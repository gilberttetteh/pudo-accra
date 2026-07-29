import { GeoJSON } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { LAYER_DEFINITIONS } from '@/constants/map'
import { useBoundary } from '@/hooks/usePlannerData'

/**
 * Purpose
 * -------
 * Outlines the study area the analysis actually covers: the Greater Accra
 * Region plus Kasoa (Awutu Senya East), assembled from OSM administrative
 * boundaries by the pipeline and treated as one region throughout.
 *
 * Worth having on screen because it's the honest edge of the result — no
 * claim the dashboard makes about coverage applies outside this line.
 *
 * Example usage
 * -------------
 * <StudyAreaLayer />  // inside <MapContainer>; reads its own data
 */
const definition = LAYER_DEFINITIONS.find((layer) => layer.id === 'study-area')!

export function StudyAreaLayer() {
  const visible = useMapStore((state) => state.activeLayers['study-area'])
  const zoom = useMapStore((state) => state.zoom)
  const { data } = useBoundary()

  if (!visible || !data || zoom < definition.minZoom || zoom > definition.maxZoom) return null

  return (
    <GeoJSON
      // Outline only: this sits under every other layer and must not tint them.
      data={data}
      style={{ color: '#6366f1', weight: 2, opacity: 0.9, fill: false, dashArray: '6 4' }}
    />
  )
}
