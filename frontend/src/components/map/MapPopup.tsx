import type { ReactNode } from 'react'
import { Popup } from 'react-leaflet'

/**
 * Purpose
 * -------
 * Design-token-styled wrapper around react-leaflet's Popup so every map
 * marker's info bubble looks consistent, instead of Leaflet's default
 * white-box styling.
 *
 * Props
 * -----
 * - title?: string
 * - children: ReactNode — popup body
 * - minWidth?: number
 *
 * Example usage
 * -------------
 * <NodeMarker position={pos} label="Node #1" popupContent={
 *   <div>Capacity: 40 parcels/day</div>
 * } />
 * // MapPopup itself is used internally by NodeMarker/CandidateMarker,
 * // but can be used directly for custom overlays too:
 * <MapPopup title="Selected area">...</MapPopup>
 *
 * Accessibility
 * -------------
 * Leaflet manages open/close and focus return to the map; content here
 * should still use semantic markup (headings, lists) as it would anywhere
 * else.
 *
 * Future extension
 * -----------------
 * Add an actions footer slot (e.g. "View details" / "Edit") once node
 * detail routing exists.
 */
export interface MapPopupProps {
  title?: string
  children: ReactNode
  minWidth?: number
}

export function MapPopup({ title, children, minWidth = 220 }: MapPopupProps) {
  return (
    <Popup minWidth={minWidth} className="accra-pudo-popup">
      <div className="flex flex-col gap-1.5 p-1">
        {title && <p className="text-small font-semibold text-text-primary">{title}</p>}
        <div className="text-caption text-text-secondary">{children}</div>
      </div>
    </Popup>
  )
}
