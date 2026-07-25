import { useSyncExternalStore } from 'react'

/**
 * Subscribe to a CSS media query and re-render when it changes.
 * Built on useSyncExternalStore so it correctly reflects the current
 * match state on every render (including the first) without an
 * effect-driven setState round-trip.
 *
 * @example
 * const isDesktop = useMediaQuery(breakpointQuery('lg'))
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQueryList = window.matchMedia(query)
      mediaQueryList.addEventListener('change', onStoreChange)
      return () => mediaQueryList.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}
