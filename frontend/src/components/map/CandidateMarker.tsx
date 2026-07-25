import { Marker } from 'react-leaflet'
import { divIcon } from 'leaflet'
import type { LatLngExpression } from 'leaflet'
import type { ReactNode } from 'react'
import { MapPopup } from './MapPopup'

/**
 * Purpose
 * -------
 * Map marker representing an algorithm-recommended or planner-proposed
 * PUDO location that isn't live yet. Rendered as a diamond so it reads
 * as distinct from NodeMarker's circle even for colorblind users (shape
 * + color redundancy).
 *
 * Props
 * -----
 * - position: [lat, lng]
 * - label: string
 * - score?: number — 0–1 coverage/suitability score, shown as a small
 *   badge on the marker when provided
 * - selected?: boolean
 * - onClick?: () => void
 * - onHoverChange?: (hovered: boolean) => void
 * - popupContent?: ReactNode
 *
 * Example usage
 * -------------
 * <CandidateMarker position={[5.58, -0.21]} label="Candidate #4" score={0.82} />
 *
 * Accessibility
 * -------------
 * Same caveat as NodeMarker — pair with an accessible list/table view.
 *
 * Future extension
 * -----------------
 * Add an `onAccept` / `onReject` quick-action pair once the candidate
 * review workflow (Phase 10) is designed.
 */
export interface CandidateMarkerProps {
  position: LatLngExpression
  label: string
  score?: number
  selected?: boolean
  onClick?: () => void
  onHoverChange?: (hovered: boolean) => void
  onContextMenu?: (event: { clientX: number; clientY: number }) => void
  popupContent?: ReactNode
}

function createCandidateIcon(score: number | undefined, selected: boolean) {
  const color = selected ? 'var(--color-map-node-selected)' : 'var(--color-map-node-candidate)'
  const size = selected ? 20 : 16
  const badge =
    score !== undefined
      ? `<span style="
          position:absolute;top:-6px;right:-10px;font-size:9px;font-weight:600;
          background:var(--color-surface);color:var(--color-text-primary);
          border:1px solid var(--color-border);border-radius:9999px;
          padding:1px 4px;line-height:1.3;white-space:nowrap;
        ">${Math.round(score * 100)}</span>`
      : ''

  return divIcon({
    className: 'accra-marker',
    html: `<span class="accra-marker-inner" style="position:relative;display:block;width:${size}px;height:${size}px;">
      <span style="
        display:block;width:${size}px;height:${size}px;transform:rotate(45deg);
        background:${color};border:2px solid white;
        box-shadow:0 1px 4px rgba(15,23,42,0.35);
      "></span>
      ${badge}
    </span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
  })
}

export function CandidateMarker({
  position,
  label,
  score,
  selected = false,
  onClick,
  onHoverChange,
  onContextMenu,
  popupContent,
}: CandidateMarkerProps) {
  return (
    <Marker
      position={position}
      icon={createCandidateIcon(score, selected)}
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
