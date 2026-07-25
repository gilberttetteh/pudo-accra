import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Displays the map's current scale (e.g. "500 m") as a horizontal bar,
 * mirroring the standard cartographic scale-bar convention. Placeholder
 * computation for Phase 2 — Phase 7 will replace `metersPerPixel` with a
 * value derived from the live Leaflet map instance's zoom level.
 *
 * Props
 * -----
 * - metersPerPixel: number — used to compute a "nice" round bar width
 * - className?: string
 *
 * Example usage
 * -------------
 * <ScaleIndicator metersPerPixel={4.77} />
 *
 * Accessibility
 * -------------
 * `role="img"` with a computed `aria-label` (e.g. "Map scale: 500 meters")
 * since the visual bar alone conveys no text.
 *
 * Future extension
 * -----------------
 * Phase 7: derive `metersPerPixel` from `map.getZoom()` / Leaflet's
 * built-in scale utilities and update live on zoom/pan.
 */
export interface ScaleIndicatorProps {
  metersPerPixel: number
  className?: string
}

/** Round to a "nice" scale-bar distance (1/2/5 × 10^n meters). */
function niceDistance(maxMeters: number): number {
  const exponent = Math.floor(Math.log10(maxMeters))
  const base = Math.pow(10, exponent)
  const fraction = maxMeters / base
  const niceFraction = fraction >= 5 ? 5 : fraction >= 2 ? 2 : 1
  return niceFraction * base
}

export function ScaleIndicator({ metersPerPixel, className }: ScaleIndicatorProps) {
  const maxBarPx = 100
  const distance = niceDistance(metersPerPixel * maxBarPx)
  const barWidth = distance / metersPerPixel
  const label = distance >= 1000 ? `${distance / 1000} km` : `${distance} m`

  return (
    <div
      role="img"
      aria-label={`Map scale: ${label}`}
      className={cn('flex flex-col items-start gap-0.5', className)}
    >
      <div
        style={{ width: `${barWidth}px` }}
        className="border-b-2 border-l-2 border-r-2 border-text-secondary h-1.5"
      />
      <span className="text-caption text-text-secondary">{label}</span>
    </div>
  )
}
