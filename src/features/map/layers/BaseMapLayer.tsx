import { TileLayer } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { BASEMAPS } from '@/constants/map'

/**
 * Purpose
 * -------
 * The bottom of the layer stack — renders the active tile provider.
 * Self-contained: reads `basemap` from mapStore directly rather than
 * receiving it as a prop, so switching basemaps only re-renders this
 * one layer, not the whole MapCanvas tree.
 *
 * Props
 * -----
 * None.
 *
 * Example usage
 * -------------
 * <MapContainer hideDefaultBasemap>
 *   <BaseMapLayer />
 *   <RoadLayer />
 *   ...
 * </MapContainer>
 *
 * Accessibility
 * -------------
 * N/A — visual tile imagery only.
 *
 * Future extension
 * -----------------
 * Add real Satellite/Terrain tile providers once an API key is
 * configured (see BASEMAPS' `isPlaceholder` flag in constants/map.ts).
 */
export function BaseMapLayer() {
  const basemap = useMapStore((state) => state.basemap)
  const activeBasemap = BASEMAPS[basemap]

  return (
    <TileLayer
      key={activeBasemap.id}
      attribution={activeBasemap.attribution}
      url={activeBasemap.url}
    />
  )
}
