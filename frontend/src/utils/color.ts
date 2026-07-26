
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

/**
 * Resolves a CSS custom property (design token) to its computed value
 * at call time — e.g. readCssVar('--color-chart-1') -> '#3b82f6'.
 *
 * Needed specifically for Chart.js/canvas contexts: unlike Tailwind
 * classes or inline `style={{ color: 'var(--x)' }}`, Chart.js writes
 * colors directly to a <canvas> 2D context, which does not resolve CSS
 * custom properties — it needs a literal color string. This reads the
 * token from :root (or `.dark` when dark mode is active) so charts stay
 * on the same design-token palette (--color-chart-1..6, semantic
 * status colors) as the rest of the app, including across theme
 * switches, without hardcoding hex values in chart components.
 *
 * Falls back to an empty string during server-side/non-browser
 * evaluation (not applicable in this Vite SPA, but keeps the function
 * safe to call unconditionally at module scope if ever needed).
 */
export function readCssVar(variableName: string): string {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
}


