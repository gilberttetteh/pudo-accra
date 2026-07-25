import type { LatLngExpression } from 'leaflet'
import { haversineDistanceMeters } from '@/utils/geo'
import type { PopulationCell } from '@/mock/population'

/**
 * Pure coverage calculation functions — how much of the population grid
 * falls within walking distance of a node or set of nodes. No React, no
 * store imports.
 *
 * Future backend integration
 * ---------------------------
 * `estimatePopulationServed` and `calculateCoverage` are exactly what a
 * PostGIS `ST_DWithin` join against a real population raster/vector
 * layer would compute server-side — the mock population grid here
 * (mock/population.ts) is a stand-in for that join. The function
 * signatures (take positions + population cells + radius, return a
 * count/percentage) are designed to stay the same once a real
 * `CoverageService.calculateCoverage()` API call replaces this.
 */

const DEFAULT_WALK_RADIUS_METERS = 800 // ~10 minute walk

/** Population within `radiusMeters` of a single point, summed across
 *  every population cell whose center falls inside the radius. */
export function estimatePopulationServed(
  position: LatLngExpression,
  populationCells: PopulationCell[],
  radiusMeters = DEFAULT_WALK_RADIUS_METERS
): number {
  return populationCells
    .filter((cell) => haversineDistanceMeters(position, cell.position) <= radiusMeters)
    .reduce((sum, cell) => sum + cell.populationEstimate, 0)
}

export interface CoverageResult {
  populationCovered: number
  populationTotal: number
  coveragePercent: number
}

/** Coverage across an entire population grid from a set of node
 *  positions — a cell counts as covered if it falls within radius of
 *  *any* node (union of individual coverage areas, not summed —
 *  avoids double-counting overlapping service areas). */
export function calculateCoverage(
  nodePositions: LatLngExpression[],
  populationCells: PopulationCell[],
  radiusMeters = DEFAULT_WALK_RADIUS_METERS
): CoverageResult {
  const populationTotal = populationCells.reduce((sum, cell) => sum + cell.populationEstimate, 0)

  const populationCovered = populationCells
    .filter((cell) =>
      nodePositions.some(
        (position) => haversineDistanceMeters(position, cell.position) <= radiusMeters
      )
    )
    .reduce((sum, cell) => sum + cell.populationEstimate, 0)

  return {
    populationCovered,
    populationTotal,
    coveragePercent: populationTotal > 0 ? (populationCovered / populationTotal) * 100 : 0,
  }
}

/** Coverage improvement (0–1 score) a single candidate would add on top
 *  of the existing node network — the marginal population newly
 *  reachable, normalized against the still-uncovered population. */
export function calculateCoverageImprovement(
  candidatePosition: LatLngExpression,
  existingNodePositions: LatLngExpression[],
  populationCells: PopulationCell[],
  radiusMeters = DEFAULT_WALK_RADIUS_METERS
): number {
  const baseline = calculateCoverage(existingNodePositions, populationCells, radiusMeters)
  const withCandidate = calculateCoverage(
    [...existingNodePositions, candidatePosition],
    populationCells,
    radiusMeters
  )
  const uncoveredPopulation = baseline.populationTotal - baseline.populationCovered
  if (uncoveredPopulation <= 0) return 0
  const newlyCovered = withCandidate.populationCovered - baseline.populationCovered
  return Math.min(1, Math.max(0, newlyCovered / uncoveredPopulation))
}

export { DEFAULT_WALK_RADIUS_METERS }
