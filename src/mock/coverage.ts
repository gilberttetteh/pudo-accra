import type { LatLngExpression } from 'leaflet'
import { ACCRA_NEIGHBOURHOODS } from './geo'
import { createSeededRandom, randomInRange } from './random'

/** A rough circular-ish coverage polygon around a served neighbourhood. */
export interface CoveragePolygon {
  id: string
  neighbourhood: string
  coverageScore: number
  positions: LatLngExpression[]
}

function circlePolygon(
  random: () => number,
  lat: number,
  lng: number,
  radiusDeg: number,
  sides = 10
): LatLngExpression[] {
  const points: LatLngExpression[] = []
  for (let i = 0; i < sides; i += 1) {
    const angle = (i / sides) * Math.PI * 2
    const wobble = randomInRange(random, 0.75, 1.15)
    points.push([
      lat + Math.sin(angle) * radiusDeg * wobble,
      lng + Math.cos(angle) * radiusDeg * wobble,
    ])
  }
  return points
}

export function generateCoveragePolygons(): CoveragePolygon[] {
  const random = createSeededRandom(9001)
  return ACCRA_NEIGHBOURHOODS.slice(0, 14).map((seed, index) => ({
    id: `coverage-${index + 1}`,
    neighbourhood: seed.name,
    coverageScore: Math.round(randomInRange(random, 0.4, 0.95) * 100) / 100,
    positions: circlePolygon(random, seed.lat, seed.lng, randomInRange(random, 0.018, 0.03)),
  }))
}

export const MOCK_COVERAGE_POLYGONS = generateCoveragePolygons()
