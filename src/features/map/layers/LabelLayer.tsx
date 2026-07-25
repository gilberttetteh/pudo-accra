import { CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { MOCK_NEIGHBOURHOOD_LABELS } from '@/mock/labels'
import { LAYER_DEFINITIONS } from '@/constants/map'

/**
 * Purpose
 * -------
 * Renders neighbourhood name labels using invisible zero-radius
 * CircleMarkers with permanent Tooltips — the standard Leaflet pattern
 * for plain text map labels without a custom pane/plugin.
 *
 * Props
 * -----
 * None.
 *
 * Example usage
 * -------------
 * <LabelLayer /> // inside <MapContainer>, rendered last so labels sit
 * on top of other layers
 *
 * Accessibility
 * -------------
 * N/A — decorative text overlay; neighbourhood names are also available
 * via the Map Search feature.
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
const definition = LAYER_DEFINITIONS.find((layer) => layer.id === 'labels')!

export function LabelLayer() {
  const visible = useMapStore((state) => state.activeLayers['labels'])
  const zoom = useMapStore((state) => state.zoom)

  if (!visible || zoom < definition.minZoom || zoom > definition.maxZoom) return null

  return (
    <>
      {MOCK_NEIGHBOURHOOD_LABELS.map((label) => (
        <CircleMarker
          key={label.id}
          center={label.position}
          radius={0}
          pathOptions={{ opacity: 0, fillOpacity: 0 }}
        >
          <LeafletTooltip
            permanent
            direction="center"
            className="!border-none !bg-transparent !shadow-none !font-medium !text-text-secondary"
          >
            {label.name}
          </LeafletTooltip>
        </CircleMarker>
      ))}
    </>
  )
}
