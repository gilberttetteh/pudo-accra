import type { MockNode, MockCandidateNode, NodeStatus, CandidateStatus } from '@/mock/nodes'
import type { CoverageGap } from '@/mock/coverageGaps'
import type { ScoredCandidate } from '@/features/map/analysis/candidateRanking'
import { classifyGapPriority, calculateGapScore } from '@/features/map/analysis/gapDetection'
import type { SystemAlert } from '@/mock/systemAlerts'
import { MOCK_SYSTEM_ALERTS } from '@/mock/systemAlerts'

/**
 * Pure aggregation functions for the Dashboard workspace (Phase 7). No
 * React, no store imports — same discipline as features/map/analysis/,
 * since these are the "how do I turn raw node/candidate arrays into
 * chartable buckets" formulas, not presentation. Components call these
 * inside useMemo, exactly like MapWorkspace does with the analysis
 * layer, so the Dashboard never invents its own parallel computation of
 * something Phase 6 already owns (coverage %, gap severity, candidate
 * scores all come from analysis/* — this file only adds the grouping
 * Phase 6 didn't need).
 *
 * Future backend integration
 * ---------------------------
 * Every function here is a `GROUP BY` a backend would run in SQL/PostGIS
 * once real data exists (`GROUP BY status`, `GROUP BY neighbourhood`,
 * a histogram bucket query) — signatures (take the raw records, return
 * labeled buckets) are designed to stay the same after that swap.
 */

export interface StatusCount<T extends string> {
  status: T
  count: number
}

export function groupNodesByStatus(nodes: MockNode[]): StatusCount<NodeStatus>[] {
  const counts = new Map<NodeStatus, number>()
  for (const node of nodes) counts.set(node.status, (counts.get(node.status) ?? 0) + 1)
  return Array.from(counts.entries()).map(([status, count]) => ({ status, count }))
}

export function groupCandidatesByStatus(
  candidates: MockCandidateNode[]
): StatusCount<CandidateStatus>[] {
  const counts = new Map<CandidateStatus, number>()
  for (const candidate of candidates) {
    counts.set(candidate.status, (counts.get(candidate.status) ?? 0) + 1)
  }
  return Array.from(counts.entries()).map(([status, count]) => ({ status, count }))
}

export interface NeighbourhoodCoverage {
  neighbourhood: string
  averageCoverage: number
  nodeCount: number
}

/** Average coverageScore per neighbourhood, sorted ascending (worst
 *  first) so "Coverage by District" reads as a prioritized list. Limited
 *  to `limit` districts with at least one node so the chart stays
 *  readable rather than showing all 24 neighbourhoods. */
export function coverageByNeighbourhood(nodes: MockNode[], limit = 10): NeighbourhoodCoverage[] {
  const byNeighbourhood = new Map<string, { total: number; count: number }>()
  for (const node of nodes) {
    const entry = byNeighbourhood.get(node.neighbourhood) ?? { total: 0, count: 0 }
    entry.total += node.coverageScore
    entry.count += 1
    byNeighbourhood.set(node.neighbourhood, entry)
  }
  return Array.from(byNeighbourhood.entries())
    .map(([neighbourhood, { total, count }]) => ({
      neighbourhood,
      averageCoverage: count > 0 ? total / count : 0,
      nodeCount: count,
    }))
    .sort((a, b) => a.averageCoverage - b.averageCoverage)
    .slice(0, limit)
}

export interface AccessibilityBucket {
  label: string
  min: number
  max: number
  count: number
}

/** Buckets nodes into fixed 0.2-wide accessibility-score bands (0–20%,
 *  20–40%, ... 80–100%) for a distribution histogram. */
export function accessibilityDistribution(nodes: MockNode[], bucketSize = 0.2): AccessibilityBucket[] {
  const bucketCount = Math.round(1 / bucketSize)
  const buckets: AccessibilityBucket[] = Array.from({ length: bucketCount }, (_, index) => {
    const min = index * bucketSize
    const max = index === bucketCount - 1 ? 1 : min + bucketSize
    return {
      label: `${Math.round(min * 100)}–${Math.round(max * 100)}%`,
      min,
      max,
      count: 0,
    }
  })

  for (const node of nodes) {
    const index = Math.min(bucketCount - 1, Math.floor(node.accessibilityScore / bucketSize))
    buckets[index]!.count += 1
  }

  return buckets
}

export interface DashboardAlert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  timestamp: string
  /** Distinguishes alerts derived from real store data (can deep-link to
   *  a real gap/candidate) from illustrative system alerts. */
  source: 'coverage-gap' | 'candidate-approval' | 'system'
  linkedId?: string
}

/** Builds the Alerts panel's items: real alerts derived from current
 *  coverage-gap and candidate data, plus the illustrative system alerts
 *  from mock/systemAlerts.ts. Real alerts are computed, not stored, so
 *  they always reflect the live nodeStore/gap data — dismissing one in
 *  the UI only hides it for the session (component-local state), it
 *  doesn't mutate the underlying gap/candidate record. */
export function buildDashboardAlerts(
  gaps: CoverageGap[],
  candidates: MockCandidateNode[],
  systemAlerts: SystemAlert[] = MOCK_SYSTEM_ALERTS
): DashboardAlert[] {
  const alerts: DashboardAlert[] = []

  const highPriorityGaps = gaps.filter(
    (gap) => classifyGapPriority(calculateGapScore(gap)) === 'high'
  )
  for (const gap of highPriorityGaps.slice(0, 3)) {
    alerts.push({
      id: `alert-gap-${gap.id}`,
      severity: 'critical',
      title: 'High-priority coverage gap detected',
      description: `${gap.neighbourhood} affects an estimated ${gap.populationAffected.toLocaleString()} residents.`,
      timestamp: new Date().toISOString(),
      source: 'coverage-gap',
      linkedId: gap.id,
    })
  }

  const pendingCandidates = candidates.filter((candidate) => candidate.status === 'under-review')
  for (const candidate of pendingCandidates.slice(0, 3)) {
    alerts.push({
      id: `alert-candidate-${candidate.id}`,
      severity: 'warning',
      title: 'Candidate awaiting approval',
      description: `${candidate.name} in ${candidate.neighbourhood} has been under review.`,
      timestamp: candidate.lastUpdated,
      source: 'candidate-approval',
      linkedId: candidate.id,
    })
  }

  const highRiskCandidates = candidates.filter(
    (candidate) => candidate.riskLevel === 'high' && candidate.status !== 'rejected'
  )
  if (highRiskCandidates.length > 0) {
    alerts.push({
      id: 'alert-flood-risk',
      severity: 'warning',
      title: 'Flood-risk warning',
      description: `${highRiskCandidates.length} active candidate node${highRiskCandidates.length === 1 ? '' : 's'} in high flood-risk zones.`,
      timestamp: new Date().toISOString(),
      source: 'candidate-approval',
    })
  }

  for (const system of systemAlerts) {
    alerts.push({
      id: system.id,
      severity: system.severity,
      title: system.title,
      description: system.description,
      timestamp: system.timestamp,
      source: 'system',
    })
  }

  const severityRank = { critical: 0, warning: 1, info: 2 }
  return alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
}

/** Overall average candidate score across a ranked list — the "Average
 *  Candidate Score" KPI, computed from analysis/candidateRanking.ts's
 *  output rather than re-deriving scoring here. */
export function averageCandidateScore(ranked: ScoredCandidate[]): number {
  if (ranked.length === 0) return 0
  return ranked.reduce((sum, entry) => sum + entry.metrics.overallScore, 0) / ranked.length
}
