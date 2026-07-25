/**
 * Formatting utilities for numbers, coordinates, distances, and dates.
 * Centralized so every page/table/chart renders these values consistently.
 */

/** Format a plain number with locale-aware thousands separators. */
export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

/** Format a 0–1 ratio (or 0–100 value when `isAlreadyPercent`) as "82%". */
export function formatPercent(value: number, isAlreadyPercent = false): string {
  const percent = isAlreadyPercent ? value : value * 100
  return `${formatNumber(percent, percent % 1 === 0 ? 0 : 1)}%`
}

/** Format meters as a human-readable distance ("450 m" / "1.2 km"). */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${formatNumber(meters)} m`
  return `${formatNumber(meters / 1000, 1)} km`
}

/** Format seconds as walking duration ("8 min"), rounding to the minute. */
export function formatWalkingDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  return `${minutes} min`
}

/** Format a lat/lng pair to a fixed-precision coordinate string. */
export function formatCoordinate(lat: number, lng: number, precision = 5): string {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`
}

/** Format an ISO date string / Date into a short, readable date. */
export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/** Format an ISO date string / Date into a relative "3 days ago" string. */
export function formatRelativeTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  const diffMs = date.getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / 60000)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  const divisions: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'minute'],
    [24, 'hour'],
    [30, 'day'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ]

  let duration = diffMinutes
  for (const [amount, unit] of divisions) {
    if (Math.abs(duration) < amount) return rtf.format(Math.round(duration), unit)
    duration /= amount
  }
  return rtf.format(Math.round(duration), 'year')
}

/** Truncate long labels (e.g. node names on small map chips) with an ellipsis. */
export function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value
}
