import type { LatLngExpression } from 'leaflet'
import type { MockCandidateNode } from '@/mock/nodes'
import type { PopulationCell } from '@/mock/population'
import {
  calculateAccessibilityScore,
  calculateRoadAccessScore,
  calculateFloodRiskScore,
  calculatePopulationScore,
  calculateOverallScore,
  type ScoreWeights,
  DEFAULT_SCORE_WEIGHTS,
} from './scoring'
import { calculateCoverageImprovement, estimatePopulationServed } from './coverageAnalysis'

/**
 * Pure candidate scoring/ranking — combines coverageAnalysis.ts and
 * scoring.ts's primitives into a single per-candidate metrics bundle,
 * then sorts. No React, no store imports.
 *
 * Future backend integration
 * ---------------------------
 * `scoreCandidate` is the function a backend `POST /candidates/score`
 * endpoint would replicate server-side (likely with real PostGIS
 * coverage joins instead of the mock population grid); `rankCandidateNodes`
 * is presentation-layer sorting that can stay client-side even after
 * scoring moves server-side.
 */
export interface CandidateMetrics {
  coverageImprovement: number
  accessibility: number
  roadAccess: number
  populationServed: number
  populationScore: number
  floodRisk: number
  overallScore: number
}

export interface ScoredCandidate {
  candidate: MockCandidateNode
  metrics: CandidateMetrics
  rank: number
}

export function scoreCandidate(
  candidate: MockCandidateNode,
  existingNodePositions: LatLngExpression[],
  populationCells: PopulationCell[],
  maxPopulationServedInSet: number,
  weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS
): CandidateMetrics {
  const coverageImprovement = calculateCoverageImprovement(
    candidate.position,
    existingNodePositions,
    populationCells
  )
  const accessibility = calculateAccessibilityScore(candidate.accessibilityScore)
  const roadAccess = calculateRoadAccessScore(candidate.nearestRoadDistanceMeters)
  const populationServed = estimatePopulationServed(candidate.position, populationCells)
  const populationScore = calculatePopulationScore(populationServed, maxPopulationServedInSet)
  const floodRisk = calculateFloodRiskScore(candidate.riskLevel)

  const overallScore = calculateOverallScore(
    {
      coverageImprovement,
      accessibility,
      roadAccess,
      populationServed: populationScore,
      floodRisk,
    },
    weights
  )

  return {
    coverageImprovement,
    accessibility,
    roadAccess,
    populationServed,
    populationScore,
    floodRisk,
    overallScore,
  }
}

/** Scores and ranks every candidate, sorted descending by overall score,
 *  with a 1-indexed `rank` field attached. */
export function rankCandidateNodes(
  candidates: MockCandidateNode[],
  existingNodePositions: LatLngExpression[],
  populationCells: PopulationCell[],
  weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS
): ScoredCandidate[] {
  // First pass to find the max population-served value in this set, so
  // populationScore is normalized relative to what's achievable here
  // rather than an arbitrary fixed number.
  const rawPopulationServed = candidates.map((candidate) =>
    estimatePopulationServed(candidate.position, populationCells)
  )
  const maxPopulationServed = Math.max(1, ...rawPopulationServed)

  const scored = candidates.map((candidate) => ({
    candidate,
    metrics: scoreCandidate(
      candidate,
      existingNodePositions,
      populationCells,
      maxPopulationServed,
      weights
    ),
  }))

  return scored
    .sort((a, b) => b.metrics.overallScore - a.metrics.overallScore)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
}

/** Filters an already-ranked list down to candidates at or above a
 *  minimum overall score threshold (0–1). */
export function filterCandidatesByMinScore(
  ranked: ScoredCandidate[],
  minScore: number
): ScoredCandidate[] {
  return ranked.filter((entry) => entry.metrics.overallScore >= minScore)
}
