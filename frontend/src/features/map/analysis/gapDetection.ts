import type { CoverageGap, GapPriority } from '@/mock/coverageGaps'

/**
 * Pure gap-severity scoring. Geometry generation lives in
 * mock/coverageGaps.ts (that's data, not logic); this file only turns
 * raw gap stats (population affected, distance to nearest node, area)
 * into a severity score and priority classification.
 *
 * Future backend integration
 * ---------------------------
 * The gap *polygons themselves* would come from a real PostGIS query
 * (`ST_Difference` between a citywide service-area union and city
 * bounds, or a population-raster threshold outside all isochrones).
 * `calculateGapScore`/`classifyGapPriority` stay client-side (or move
 * to backend validation) unchanged — they're pure math over whatever
 * geometry produced the gap's stats.
 */

export interface GapScoreWeights {
  population: number
  distance: number
  area: number
}

export const DEFAULT_GAP_WEIGHTS: GapScoreWeights = { population: 0.5, distance: 0.35, area: 0.15 }

/** 0–1 severity score: higher population affected, farther from the
 *  nearest existing node, and larger area all increase severity.
 *  Normalized against reasonable Accra-scale maximums so scores stay
 *  meaningfully spread across the 0–1 range for this dataset. */
export function calculateGapScore(
  gap: Pick<CoverageGap, 'populationAffected' | 'nearestNodeDistanceMeters' | 'areaKm2'>,
  weights: GapScoreWeights = DEFAULT_GAP_WEIGHTS
): number {
  const populationScore = Math.min(1, gap.populationAffected / 20000)
  const distanceScore = Math.min(1, gap.nearestNodeDistanceMeters / 3000)
  const areaScore = Math.min(1, gap.areaKm2 / 8)

  const weightSum = weights.population + weights.distance + weights.area || 1
  return (
    (populationScore * weights.population +
      distanceScore * weights.distance +
      areaScore * weights.area) /
    weightSum
  )
}

/** Maps a 0–1 severity score to a discrete priority bucket. */
export function classifyGapPriority(score: number): GapPriority {
  if (score >= 0.6) return 'high'
  if (score >= 0.3) return 'medium'
  return 'low'
}

export interface GapSummary {
  totalGaps: number
  highPriority: number
  mediumPriority: number
  lowPriority: number
  totalPopulationAffected: number
}

/** Aggregate stats across every gap, for the Coverage Statistics section. */
export function summarizeGaps(gaps: CoverageGap[]): GapSummary {
  let highPriority = 0
  let mediumPriority = 0
  let lowPriority = 0
  let totalPopulationAffected = 0

  for (const gap of gaps) {
    const priority = classifyGapPriority(calculateGapScore(gap))
    if (priority === 'high') highPriority += 1
    else if (priority === 'medium') mediumPriority += 1
    else lowPriority += 1
    totalPopulationAffected += gap.populationAffected
  }

  return {
    totalGaps: gaps.length,
    highPriority,
    mediumPriority,
    lowPriority,
    totalPopulationAffected,
  }
}
