import type { LatLngExpression } from 'leaflet'

/**
 * Algorithm: fixed-grid marker clustering
 * ----------------------------------------
 * Purpose: group nearby points into a single ClusterMarker so dense
 * areas (e.g. many nodes in Osu) don't render as an unreadable pile of
 * overlapping icons at lower zoom levels.
 *
 * Approach: bucket points into a lat/lng grid whose cell size shrinks as
 * zoom increases (more zoom = smaller geographic area needed to look
 * "close together" on screen). This is a coarse approximation of
 * pixel-distance clustering — it doesn't account for map projection
 * distortion or viewport aspect ratio, which is an acceptable trade-off
 * for the current mock-data volume (dozens, not thousands, of points).
 *
 * Assumptions / magic numbers explained:
 * - `baseCellDegrees = 0.35`: cell size in degrees at zoom level 8,
 *   chosen empirically so nodes within roughly the same neighbourhood
 *   cluster together at city-wide zoom.
 * - Cell size halves for each zoom level above 8 (`2 ** (zoom - 8)`),
 *   converging toward showing individual markers by zoom ~14.
 * - `minClusterSize = 2`: a "cluster" of 1 is just rendered as a normal
 *   marker (see `clusterPoints`'s return shape).
 *
 * Future extension
 * -----------------
 * Replace with Supercluster (proper spatial-index clustering, used by
 * most production Leaflet/Mapbox apps) once real node volume justifies
 * it — this function's return shape (`ClusterResult<T>[]`) can stay the
 * same so MapCanvas doesn't need to change.
 */
export interface ClusterResult<T> {
  position: LatLngExpression
  items: T[]
}

const BASE_CELL_DEGREES = 0.35
const BASE_ZOOM = 8
const MIN_CLUSTER_SIZE = 2

export function clusterPoints<T>(
  items: T[],
  getPosition: (item: T) => LatLngExpression,
  zoom: number
): ClusterResult<T>[] {
  const cellSize = BASE_CELL_DEGREES / Math.pow(2, Math.max(0, zoom - BASE_ZOOM))
  const buckets = new Map<string, T[]>()

  for (const item of items) {
    const position = getPosition(item)
    const [lat, lng] = Array.isArray(position) ? position : [position.lat, position.lng]
    const cellKey = `${Math.floor(lat / cellSize)}:${Math.floor(lng / cellSize)}`
    const bucket = buckets.get(cellKey)
    if (bucket) bucket.push(item)
    else buckets.set(cellKey, [item])
  }

  return Array.from(buckets.values()).map((bucketItems) => {
    const positions = bucketItems.map((item) => {
      const position = getPosition(item)
      return Array.isArray(position) ? position : [position.lat, position.lng]
    }) as [number, number][]

    const centroid: LatLngExpression = [
      positions.reduce((sum, [lat]) => sum + lat, 0) / positions.length,
      positions.reduce((sum, [, lng]) => sum + lng, 0) / positions.length,
    ]

    return { position: centroid, items: bucketItems }
  })
}

export { MIN_CLUSTER_SIZE }
