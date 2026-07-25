import { Marker } from 'react-leaflet'
import { divIcon } from 'leaflet'
import type { LatLngExpression } from 'leaflet'

/**
 * Purpose
 * -------
 * Represents a group of nearby node/candidate markers as a single
 * numbered circle, used when many points would otherwise overlap at
 * lower zoom levels. Clustering logic here is a simple fixed
 * grid-in-pixel-space grouping (see clusterPoints in features/map/
 * MapCanvas.tsx) — good enough for mock data volumes; swappable for a
 * proper spatial-index clustering library later without changing this
 * component's API.
 *
 * Props
 * -----
 * - position: [lat, lng] — cluster centroid
 * - count: number — how many markers this cluster represents
 * - onClick?: () => void — typically zooms into the cluster
 *
 * Example usage
 * -------------
 * <ClusterMarker position={[5.6, -0.19]} count={12} onClick={() => zoomToCluster()} />
 *
 * Accessibility
 * -------------
 * Same caveat as other markers — Leaflet markers aren't keyboard
 * focusable; the accessible path is the paired list/table view.
 *
 * Future extension
 * -----------------
 * Swap the manual grid-clustering in MapCanvas for `react-leaflet-cluster`
 * (Supercluster-based) once node volume grows enough to need real
 * spatial indexing; this component's visual contract stays the same.
 */
export interface ClusterMarkerProps {
  position: LatLngExpression
  count: number
  onClick?: () => void
}

function createClusterIcon(count: number) {
  const size = count > 20 ? 44 : count > 8 ? 36 : 30
  return divIcon({
    className: 'accra-marker',
    html: `<span class="accra-marker-inner" style="
      display:flex;align-items:center;justify-content:center;
      width:${size}px;height:${size}px;border-radius:9999px;
      background:var(--color-primary-600);color:white;font-weight:600;
      font-size:${count > 20 ? 13 : 12}px;font-family:var(--font-sans);
      border:2px solid white;box-shadow:0 2px 6px rgba(15,23,42,0.4);
    ">${count}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export function ClusterMarker({ position, count, onClick }: ClusterMarkerProps) {
  return (
    <Marker
      position={position}
      icon={createClusterIcon(count)}
      title={`${count} nodes`}
      eventHandlers={onClick ? { click: onClick } : undefined}
    />
  )
}
