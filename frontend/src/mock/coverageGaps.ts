import type { LatLngExpression } from 'leaflet'
import { ACCRA_NEIGHBOURHOODS } from './geo'
import { MOCK_EXISTING_NODES } from './nodes'
import { createSeededRandom, randomInRange } from './random'
import { haversineDistanceMeters } from '@/utils/geo'

/**
 * Mock underserved-area ("coverage gap") polygons — neighbourhoods with
 * no nearby existing node, standing in for what a real
 * ST_Difference(service_area, coverage_union) PostGIS query would
 * produce. Priority/severity are computed post-hoc by
 * analysis/gapDetection.ts's calculateGapScore(), not baked in here —
 * this file only generates plausible geometry + raw stats.
 */
export type GapPriority = 'high' | 'medium' | 'low'

export interface CoverageGap {
  id: string
  neighbourhood: string
  position: LatLngExpression
  positions: LatLngExpression[]
  populationAffected: number
  areaKm2: number
  nearestNodeId: string | null
  nearestNodeDistanceMeters: number
}

function irregularPolygon(
  random: () => number,
  lat: number,
  lng: number,
  radiusDeg: number
): LatLngExpression[] {
  const sides = 8
  const points: LatLngExpression[] = []
  for (let i = 0; i < sides; i += 1) {
    const angle = (i / sides) * Math.PI * 2
    const wobble = randomInRange(random, 0.7, 1.25)
    points.push([
      lat + Math.sin(angle) * radiusDeg * wobble,
      lng + Math.cos(angle) * radiusDeg * wobble,
    ])
  }
  return points
}

function findNearestNode(position: LatLngExpression) {
  let nearestId: string | null = null
  let nearestDistance = Infinity
  for (const node of MOCK_EXISTING_NODES) {
    const distance = haversineDistanceMeters(position, node.position)
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestId = node.id
    }
  }
  return { nearestId, nearestDistance }
}

export function generateCoverageGaps(): CoverageGap[] {
  const random = createSeededRandom(560017)
  // Use the neighbourhoods that weren't seeded with a coverage polygon
  // in mock/coverage.ts (which only covers the first 14) — these are
  // the ones most plausibly underserved.
  const gapNeighbourhoods = ACCRA_NEIGHBOURHOODS.slice(14)

  return gapNeighbourhoods.map((seed, index) => {
    const radiusDeg = randomInRange(random, 0.012, 0.022)
    const { nearestId, nearestDistance } = findNearestNode([seed.lat, seed.lng])
    return {
      id: `gap-${index + 1}`,
      neighbourhood: seed.name,
      position: [seed.lat, seed.lng],
      positions: irregularPolygon(random, seed.lat, seed.lng, radiusDeg),
      populationAffected: Math.round(randomInRange(random, 1500, 18000)),
      areaKm2: Math.round(Math.PI * Math.pow(radiusDeg * 111, 2) * 100) / 100,
      nearestNodeId: nearestId,
      nearestNodeDistanceMeters: Math.round(nearestDistance),
    }
  })
}

export const MOCK_COVERAGE_GAPS = generateCoverageGaps()
