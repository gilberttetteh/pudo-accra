import type { LatLngExpression } from 'leaflet'

/** Extract a plain [lat, lng] tuple from Leaflet's LatLngExpression union. */
export function toLatLngTuple(position: LatLngExpression): [number, number] {
  return Array.isArray(position) ? [position[0], position[1]] : [position.lat, position.lng]
}

/** Haversine great-circle distance in meters between two lat/lng points. */
export function haversineDistanceMeters(a: LatLngExpression, b: LatLngExpression): number {
  const [lat1, lng1] = toLatLngTuple(a)
  const [lat2, lng2] = toLatLngTuple(b)
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h = sinLat * sinLat + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * sinLng * sinLng
  return 2 * R * Math.asin(Math.sqrt(h))
}
