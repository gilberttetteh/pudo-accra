import type { ScoredCandidate } from './candidateRanking'

/**
 * Pure comparison functions for Comparison Mode (side-by-side candidate
 * comparison table) and any other "before vs after" metric delta. No
 * React, no store imports.
 *
 * Future backend integration
 * ---------------------------
 * Stays entirely client-side even after scoring moves server-side —
 * this is pure presentation pivoting of already-computed metrics.
 */
export interface ComparisonMetricRow {
  metric: string
  key: keyof ScoredCandidate['metrics']
  values: { candidateId: string; value: number; isBest: boolean }[]
  format: 'percent' | 'count' | 'score'
}

const COMPARISON_METRICS: {
  key: keyof ScoredCandidate['metrics']
  label: string
  format: ComparisonMetricRow['format']
}[] = [
  { key: 'coverageImprovement', label: 'Coverage Improvement', format: 'percent' },
  { key: 'accessibility', label: 'Accessibility', format: 'percent' },
  { key: 'roadAccess', label: 'Road Access', format: 'percent' },
  { key: 'populationServed', label: 'Population Served', format: 'count' },
  { key: 'floodRisk', label: 'Flood Risk (higher = safer)', format: 'percent' },
  { key: 'overallScore', label: 'Overall Score', format: 'score' },
]

/** Pivots a list of scored candidates into per-metric rows, each with
 *  the best-performing candidate flagged — the shape a side-by-side
 *  comparison table wants to render directly. */
export function compareCandidates(candidates: ScoredCandidate[]): ComparisonMetricRow[] {
  return COMPARISON_METRICS.map(({ key, label, format }) => {
    const values = candidates.map((entry) => ({
      candidateId: entry.candidate.id,
      value: entry.metrics[key],
    }))
    const bestValue = values.length > 0 ? Math.max(...values.map((v) => v.value)) : 0
    return {
      metric: label,
      key,
      format,
      values: values.map((v) => ({ ...v, isBest: v.value === bestValue && candidates.length > 1 })),
    }
  })
}

export interface ImprovementDelta {
  absolute: number
  percent: number
  isImprovement: boolean
}

/** Generic before/after delta calculator — used for "coverage before vs
 *  after adding this candidate" and similar improvement estimates. */
export function calculateImprovement(before: number, after: number): ImprovementDelta {
  const absolute = after - before
  const percent = before !== 0 ? (absolute / before) * 100 : after > 0 ? 100 : 0
  return { absolute, percent, isImprovement: absolute > 0 }
}
