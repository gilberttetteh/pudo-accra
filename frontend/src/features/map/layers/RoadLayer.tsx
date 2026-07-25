import { Polyline, Tooltip as LeafletTooltip } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { MOCK_ROAD_SEGMENTS } from '@/mock/roads'
import { LAYER_DEFINITIONS } from '@/constants/map'

/**
 * Purpose
 * -------
 * Renders the Road Network layer's mock polylines. Self-contained: only
 * re-renders when 'road-network' visibility/opacity or zoom crosses its
 * min/max zoom thresholds change — it doesn't subscribe to selection,
 * hover, or other layers' state at all, which matters once real road
 * data is large and this layer updates far less often than, say, cursor
 * position.
 *
 * Props
 * -----
 * None.
 *
 * Example usage
 * -------------
 * <RoadLayer /> // inside <MapContainer>
 *
 * Accessibility
 * -------------
 * N/A — see MapContainer's general map accessibility note.
 *
 * Future extension
 * -----------------
 * Swap MOCK_ROAD_SEGMENTS for real OSM-derived road geometry (Phase
 * 10's GIS import pipeline) — this component's rendering logic doesn't
 * need to change, only its data source.
 */
const definition = LAYER_DEFINITIONS.find((layer) => layer.id === 'road-network')!

export function RoadLayer() {
  const visible = useMapStore((state) => state.activeLayers['road-network'])
  const opacity = useMapStore((state) => state.layerOpacity['road-network'])
  const zoom = useMapStore((state) => state.zoom)

  if (!visible || zoom < definition.minZoom || zoom > definition.maxZoom) return null

  return (
    <>
      {MOCK_ROAD_SEGMENTS.map((road) => (
        <Polyline
          key={road.id}
          positions={road.positions}
          pathOptions={{
            color: 'var(--color-map-road)',
            weight: road.roadClass === 'primary' ? 4 : 2.5,
            opacity,
          }}
        >
          <LeafletTooltip sticky>{road.name}</LeafletTooltip>
        </Polyline>
      ))}
    </>
  )
}
