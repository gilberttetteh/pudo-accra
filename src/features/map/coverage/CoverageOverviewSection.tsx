import { StatCard } from '@/components/ui/StatCard'
import { Icon, Users, MapPin, AlertTriangle, Accessibility } from '@/components/icons'
import { formatNumber, formatPercent } from '@/utils/formatters'
import type { CoverageOverviewStats } from '@/features/map/analysis/statistics'

/**
 * Purpose
 * -------
 * The Coverage Analysis panel's Overview section — a quick-glance
 * summary of citywide coverage health, computed once by
 * analysis/statistics.ts's calculateOverviewStatistics() and passed in
 * as props (this component does no calculation itself).
 *
 * Props
 * -----
 * - stats: CoverageOverviewStats
 *
 * Example usage
 * -------------
 * <CoverageOverviewSection stats={overviewStats} />
 *
 * Accessibility
 * -------------
 * Delegates to StatCard's existing a11y-friendly structure.
 *
 * Future extension
 * -----------------
 * Add a trend indicator (vs. last month) once historical snapshots
 * exist to compare against.
 */
export function CoverageOverviewSection({ stats }: { stats: CoverageOverviewStats }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <StatCard label="Coverage" value={formatPercent(stats.coveragePercent, true)} icon={MapPin} />
      <StatCard
        label="Population Covered"
        value={formatNumber(stats.populationCovered)}
        icon={Users}
      />
      <StatCard label="Active Nodes" value={stats.totalExistingNodes} icon={MapPin} />
      <StatCard label="Coverage Gaps" value={stats.gapCount} icon={AlertTriangle} />
      <StatCard
        label="High Priority Gaps"
        value={stats.highPriorityGapCount}
        icon={AlertTriangle}
      />
      <StatCard
        label="Avg. Accessibility"
        value={formatPercent(stats.averageAccessibilityScore)}
        icon={Accessibility}
      />
      <div className="col-span-2 flex items-center gap-2 rounded-md bg-surface-secondary p-3 text-caption text-text-secondary">
        <Icon icon={Users} size={14} className="shrink-0" />
        {formatNumber(stats.totalPopulationAffectedByGaps)} people live in identified coverage gaps
        across {stats.gapCount} underserved areas.
      </div>
    </div>
  )
}
