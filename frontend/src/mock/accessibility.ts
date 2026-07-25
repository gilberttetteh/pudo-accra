import type { LatLngExpression } from 'leaflet'
import { ACCRA_NEIGHBOURHOODS } from './geo'
import { createSeededRandom, randomInRange } from './random'

/**
 * Mock accessibility zone polygons — one per neighbourhood, colored by
 * a 0–1 accessibility score in the Accessibility Layer. Standing in for
 * a real composite accessibility index (road density + terrain +
 * OpenRouteService isochrone area) computed server-side.
 */
export interface AccessibilityZone {
  id: string
  neighbourhood: string
  accessibilityScore: number
  positions: LatLngExpression[]
}

function circlePolygon(
  random: () => number,
  lat: number,
  lng: number,
  radiusDeg: number,
  sides = 9
): LatLngExpression[] {
  const points: LatLngExpression[] = []
  for (let i = 0; i < sides; i += 1) {
    const angle = (i / sides) * Math.PI * 2
    const wobble = randomInRange(random, 0.8, 1.1)
    points.push([
      lat + Math.sin(angle) * radiusDeg * wobble,
      lng + Math.cos(angle) * radiusDeg * wobble,
    ])
  }
  return points
}

export function generateAccessibilityZones(): AccessibilityZone[] {
  const random = createSeededRandom(880123)
  return ACCRA_NEIGHBOURHOODS.map((seed, index) => ({
    id: `access-${index + 1}`,
    neighbourhood: seed.name,
    accessibilityScore: Math.round(randomInRange(random, 0.3, 0.97) * 100) / 100,
    positions: circlePolygon(random, seed.lat, seed.lng, randomInRange(random, 0.015, 0.026)),
  }))
}

export const MOCK_ACCESSIBILITY_ZONES = generateAccessibilityZones()
