import { CircleMarker } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { MOCK_POPULATION_CELLS } from '@/mock/population'
import { LAYER_DEFINITIONS } from '@/constants/map'
import { scoreToHeatmapColor } from '@/utils/color'

/**
 * Purpose
 * -------
 * Renders the mock population-density grid as colored circles sized by
 * density — a stand-in for a real raster/choropleth layer that would
 * come from a population dataset (WorldPop/GHSL) via PostGIS. Density
 * is normalized against the grid's own max for color, so the visual
 * always reflects the current dataset's actual spread.
 *
 * Props
 * -----
 * None — self-contained, reads mapStore directly.
 *
 * Example usage
 * -------------
 * <PopulationDensityLayer /> // inside <MapContainer>
 *
 * Accessibility
 * -------------
 * N/A.
 *
 * Future extension
 * -----------------
 * Replace CircleMarker grid with a real raster tile layer or a
 * choropleth polygon layer once real population-boundary data exists.
 */
const definition = LAYER_DEFINITIONS.find((layer) => layer.id === 'population-density')!
const maxDensity = Math.max(...MOCK_POPULATION_CELLS.map((cell) => cell.densityPerKm2))

export function PopulationDensityLayer() {
  const visible = useMapStore((state) => state.activeLayers['population-density'])
  const opacity = useMapStore((state) => state.layerOpacity['population-density'])
  const zoom = useMapStore((state) => state.zoom)

  if (!visible || zoom < definition.minZoom || zoom > definition.maxZoom) return null

  return (
    <>
      {MOCK_POPULATION_CELLS.map((cell) => (
        <CircleMarker
          key={cell.id}
          center={cell.position}
          radius={6 + (cell.densityPerKm2 / maxDensity) * 16}
          pathOptions={{
            stroke: false,
            fillColor: scoreToHeatmapColor(cell.densityPerKm2 / maxDensity),
            fillOpacity: 0.4 * opacity,
          }}
        />
      ))}
    </>
  )
}
