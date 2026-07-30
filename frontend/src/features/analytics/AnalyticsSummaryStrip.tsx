import { StatCard } from '@/components/ui/StatCard'
import { MapPin, Sparkles, AlertTriangle, Users } from '@/components/icons'
import { formatNumber, formatPercent } from '@/utils/formatters'
import type { CoverageOverviewStats } from '@/features/map/analysis/statistics'

/**
 * Purpose
 * -------
 * A slim summary row for the Analytics workspace — reuses the exact
 * same CoverageOverviewStats object the Dashboard's KPI section reads
 * (calculateOverviewStatistics, unchanged), plus the filtered candidate
 * count and average score already computed on AnalyticsPage. Per the
 * Phase 8 plan §4, this is explicitly "not a full KPI re-do of the
 * Dashboard" — four numbers for orientation before the filters/charts
 * below, not a duplicate of DashboardKpiSection's eight.
 *
 * Props
 * -----
 * - stats: CoverageOverviewStats (from calculateOverviewStatistics)
 * - filteredNodeCount / filteredCandidateCount: number — reflect the
 *   current AnalyticsFilterBar selection, so the strip visibly responds
 *   to filtering even though the underlying stats object doesn't
 *   recompute coverage math per-filter (that would risk implying a
 *   precision the mock data doesn't have).
 * - averageCandidateScore: number (0–1)
 */
export interface AnalyticsSummaryStripProps {
  stats: CoverageOverviewStats
  filteredNodeCount: number
  filteredCandidateCount: number
  averageCandidateScore: number
}

export function AnalyticsSummaryStrip({
  stats,
  filteredNodeCount,
  filteredCandidateCount,
  averageCandidateScore,
}: AnalyticsSummaryStripProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Nodes in view"
        value={formatNumber(filteredNodeCount)}
        icon={MapPin}
        tooltip="Existing nodes matching the current filters."
      />
      <StatCard
        label="Candidates in view"
        value={formatNumber(filteredCandidateCount)}
        icon={Users}
        tooltip="Candidate nodes matching the current filters."
      />
      <StatCard
        label="Avg. candidate score"
        value={formatPercent(averageCandidateScore)}
        icon={Sparkles}
        tooltip="Average overall score across the filtered candidate set."
      />
      <StatCard
        label="High-priority gaps"
        value={formatNumber(stats.highPriorityGapCount)}
        icon={AlertTriangle}
        tone={stats.highPriorityGapCount > 0 ? 'warning' : 'neutral'}
        tooltip="Coverage gaps classified high-priority network-wide (not filtered — gaps aren't node/candidate records)."
      />
    </div>
  )
}
