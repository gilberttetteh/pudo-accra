/**
 * Color helper utilities — primarily for GIS visualizations (heatmaps,
 * coverage scoring) where color needs to be computed at runtime rather
 * than picked from a static Tailwind class.
 */

/** Convert a #rrggbb hex color to an rgba() string with the given alpha. */
export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '')
  const bigint = parseInt(normalized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Map a normalized coverage/accessibility score (0–1) to a color along a
 * low -> mid -> high gradient, matching the heatmap design tokens defined
 * in src/styles/index.css (--color-map-heatmap-*).
 */
export function scoreToHeatmapColor(score: number): string {
  const clamped = Math.min(1, Math.max(0, score))
  if (clamped < 0.5) return '#fef3c7' // heatmap-low
  if (clamped < 0.8) return '#fbbf24' // heatmap-mid
  return '#dc2626' // heatmap-high
}

/** Semantic status -> color-scale name, for badges/alerts driven by data. */
export type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral'

export function statusToTone(status: string): StatusTone {
  const normalized = status.toLowerCase()
  if (['active', 'covered', 'approved', 'online'].includes(normalized)) return 'success'
  if (['pending', 'review', 'degraded'].includes(normalized)) return 'warning'
  if (['failed', 'uncovered', 'offline', 'rejected'].includes(normalized)) return 'error'
  if (['candidate', 'draft'].includes(normalized)) return 'info'
  return 'neutral'
}
