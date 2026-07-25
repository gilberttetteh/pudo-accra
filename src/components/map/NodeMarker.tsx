import { Marker } from 'react-leaflet'
import { divIcon } from 'leaflet'
import type { LatLngExpression } from 'leaflet'
import type { ReactNode } from 'react'
import { MapPopup } from './MapPopup'

/**
 * Purpose
 * -------
 * Map marker representing an existing, operational PUDO node. Visually
 * distinct from CandidateMarker (see design token
 * --color-map-node-existing) so planners can scan the map and instantly
 * tell live infrastructure from proposals.
 *
 * Props
 * -----
 * - position: [lat, lng]
 * - label: string — used as the marker's accessible title
 * - selected?: boolean — highlights the marker (uses --color-map-node-selected)
 * - onClick?: () => void
 * - onHoverChange?: (hovered: boolean) => void — mouseover/mouseout
 * - onContextMenu?: (event: { clientX: number; clientY: number }) => void
 *   — right-click; caller is responsible for opening a context menu
 *   (see features/map/MapContextMenuHost.tsx)
 * - popupContent?: ReactNode — rendered inside a MapPopup on click
 *
 * Example usage
 * -------------
 * <NodeMarker position={[5.56, -0.2]} label="Osu Node #12"
 *   popupContent={<NodeSummary node={node} />}
 *   onHoverChange={(hovered) => hoverNode(hovered ? node.id : null)} />
 *
 * Accessibility
 * -------------
 * Leaflet markers are not keyboard-focusable by default; pair every map
 * view with an accessible Table/list view of the same nodes (see
 * InspectorPanel / MapSidebar in features/map). The divIcon includes a
 * `title` attribute for mouse-hover context.
 *
 * Future extension
 * -----------------
 * Add a `status` prop (active/maintenance/offline) mapped to marker
 * color once live node health data replaces mock data.
 */
export interface NodeMarkerProps {
  position: LatLngExpression
  label: string
  selected?: boolean
  onClick?: () => void
  onHoverChange?: (hovered: boolean) => void
  onContextMenu?: (event: { clientX: number; clientY: number }) => void
  popupContent?: ReactNode
}

function createNodeIcon(selected: boolean) {
  const color = selected ? 'var(--color-map-node-selected)' : 'var(--color-map-node-existing)'
  const size = selected ? 20 : 16
  return divIcon({
    className: 'accra-marker',
    html: `<span class="accra-marker-inner" style="
      display:block;width:${size}px;height:${size}px;border-radius:9999px;
      background:${color};border:2px solid white;
      box-shadow:0 1px 4px rgba(15,23,42,0.35);
    "></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
  })
}

export function NodeMarker({
  position,
  label,
  selected = false,
  onClick,
  onHoverChange,
  onContextMenu,
  popupContent,
}: NodeMarkerProps) {
  return (
    <Marker
      position={position}
      icon={createNodeIcon(selected)}
      title={label}
      eventHandlers={{
        click: onClick,
        mouseover: () => onHoverChange?.(true),
        mouseout: () => onHoverChange?.(false),
        contextmenu: (event) => {
          event.originalEvent.preventDefault()
          onContextMenu?.({
            clientX: event.originalEvent.clientX,
            clientY: event.originalEvent.clientY,
          })
        },
      }}
    >
      {popupContent && <MapPopup title={label}>{popupContent}</MapPopup>}
    </Marker>
  )
}
