import { StatCard } from '@/components/ui/StatCard'
import { MapPin, Sparkles, Users, AlertTriangle, Accessibility, Hexagon } from '@/components/icons'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import type { CoverageOverviewStats } from '@/features/map/analysis/statistics'

/**
 * Purpose
 * -------
 * "Network Summary" report section — a point-in-time snapshot of the
 * same headline numbers Dashboard's DashboardKpiSection shows, minus the
 * trend/sparkline history (a report is a single export moment, not a
 * running dashboard, so month-over-month deltas don't apply here). Every
 * number is read straight from `CoverageOverviewStats`
 * (calculateOverviewStatistics) plus the two candidate figures — no new
 * computation happens in this component.
 */
export interface NetworkSummarySectionProps {
  stats: CoverageOverviewStats
  candidateCount: number
  averageCandidateScore: number
}

export function NetworkSummarySection({
  stats,
  candidateCount,
  averageCandidateScore,
}: NetworkSummarySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Network Summary</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Existing Nodes" value={stats.totalExistingNodes} icon={MapPin} />
        <StatCard label="Candidate Nodes" value={candidateCount} icon={Sparkles} />
        <StatCard label="Coverage" value={`${Math.round(stats.coveragePercent)}%`} icon={Users} />
        <StatCard
          label="Population Served"
          value={stats.populationCovered.toLocaleString()}
          icon={Users}
        />
        <StatCard label="Coverage Gaps" value={stats.gapCount} icon={AlertTriangle} />
        <StatCard label="High-Priority Gaps" value={stats.highPriorityGapCount} icon={AlertTriangle} />
        <StatCard
          label="Avg. Accessibility"
          value={`${Math.round(stats.averageAccessibilityScore * 100)}%`}
          icon={Accessibility}
        />
        <StatCard
          label="Avg. Candidate Score"
          value={`${Math.round(averageCandidateScore * 100)}%`}
          icon={Hexagon}
        />
      </div>
    </Card>
  )
}
