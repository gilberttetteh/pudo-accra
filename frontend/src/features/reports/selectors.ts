import type { MockNode, MockCandidateNode } from '@/mock/nodes'
import type { ScoredCandidate } from '@/features/map/analysis/candidateRanking'
import { coverageByNeighbourhood } from '@/features/dashboard/selectors'
import type { ReportFilters } from './types'

/**
 * Pure aggregation + filtering functions for the Reports workspace
 * (Phase 9). Same discipline as features/map/analysis/*,
 * features/dashboard/selectors.ts, and features/analytics/selectors.ts:
 * no React, no store imports. Anything already computed by those layers
 * (coverage %, gap severity, candidate scores, per-district coverage) is
 * reused via import, not re-derived — this file only adds the "assemble
 * a report row/section" shaping those layers don't need for their own
 * pages.
 *
 * Future backend integration
 * ---------------------------
 * Every function here is either a filter predicate or a join over
 * already-computed data — a backend `GET /reports/:type` endpoint would
 * do the same filtering server-side and return these exact shapes.
 */

// ---------------------------------------------------------------------------
// Filtering — same convention as Analytics: empty set = show all
// ---------------------------------------------------------------------------

export function filterNodesForReport(nodes: MockNode[], filters: ReportFilters): MockNode[] {
  return nodes.filter((node) => {
    if (filters.neighbourhoods.size > 0 && !filters.neighbourhoods.has(node.neighbourhood)) {
      return false
    }
    if (filters.nodeStatuses.size > 0 && !filters.nodeStatuses.has(node.status)) {
      return false
    }
    return true
  })
}

export function filterCandidatesForReport(
  candidates: MockCandidateNode[],
  filters: ReportFilters
): MockCandidateNode[] {
  return candidates.filter((candidate) => {
    if (filters.neighbourhoods.size > 0 && !filters.neighbourhoods.has(candidate.neighbourhood)) {
      return false
    }
    if (filters.candidateStatuses.size > 0 && !filters.candidateStatuses.has(candidate.status)) {
      return false
    }
    return true
  })
}

// ---------------------------------------------------------------------------
// District Breakdown Report
// ---------------------------------------------------------------------------

export interface DistrictBreakdownRow {
  neighbourhood: string
  nodeCount: number
  averageCoverage: number
  candidateCount: number
}

/** Full per-district breakdown (every district with at least one node or
 *  candidate) — deliberately not limited to the "worst 10" the way
 *  dashboard/selectors.ts's coverageByNeighbourhood is for its chart,
 *  since a report table should show the whole network, not just the
 *  underperforming slice. Reuses coverageByNeighbourhood's coverage/node
 *  numbers rather than re-averaging coverageScore here, then layers in
 *  the candidate count per district. */
export function buildDistrictBreakdown(
  nodes: MockNode[],
  candidates: MockCandidateNode[]
): DistrictBreakdownRow[] {
  const coverageRows = coverageByNeighbourhood(nodes, Number.MAX_SAFE_INTEGER)

  const candidateCounts = new Map<string, number>()
  for (const candidate of candidates) {
    candidateCounts.set(candidate.neighbourhood, (candidateCounts.get(candidate.neighbourhood) ?? 0) + 1)
  }

  return coverageRows
    .map((row) => ({
      neighbourhood: row.neighbourhood,
      nodeCount: row.nodeCount,
      averageCoverage: row.averageCoverage,
      candidateCount: candidateCounts.get(row.neighbourhood) ?? 0,
    }))
    .sort((a, b) => a.neighbourhood.localeCompare(b.neighbourhood))
}

// ---------------------------------------------------------------------------
// Candidate Recommendations Report
// ---------------------------------------------------------------------------

export interface CandidateRecommendationRow {
  rank: number
  id: string
  name: string
  neighbourhood: string
  overallScore: number
  coverageImprovement: number
  accessibility: number
  floodRisk: number
  status: string
}

/** Flattens a ranked candidate list into the flat row shape a report
 *  table/CSV wants — presentation shaping only, no new scoring (scores
 *  come from features/map/analysis/candidateRanking.ts's rankCandidateNodes,
 *  called by the page before this). */
export function buildCandidateRecommendationRows(
  ranked: ScoredCandidate[],
  limit?: number
): CandidateRecommendationRow[] {
  const rows = ranked.map((entry) => ({
    rank: entry.rank,
    id: entry.candidate.id,
    name: entry.candidate.name,
    neighbourhood: entry.candidate.neighbourhood,
    overallScore: entry.metrics.overallScore,
    coverageImprovement: entry.metrics.coverageImprovement,
    accessibility: entry.metrics.accessibility,
    floodRisk: entry.metrics.floodRisk,
    status: entry.candidate.status,
  }))
  return limit ? rows.slice(0, limit) : rows
}
