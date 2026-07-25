import type { LatLngExpression } from 'leaflet'
import { createSeededRandom, randomInRange } from './random'

/** Illustrative flood-risk polygons along known low-lying Accra areas
 *  (Odaw river basin / Korle Lagoon area, Dansoman, Alajo) — mock only,
 *  not derived from real hydrological data. */
export interface FloodZone {
  id: string
  label: string
  riskLevel: 'moderate' | 'high' | 'severe'
  positions: LatLngExpression[]
}

const FLOOD_PRONE_AREAS = [
  { label: 'Odaw River Basin', lat: 5.5605, lng: -0.2137, risk: 'severe' as const },
  { label: 'Alajo Lowlands', lat: 5.5852, lng: -0.2245, risk: 'high' as const },
  { label: 'Korle Lagoon Fringe', lat: 5.5334, lng: -0.2201, risk: 'severe' as const },
  { label: 'Dansoman Estuary', lat: 5.5289, lng: -0.2634, risk: 'moderate' as const },
  { label: 'Kaneshie Drainage Basin', lat: 5.5613, lng: -0.2354, risk: 'high' as const },
]

function irregularPolygon(
  random: () => number,
  lat: number,
  lng: number,
  radiusDeg: number
): LatLngExpression[] {
  const sides = 7
  const points: LatLngExpression[] = []
  for (let i = 0; i < sides; i += 1) {
    const angle = (i / sides) * Math.PI * 2
    const wobble = randomInRange(random, 0.6, 1.3)
    points.push([
      lat + Math.sin(angle) * radiusDeg * wobble,
      lng + Math.cos(angle) * radiusDeg * wobble,
    ])
  }
  return points
}

export function generateFloodZones(): FloodZone[] {
  const random = createSeededRandom(4242)
  return FLOOD_PRONE_AREAS.map((area, index) => ({
    id: `flood-${index + 1}`,
    label: area.label,
    riskLevel: area.risk,
    positions: irregularPolygon(random, area.lat, area.lng, randomInRange(random, 0.01, 0.018)),
  }))
}

export const MOCK_FLOOD_ZONES = generateFloodZones()
