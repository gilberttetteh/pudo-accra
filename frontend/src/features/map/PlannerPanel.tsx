import { Select } from '@/components/forms/Select'
import { Alert } from '@/components/feedback/Alert'
import { StatCard } from '@/components/ui/StatCard'
import { Target, Users, Footprints, Hexagon } from '@/components/icons'
import { usePlannerResult } from '@/hooks/usePlannerData'
import { usePlannerStore, WALK_MINUTE_OPTIONS } from '@/store/plannerStore'

/**
 * Purpose
 * -------
 * The controls for the real siting analysis, and the answer they produce.
 *
 * Two inputs drive everything: how far someone should have to walk, and how
 * much of the population must be covered. The result — how many PUDO sites
 * that takes, and which ones — comes from the greedy max-coverage solve in
 * `analysis/`, computed over OSM's walkable road network and WorldPop 2020
 * population counts. Moving either control re-slices an already-loaded
 * ranking, so it responds instantly and never hits the network.
 *
 * Every number in this panel is measured. That is not true of the rest of
 * the workspace, which still renders mock data, so this panel deliberately
 * says where its numbers come from rather than leaving them to be mistaken
 * for the sample data next to them.
 *
 * Example usage
 * -------------
 * <PlannerPanel />   // in MapSidebarPanel's "Planner" tab
 */
export function PlannerPanel() {
  const minutes = usePlannerStore((state) => state.minutes)
  const targetPct = usePlannerStore((state) => state.targetPct)
  const setMinutes = usePlannerStore((state) => state.setMinutes)
  const setTargetPct = usePlannerStore((state) => state.setTargetPct)

  const { summary, selection, coverablePct, peopleCovered, walkMeters, isLoading, error } =
    usePlannerResult()

  if (error) {
    return (
      <Alert tone="error" title="Could not load the analysis data">
        {error.message}
      </Alert>
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-caption font-medium text-text-secondary">
            Max walking time to a site
          </label>
          <Select
            value={String(minutes)}
            onValueChange={(value) => setMinutes(Number(value))}
            options={WALK_MINUTE_OPTIONS.map((m) => ({
              value: String(m),
              label: `${m} minutes`,
            }))}
          />
          {walkMeters !== undefined && summary && (
            <p className="text-caption text-text-secondary">
              ≈ {walkMeters.toLocaleString()} m along roads, at{' '}
              {summary.walk_speed_m_min} m/min
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <label htmlFor="coverage-target" className="text-caption font-medium text-text-secondary">
              Population coverage target
            </label>
            <span className="text-body font-semibold text-text-primary">{targetPct}%</span>
          </div>
          <input
            id="coverage-target"
            type="range"
            min={50}
            max={100}
            step={1}
            value={targetPct}
            onChange={(event) => setTargetPct(Number(event.target.value))}
            className="w-full accent-[var(--color-primary,#6366f1)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Sites needed"
          value={selection ? selection.nodesNeeded.toLocaleString() : '—'}
          icon={Target}
          isLoading={isLoading}
        />
        <StatCard
          label="Coverage reached"
          value={selection ? `${selection.achievedPct.toFixed(1)}%` : '—'}
          icon={Hexagon}
          isLoading={isLoading}
          tone={selection && !selection.feasible ? 'warning' : undefined}
        />
        <StatCard
          label="People covered"
          value={peopleCovered !== undefined ? peopleCovered.toLocaleString() : '—'}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          label="Reachable ceiling"
          value={coverablePct !== undefined ? `${coverablePct.toFixed(1)}%` : '—'}
          icon={Footprints}
          isLoading={isLoading}
          tooltip={`The most of the population that can be reached within ${minutes} minutes' walk, at any number of sites. The rest live too far from anywhere a site is allowed to go.`}
        />
      </div>

      {selection && !selection.feasible && coverablePct !== undefined && (
        <Alert tone="warning" title={`${targetPct}% is out of reach at ${minutes} minutes`}>
          Only {coverablePct.toFixed(1)}% of the population has any permitted site within{' '}
          {minutes} minutes&rsquo; walk. Showing the full{' '}
          {selection.nodesNeeded.toLocaleString()}-site network, which reaches{' '}
          {selection.achievedPct.toFixed(1)}%. Allow a longer walk to cover more.
        </Alert>
      )}

      {summary && (
        <p className="text-caption leading-relaxed text-text-secondary">
          Greater Accra + Kasoa, {summary.total_pop.toLocaleString()} people (WorldPop 2020).
          Sites are ranked greedily, so each one shown adds the most remaining coverage of any
          location still available — the first few hundred do most of the work.
        </p>
      )}
    </div>
  )
}
