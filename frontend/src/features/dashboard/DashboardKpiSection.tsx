import { useMemo } from 'react'
import { StatCard } from '@/components/ui/StatCard'
import {
  MapPin,
  Sparkles,
  TrendingUp,
  Users,
  AlertTriangle,
  AlertCircle,
  Accessibility,
  Hexagon,
} from '@/components/icons'
import { generateTrendSeries, trendDelta, KPI_TREND_SEEDS } from '@/mock/dashboardTrends'
import type { CoverageOverviewStats } from '@/features/map/analysis/statistics'

/**
 * Purpose
 * -------
 * Top KPI row (Step 3) — 8 StatCards. Every headline number is read
 * straight off `CoverageOverviewStats` (Phase 6's
 * calculateOverviewStatistics) plus two candidate-pipeline numbers
 * (`candidateCount`, `averageCandidateScore`) computed from
 * analysis/candidateRanking.ts — nothing here recalculates coverage,
 * gaps, or accessibility itself.
 *
 * Trend/sparkline values come from mock/dashboardTrends.ts, which is
 * explicit, isolated, illustrative history (see that file's doc
 * comment) — every other number on this card is live and real.
 *
 * Props
 * -----
 * - stats: CoverageOverviewStats
 * - candidateCount: number
 * - averageCandidateScore: number (0–1)
 */
export interface DashboardKpiSectionProps {
  stats: CoverageOverviewStats
  candidateCount: number
  averageCandidateScore: number
  isLoading?: boolean
}

export function DashboardKpiSection({
  stats,
  candidateCount,
  averageCandidateScore,
  isLoading,
}: DashboardKpiSectionProps) {
  const coveragePercentRounded = Math.round(stats.coveragePercent)
  const accessibilityPercent = Math.round(stats.averageAccessibilityScore * 100)
  const candidateScorePercent = Math.round(averageCandidateScore * 100)

  const trends = useMemo(() => {
    const build = (seed: number, value: number) => {
      const series = generateTrendSeries(seed, value)
      const delta = trendDelta(series)
      return {
        sparkline: series.map((point) => point.value),
        trend: {
          direction: delta.direction,
          value: `${delta.direction === 'up' ? '+' : '-'}${delta.percent}% vs last month`,
        },
      }
    }
    return {
      existingNodes: build(KPI_TREND_SEEDS.existingNodes, stats.totalExistingNodes),
      candidateNodes: build(KPI_TREND_SEEDS.candidateNodes, candidateCount),
      coveragePercent: build(KPI_TREND_SEEDS.coveragePercent, coveragePercentRounded),
      populationServed: build(KPI_TREND_SEEDS.populationServed, stats.populationCovered),
      coverageGaps: build(KPI_TREND_SEEDS.coverageGaps, stats.gapCount),
      highPriorityGaps: build(KPI_TREND_SEEDS.highPriorityGaps, stats.highPriorityGapCount),
      accessibilityScore: build(KPI_TREND_SEEDS.accessibilityScore, accessibilityPercent),
      candidateScore: build(KPI_TREND_SEEDS.candidateScore, candidateScorePercent),
    }
  }, [
    stats.totalExistingNodes,
    candidateCount,
    coveragePercentRounded,
    stats.populationCovered,
    stats.gapCount,
    stats.highPriorityGapCount,
    accessibilityPercent,
    candidateScorePercent,
  ])

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-4">
      <StatCard
        label="Existing Nodes"
        value={stats.totalExistingNodes}
        icon={MapPin}
        tooltip="Currently active, maintenance, offline, or archived PUDO nodes"
        isLoading={isLoading}
        {...trends.existingNodes}
      />
      <StatCard
        label="Candidate Nodes"
        value={candidateCount}
        icon={Sparkles}
        tooltip="Proposed nodes awaiting review or approval"
        isLoading={isLoading}
        {...trends.candidateNodes}
      />
      <StatCard
        label="Coverage"
        value={`${coveragePercentRounded}%`}
        icon={Hexagon}
        tooltip="Share of citywide population within a walking isochrone of an existing node"
        tone={coveragePercentRounded < 50 ? 'warning' : 'success'}
        isLoading={isLoading}
        {...trends.coveragePercent}
      />
      <StatCard
        label="Population Served"
        value={stats.populationCovered.toLocaleString()}
        icon={Users}
        tooltip="Estimated residents within coverage of an existing node"
        isLoading={isLoading}
        {...trends.populationServed}
      />
      <StatCard
        label="Coverage Gaps"
        value={stats.gapCount}
        icon={AlertCircle}
        tooltip="Underserved neighbourhoods with no nearby existing node"
        isLoading={isLoading}
        {...trends.coverageGaps}
      />
      <StatCard
        label="High Priority Gaps"
        value={stats.highPriorityGapCount}
        icon={AlertTriangle}
        tooltip="Gaps scoring highest on population affected, distance, and area"
        tone={stats.highPriorityGapCount > 0 ? 'error' : 'success'}
        isLoading={isLoading}
        {...trends.highPriorityGaps}
      />
      <StatCard
        label="Avg. Accessibility"
        value={`${accessibilityPercent}%`}
        icon={Accessibility}
        tooltip="Average accessibility score across existing nodes"
        isLoading={isLoading}
        {...trends.accessibilityScore}
      />
      <StatCard
        label="Avg. Candidate Score"
        value={`${candidateScorePercent}%`}
        icon={TrendingUp}
        tooltip="Average overall score across ranked candidate nodes"
        isLoading={isLoading}
        {...trends.candidateScore}
      />
    </div>
  )
}
