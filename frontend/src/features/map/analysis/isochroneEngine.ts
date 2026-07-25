/**
 * Pure isochrone geometry helpers. "Isochrone" here means a
 * network-agnostic circular approximation (radius = walking speed ×
 * time) — a real isochrone follows the actual walkable street network
 * and is *not* circular. This engine exists to (a) make that
 * approximation explicit and swappable, and (b) centralize the
 * walking-speed assumption and per-band visual styling in one place.
 *
 * Future ORS integration
 * -----------------------
 * OpenRouteService's `/v2/isochrones` endpoint takes a point + a list
 * of `range` values (seconds) and returns real network-based polygons
 * per band. To integrate: replace `generateIsochroneRings`'s return
 * shape from `{ radiusMeters }` to `{ positions: LatLngExpression[] }`
 * (a real polygon instead of a circle radius), sourced from an async
 * `RouteService.getIsochrones(position, bands)` call — every other
 * field (minutes, color, fillOpacity, order) and every consumer
 * (IsochroneLayer, CoverageInspector) stays the same, since they only
 * care about "here's a shape per time band with this styling."
 */

export type IsochroneBandMinutes = 5 | 10 | 15 | 20

export const ISOCHRONE_BANDS: IsochroneBandMinutes[] = [5, 10, 15, 20]

/** Average unobstructed walking speed used for the circular
 *  approximation — 4.8 km/h is a commonly cited average adult walking
 *  pace, slowed slightly from the textbook 5 km/h to account for
 *  street-network indirection (real paths aren't straight lines). */
export const WALKING_SPEED_METERS_PER_MINUTE = 80

export function minutesToRadiusMeters(minutes: number): number {
  return minutes * WALKING_SPEED_METERS_PER_MINUTE
}

export interface IsochroneRing {
  minutes: IsochroneBandMinutes
  radiusMeters: number
  color: string
  fillOpacity: number
  /** Render order — larger rings first (bottom), so smaller/closer
   *  bands paint on top and stay visible instead of being covered. */
  order: number
}

const BAND_COLORS: Record<IsochroneBandMinutes, string> = {
  5: 'var(--color-success-500)',
  10: 'var(--color-info-500)',
  15: 'var(--color-warning-500)',
  20: 'var(--color-error-500)',
}

/** Generates the four styled walking-time rings for a given center
 *  point. Geometry itself (radiusMeters) is center-independent — the
 *  center is passed to the *consumer* (IsochroneLayer's <Circle center=.../>),
 *  not baked into this pure function, so the same ring set can be
 *  reused for any node without recomputing styling. */
export function generateIsochroneRings(
  bands: IsochroneBandMinutes[] = ISOCHRONE_BANDS
): IsochroneRing[] {
  return [...bands]
    .sort((a, b) => b - a) // largest first for render order
    .map((minutes, index) => ({
      minutes,
      radiusMeters: minutesToRadiusMeters(minutes),
      color: BAND_COLORS[minutes],
      fillOpacity: 0.16,
      order: index,
    }))
}
