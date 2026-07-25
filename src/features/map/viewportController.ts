import { useMemo } from 'react'
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet'
import { useMapStore } from '@/store/mapStore'
import { MAP_CONFIG } from '@/constants/map'

/**
 * Purpose
 * -------
 * Centralizes every piece of imperative Leaflet navigation logic in one
 * place, so components (Toolbar, ContextMenu, Search, Inspector) never
 * call `mapInstance.flyTo(...)` directly — they call
 * `viewportController.zoomToNode(...)` etc. This means navigation
 * behavior (easing, default zoom levels, padding) can change once here
 * instead of being duplicated across every caller.
 *
 * Usage
 * -----
 * const viewport = useViewportController()
 * viewport.zoomToNode(node.position)
 * viewport.fitCoverage(coveragePolygonPositions)
 *
 * All methods are safe no-ops if the Leaflet map isn't ready yet
 * (mapStore.mapInstance is null before MapReadyBridge fires) — callers
 * don't need to guard against that themselves.
 *
 * Future extension
 * -----------------
 * Add `zoomToRoute()` once real routing (Phase 10, OpenRouteService)
 * returns a path to frame.
 */
export interface MapViewportController {
  zoomToNode: (position: LatLngExpression, zoom?: number) => void
  zoomToBounds: (bounds: LatLngBoundsExpression, paddingPx?: number) => void
  fitCoverage: (positions: LatLngExpression[]) => void
  flyToLocation: (position: LatLngExpression, zoom?: number) => void
  resetView: () => void
}

const DEFAULT_NODE_ZOOM = 15

export function useViewportController(): MapViewportController {
  const mapInstance = useMapStore((state) => state.mapInstance)
  const resetViewState = useMapStore((state) => state.resetView)

  return useMemo<MapViewportController>(
    () => ({
      zoomToNode: (position, zoom = DEFAULT_NODE_ZOOM) => {
        mapInstance?.flyTo(position, zoom)
      },
      zoomToBounds: (bounds, paddingPx = 32) => {
        mapInstance?.fitBounds(bounds, { padding: [paddingPx, paddingPx] })
      },
      fitCoverage: (positions) => {
        if (positions.length === 0 || !mapInstance) return
        mapInstance.fitBounds(positions as LatLngBoundsExpression, { padding: [48, 48] })
      },
      flyToLocation: (position, zoom = DEFAULT_NODE_ZOOM) => {
        mapInstance?.flyTo(position, zoom)
      },
      resetView: () => {
        resetViewState()
        mapInstance?.flyTo(MAP_CONFIG.defaultCenter, MAP_CONFIG.defaultZoom)
      },
    }),
    [mapInstance, resetViewState]
  )
}
