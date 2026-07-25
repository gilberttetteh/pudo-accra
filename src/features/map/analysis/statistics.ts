import type { MockNode } from '@/mock/nodes'
import type { PopulationCell } from '@/mock/population'
import type { CoverageGap } from '@/mock/coverageGaps'
import { calculateCoverage, DEFAULT_WALK_RADIUS_METERS } from './coverageAnalysis'
import { summarizeGaps } from './gapDetection'

/**
 * Pure aggregate-statistics functions for the Coverage Analysis panel's
 * Overview section. No React, no store imports.
 *
 * Future backend integration
 * ---------------------------
 * This becomes a single `GET /analytics/coverage-overview` response
 * once a backend exists — the shape of CoverageOverviewStats is
 * designed to be exactly that response body.
 */
export interface CoverageOverviewStats {
  totalPopulation: number
  populationCovered: number
  coveragePercent: number
  totalExistingNodes: number
  averageCoverageScore: number
  averageAccessibilityScore: number
  gapCount: number
  highPriorityGapCount: number
  totalPopulationAffectedByGaps: number
}

export function calculateOverviewStatistics(
  existingNodes: MockNode[],
  populationCells: PopulationCell[],
  gaps: CoverageGap[],
  radiusMeters = DEFAULT_WALK_RADIUS_METERS
): CoverageOverviewStats {
  const coverage = calculateCoverage(
    existingNodes.map((node) => node.position),
    populationCells,
    radiusMeters
  )
  const gapSummary = summarizeGaps(gaps)

  const averageCoverageScore =
    existingNodes.length > 0
      ? existingNodes.reduce((sum, node) => sum + node.coverageScore, 0) / existingNodes.length
      : 0
  const averageAccessibilityScore =
    existingNodes.length > 0
      ? existingNodes.reduce((sum, node) => sum + node.accessibilityScore, 0) / existingNodes.length
      : 0

  return {
    totalPopulation: coverage.populationTotal,
    populationCovered: coverage.populationCovered,
    coveragePercent: coverage.coveragePercent,
    totalExistingNodes: existingNodes.length,
    averageCoverageScore,
    averageAccessibilityScore,
    gapCount: gapSummary.totalGaps,
    highPriorityGapCount: gapSummary.highPriority,
    totalPopulationAffectedByGaps: gapSummary.totalPopulationAffected,
  }
}
