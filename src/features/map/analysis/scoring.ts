import type { RiskLevel } from '@/mock/nodes'

/**
 * Pure scoring primitives — no React, no store imports, no side effects.
 * Every function here takes plain data in and returns a plain number
 * out, which is what makes this layer reusable in frontend previews,
 * unit tests, and (eventually) backend validation of the same formulas
 * without duplicating logic in two languages.
 *
 * Future backend integration
 * ---------------------------
 * These weighting/normalization formulas are exactly what a PostGIS +
 * pl/python scoring function would need to replicate for server-side
 * candidate ranking — keeping them here, framework-free, means the
 * formulas can be ported near-verbatim rather than reverse-engineered
 * from component code.
 */

export interface ScoreWeights {
  coverageImprovement: number
  accessibility: number
  roadAccess: number
  populationServed: number
  floodRisk: number
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  coverageImprovement: 0.3,
  accessibility: 0.2,
  roadAccess: 0.15,
  populationServed: 0.25,
  floodRisk: 0.1,
}

/** Clamp a value into the [0, 1] range. */
export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/** Accessibility score is already stored as 0–1 on mock nodes; this
 *  function exists as the single seam a real formula (composite of
 *  terrain, sidewalk presence, curb cuts, etc.) would replace. */
export function calculateAccessibilityScore(rawAccessibilityScore: number): number {
  return clamp01(rawAccessibilityScore)
}

/** Converts a distance-to-nearest-road into a 0–1 score: 0m -> 1.0,
 *  500m+ -> 0.0, linear in between. */
export function calculateRoadAccessScore(distanceToRoadMeters: number): number {
  const maxRelevantDistance = 500
  return clamp01(1 - distanceToRoadMeters / maxRelevantDistance)
}

/** Converts a categorical flood risk level into a 0–1 score where
 *  higher is better (lower flood risk). */
export function calculateFloodRiskScore(riskLevel: RiskLevel): number {
  const scoreByLevel: Record<RiskLevel, number> = { low: 1, moderate: 0.55, high: 0.15 }
  return scoreByLevel[riskLevel]
}

/** Normalizes an absolute population-served count against the largest
 *  value in the current comparison set (so scores are always relative
 *  to what's actually achievable in this dataset, not an arbitrary
 *  fixed ceiling). */
export function calculatePopulationScore(
  populationServed: number,
  maxPopulationServed: number
): number {
  if (maxPopulationServed <= 0) return 0
  return clamp01(populationServed / maxPopulationServed)
}

export interface ScoreInputs {
  coverageImprovement: number
  accessibility: number
  roadAccess: number
  populationServed: number
  floodRisk: number
}

/** Weighted sum of the five 0–1 sub-scores into a single overall 0–1
 *  score. Weights default to DEFAULT_SCORE_WEIGHTS but can be overridden
 *  (e.g. a planner dashboard control that favors flood-risk avoidance). */
export function calculateOverallScore(
  inputs: ScoreInputs,
  weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS
): number {
  const weightSum = Object.values(weights).reduce((sum, w) => sum + w, 0) || 1
  const weighted =
    inputs.coverageImprovement * weights.coverageImprovement +
    inputs.accessibility * weights.accessibility +
    inputs.roadAccess * weights.roadAccess +
    inputs.populationServed * weights.populationServed +
    inputs.floodRisk * weights.floodRisk
  return clamp01(weighted / weightSum)
}
