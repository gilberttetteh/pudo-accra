/**
 * Responsive design constants, kept in sync with Tailwind's default
 * breakpoints so JS-side logic (e.g. switching a map control layout)
 * matches CSS-side `md:` / `lg:` behavior exactly.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/** Build a `(min-width: ...)` media query string for a given breakpoint. */
export function breakpointQuery(breakpoint: Breakpoint): string {
  return `(min-width: ${BREAKPOINTS[breakpoint]}px)`
}
