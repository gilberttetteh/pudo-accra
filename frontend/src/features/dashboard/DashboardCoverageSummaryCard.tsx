import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Progress } from '@/components/feedback/Progress'
import { Badge } from '@/components/ui/Badge'
import { Icon, Users, Accessibility, MapPin } from '@/components/icons'
import { coverageByNeighbourhood } from './selectors'
import type { CoverageOverviewStats } from '@/features/map/analysis/statistics'
import type { MockNode } from '@/mock/nodes'

/**
 * Purpose
 * -------
 * Coverage %, gap distribution, population coverage, and accessibility
 * in one glanceable widget (Step 5), plus a short "Top Underserved
 * Areas" list. Every number comes from the same
 * `CoverageOverviewStats`/`coverageByNeighbourhood` the KPI row and
 * charts already use — no separate coverage computation lives here.
 *
 * Props
 * -----
 * - stats: CoverageOverviewStats
 * - existingNodes: MockNode[] — for the underserved-areas list
 */
export interface DashboardCoverageSummaryCardProps {
  stats: CoverageOverviewStats
  existingNodes: MockNode[]
}

export function DashboardCoverageSummaryCard({
  stats,
  existingNodes,
}: DashboardCoverageSummaryCardProps) {
  const worstDistricts = useMemo(() => coverageByNeighbourhood(existingNodes, 5), [existingNodes])
  const gapTotal = stats.gapCount
  const highShare = gapTotal > 0 ? Math.round((stats.highPriorityGapCount / gapTotal) * 100) : 0

  return (
    <Card className="flex flex-col gap-5">
      <CardHeader>
        <CardTitle>Coverage Summary</CardTitle>
        <CardDescription>Citywide coverage and where it's weakest</CardDescription>
      </CardHeader>

      <Progress
        value={stats.coveragePercent}
        label="Citywide coverage"
        tone={stats.coveragePercent < 50 ? 'warning' : 'success'}
      />

      <div className="grid grid-cols-2 gap-4 text-small">
        <div className="flex items-center gap-2 text-text-secondary">
          <Icon icon={Users} size={16} />
          <span>
            {stats.populationCovered.toLocaleString()} / {stats.totalPopulation.toLocaleString()}{' '}
            served
          </span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <Icon icon={Accessibility} size={16} />
          <span>{Math.round(stats.averageAccessibilityScore * 100)}% avg. accessibility</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-small font-medium text-text-primary">Gap distribution</span>
          <Badge tone={highShare > 40 ? 'error' : 'warning'}>{gapTotal} total</Badge>
        </div>
        <Progress
          value={highShare}
          label={`${stats.highPriorityGapCount} high priority`}
          tone="error"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-small font-medium text-text-primary">Top underserved districts</span>
        {worstDistricts.length === 0 ? (
          <p className="text-small text-text-tertiary">No node data available.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {worstDistricts.map((district) => (
              <li
                key={district.neighbourhood}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Icon icon={MapPin} size={14} className="text-text-tertiary" />
                  <span className="text-small text-text-primary">{district.neighbourhood}</span>
                </div>
                <span className="text-caption text-text-secondary">
                  {Math.round(district.averageCoverage * 100)}% coverage
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
