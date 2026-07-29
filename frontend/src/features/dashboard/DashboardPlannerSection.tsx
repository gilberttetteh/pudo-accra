import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import { Alert } from '@/components/feedback/Alert'
import { Target, Users, Hexagon, Footprints } from '@/components/icons'
import { usePlannerResult } from '@/hooks/usePlannerData'
import { usePlannerStore } from '@/store/plannerStore'

/**
 * Purpose
 * -------
 * The headline result of the real siting analysis, at the top of the
 * dashboard: how many PUDO sites Greater Accra + Kasoa needs to put a
 * pickup point within a given walk of a given share of the population.
 *
 * Sits above DashboardKpiSection and is visibly separated from it because
 * the two are not the same kind of number. These come from the pipeline in
 * `analysis/` — OSM road network, WorldPop 2020 population, exclusion zones,
 * greedy max-coverage solve. The KPI row below is sample data for UI
 * development. Labelling that difference costs one badge and one line of
 * text, and saves someone from quoting a made-up figure in a report.
 *
 * The controls live in the Map Workspace's Planner tab; this reflects
 * whatever they're set to, since both read the same plannerStore.
 *
 * Example usage
 * -------------
 * <DashboardPlannerSection />
 */
export function DashboardPlannerSection() {
  const minutes = usePlannerStore((state) => state.minutes)
  const targetPct = usePlannerStore((state) => state.targetPct)
  const { summary, selection, coverablePct, peopleCovered, isLoading, error } = usePlannerResult()

  if (error) {
    return (
      <Alert tone="error" title="Could not load the siting analysis">
        {error.message}
      </Alert>
    )
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-h4 text-text-primary">PUDO Siting Analysis</h2>
            <Badge tone="success">Live data</Badge>
          </div>
          <p className="text-caption text-text-secondary">
            Greater Accra + Kasoa
            {summary ? ` · ${summary.total_pop.toLocaleString()} people (WorldPop 2020)` : ''} ·
            every site within {minutes} min walk, targeting {targetPct}% coverage
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="PUDO sites needed"
          value={selection ? selection.nodesNeeded.toLocaleString() : '—'}
          icon={Target}
          isLoading={isLoading}
        />
        <StatCard
          label="Population covered"
          value={selection ? `${selection.achievedPct.toFixed(1)}%` : '—'}
          icon={Hexagon}
          isLoading={isLoading}
          tone={selection && !selection.feasible ? 'warning' : undefined}
        />
        <StatCard
          label="People reached"
          value={peopleCovered !== undefined ? peopleCovered.toLocaleString() : '—'}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          label={`Ceiling at ${minutes} min`}
          value={coverablePct !== undefined ? `${coverablePct.toFixed(1)}%` : '—'}
          icon={Footprints}
          isLoading={isLoading}
          tooltip="The most of the population reachable at this walking time, at any number of sites."
        />
      </div>

      {selection && !selection.feasible && coverablePct !== undefined && (
        <Alert tone="warning" title={`${targetPct}% cannot be reached at ${minutes} minutes`}>
          Only {coverablePct.toFixed(1)}% of the population lives within {minutes} minutes&rsquo;
          walk of any permitted site. The figures above are for the full{' '}
          {selection.nodesNeeded.toLocaleString()}-site network.
        </Alert>
      )}
    </Card>
  )
}
