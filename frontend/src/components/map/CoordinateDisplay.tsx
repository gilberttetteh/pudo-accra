import { formatCoordinate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Small monospace readout of a latitude/longitude pair — cursor position
 * while hovering the map, or the currently selected node's location.
 *
 * Props
 * -----
 * - lat, lng: number
 * - precision?: number — decimal places (default 5, ≈1.1m precision)
 * - label?: string — optional leading label ("Cursor:", "Selected:")
 *
 * Example usage
 * -------------
 * <CoordinateDisplay lat={5.6037} lng={-0.187} label="Cursor" />
 *
 * Accessibility
 * -------------
 * Plain text content; no special handling needed beyond legible contrast,
 * already guaranteed by semantic text-secondary token.
 *
 * Future extension
 * -----------------
 * Phase 7: wire to Leaflet's `mousemove` event for a live cursor readout
 * in MapStatusBar.
 */
export interface CoordinateDisplayProps {
  lat: number
  lng: number
  precision?: number
  label?: string
  className?: string
}

export function CoordinateDisplay({
  lat,
  lng,
  precision = 5,
  label,
  className,
}: CoordinateDisplayProps) {
  return (
    <span className={cn('font-mono text-caption text-text-secondary', className)}>
      {label && <span className="mr-1 text-text-tertiary">{label}</span>}
      {formatCoordinate(lat, lng, precision)}
    </span>
  )
}
