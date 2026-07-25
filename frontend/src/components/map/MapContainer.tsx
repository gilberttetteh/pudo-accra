import type { ReactNode } from 'react'
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { env } from '@/config/env'
import { cn } from '@/utils/cn'
import { BASEMAPS, type BasemapId } from '@/constants/map'

/**
 * Purpose
 * -------
 * The single Leaflet map instance wrapper for the whole app. Owns the
 * base tile layer and default viewport so every map surface (main Map
 * Workspace, dashboard MapPreview, node detail mini-map) starts from the
 * same foundation. Imports Leaflet's base CSS once, here, so no other
 * file needs to.
 *
 * Props
 * -----
 * - center?: [lat, lng] — defaults to Accra (from env config)
 * - zoom?: number — defaults to env config
 * - basemap?: BasemapId — which tile provider to render (see
 *   constants/map.ts); defaults to 'osm'
 * - hideDefaultBasemap?: boolean — when true, skip rendering the
 *   built-in TileLayer so the caller can compose its own basemap layer
 *   (see features/map/layers/BaseMapLayer.tsx) as part of a larger
 *   layered rendering stack. Standalone/preview usage (e.g. a future
 *   dashboard mini-map) should leave this false and just use `basemap`.
 * - children?: ReactNode — markers, overlays, and other map/ components
 * - className?: string — sizing is the caller's responsibility (e.g.
 *   `h-[600px] w-full`), since a map has no intrinsic size
 * - scrollWheelZoom?: boolean — off by default for embedded/preview maps
 *
 * Example usage
 * -------------
 * <MapContainer className="h-[520px] w-full rounded-xl" scrollWheelZoom basemap="dark">
 *   <NodeMarker position={[5.56, -0.2]} label="Osu Node" />
 * </MapContainer>
 *
 * Accessibility
 * -------------
 * Leaflet's canvas/SVG map is not natively screen-reader friendly; pair
 * every map view with an accessible data-table alternative (Table
 * component) presenting the same nodes/coverage.
 *
 * Future extension
 * -----------------
 * Ref forwarding for imperative control (flyTo, fitBounds), and
 * OpenRouteService-driven isochrone overlays once the backend exists.
 */
export interface MapContainerProps {
  center?: LatLngExpression
  zoom?: number
  basemap?: BasemapId
  hideDefaultBasemap?: boolean
  children?: ReactNode
  className?: string
  scrollWheelZoom?: boolean
}

export function MapContainer({
  center,
  zoom,
  basemap = 'osm',
  hideDefaultBasemap = false,
  children,
  className,
  scrollWheelZoom = false,
}: MapContainerProps) {
  const resolvedCenter: LatLngExpression = center ?? [env.mapDefaultLat, env.mapDefaultLng]
  const resolvedZoom = zoom ?? env.mapDefaultZoom
  const activeBasemap = BASEMAPS[basemap]

  return (
    <LeafletMapContainer
      center={resolvedCenter}
      zoom={resolvedZoom}
      scrollWheelZoom={scrollWheelZoom}
      zoomControl={false}
      className={cn('z-0 h-full w-full', className)}
    >
      {!hideDefaultBasemap && (
        <TileLayer
          key={activeBasemap.id}
          attribution={activeBasemap.attribution}
          url={activeBasemap.url}
        />
      )}
      {children}
    </LeafletMapContainer>
  )
}
