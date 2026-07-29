import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  fetchBoundary,
  fetchExclusions,
  fetchNodeRanking,
  fetchSummary,
  selectNodesForCoverage,
  type CoverageSelection,
  type PlannerSummary,
} from '@/services/planner'
import { usePlannerStore } from '@/store/plannerStore'

/**
 * React access to the real siting analysis.
 *
 * The exported data is immutable between pipeline runs, so these queries are
 * configured to never go stale — once a threshold's ranking is fetched,
 * moving the coverage slider back and forth is pure computation against the
 * cache with no refetching.
 */

/** Analysis data never changes while the app is running. */
const STATIC_QUERY = { staleTime: Infinity, gcTime: Infinity } as const

export function useSummary() {
  return useQuery({
    queryKey: ['planner', 'summary'],
    queryFn: fetchSummary,
    ...STATIC_QUERY,
  })
}

export function useNodeRanking(minutes: number) {
  return useQuery({
    queryKey: ['planner', 'nodes', minutes],
    queryFn: () => fetchNodeRanking(minutes),
    ...STATIC_QUERY,
  })
}

export function useBoundary() {
  return useQuery({
    queryKey: ['planner', 'boundary'],
    queryFn: fetchBoundary,
    ...STATIC_QUERY,
  })
}

export function useExclusions() {
  return useQuery({
    queryKey: ['planner', 'exclusions'],
    queryFn: fetchExclusions,
    ...STATIC_QUERY,
  })
}

export interface PlannerResult {
  summary: PlannerSummary | undefined
  /** Node set meeting the current target — undefined until data loads. */
  selection: CoverageSelection | undefined
  /** Coverage ceiling at the current walking time, regardless of node count. */
  coverablePct: number | undefined
  /** People covered by the current selection. */
  peopleCovered: number | undefined
  walkMeters: number | undefined
  isLoading: boolean
  error: Error | null
}

/**
 * The headline result: everything the dashboard's KPIs and the map's node
 * layer need for the currently selected walking time and coverage target.
 *
 * Recomputes on slider moves without refetching, since the selection is a
 * prefix search over an already-cached ranking.
 */
export function usePlannerResult(): PlannerResult {
  const minutes = usePlannerStore((state) => state.minutes)
  const targetPct = usePlannerStore((state) => state.targetPct)

  const summaryQuery = useSummary()
  const rankingQuery = useNodeRanking(minutes)

  const ranking = rankingQuery.data
  const selection = useMemo(
    () => (ranking ? selectNodesForCoverage(ranking, targetPct) : undefined),
    [ranking, targetPct]
  )

  const summary = summaryQuery.data
  const totalPop = summary?.total_pop

  return {
    summary,
    selection,
    coverablePct: summary?.thresholds[String(minutes)]?.coverable_pct,
    peopleCovered:
      selection && totalPop !== undefined
        ? Math.round((selection.achievedPct / 100) * totalPop)
        : undefined,
    walkMeters: ranking?.walkMeters,
    isLoading: summaryQuery.isLoading || rankingQuery.isLoading,
    error: (summaryQuery.error ?? rankingQuery.error) as Error | null,
  }
}
