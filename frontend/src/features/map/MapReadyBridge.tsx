import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'

/**
 * Purpose
 * -------
 * Bridges the Leaflet map instance into mapStore, since imperative
 * controls (zoom, locate, viewport navigation) live in components that
 * render *outside* react-leaflet's context — `useMap()` only works
 * under <MapContainer>. Once registered, any component can reach the
 * instance via `useMapStore((s) => s.mapInstance)`, though the
 * preferred path for navigation is `useViewportController()`
 * (viewportController.ts), which wraps common operations.
 *
 * Props
 * -----
 * None — reads the Leaflet map via useMap() and writes it to mapStore.
 *
 * Example usage
 * -------------
 * // Inside <MapContainer>:
 * <MapReadyBridge />
 *
 * Accessibility
 * -------------
 * N/A — non-visual.
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
export function MapReadyBridge() {
  const map = useMap()
  const setMapInstance = useMapStore((state) => state.setMapInstance)

  useEffect(() => {
    setMapInstance(map)
    return () => setMapInstance(null)
  }, [map, setMapInstance])

  return null
}
