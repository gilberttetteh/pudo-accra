import { createStore } from '@/store/createStore'
import type { NodeStatus, CandidateStatus } from '@/mock/nodes'
import type { AnalyticsDateRangePreset } from '@/mock/analyticsTrends'
import { DEFAULT_ANALYTICS_FILTERS, type AnalyticsFilters } from '../types'

/**
 * Purpose
 * -------
 * Analytics-specific UI state (the filter bar's selections), shared
 * across AnalyticsFilterBar + AnalyticsSummaryStrip + every chart in
 * AnalyticsChartsGrid. Built as its own small store (same createStore
 * factory every other store in the app uses) rather than lifting
 * useState up through AnalyticsPage, since the chart grid sits a couple
 * of levels deep and prop-drilling five charts' worth of filter props
 * would be noisier than one selector call per chart.
 *
 * Deliberately NOT part of mapStore or nodeStore — this is view state
 * for one workspace, not shared domain data (see the Phase 8 plan §4:
 * "Don't add filter state to mapStore or nodeStore; it's
 * Analytics-specific UI state").
 *
 * Usage
 * -----
 * const filters = useAnalyticsFilterStore((s) => s.filters)
 * const setFilters = useAnalyticsFilterStore((s) => s.setFilters)
 * const resetFilters = useAnalyticsFilterStore((s) => s.resetFilters)
 */
interface AnalyticsFilterState {
  filters: AnalyticsFilters
  setFilters: (filters: AnalyticsFilters) => void
  toggleNeighbourhood: (neighbourhood: string) => void
  toggleNodeStatus: (status: NodeStatus) => void
  toggleCandidateStatus: (status: CandidateStatus) => void
  setDateRange: (range: AnalyticsDateRangePreset) => void
  resetFilters: () => void
}

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

export const useAnalyticsFilterStore = createStore<AnalyticsFilterState>((set, get) => ({
  filters: DEFAULT_ANALYTICS_FILTERS,

  setFilters: (filters) => set({ filters }),

  toggleNeighbourhood: (neighbourhood) =>
    set({
      filters: {
        ...get().filters,
        neighbourhoods: toggleInSet(get().filters.neighbourhoods, neighbourhood),
      },
    }),

  toggleNodeStatus: (status) =>
    set({
      filters: {
        ...get().filters,
        nodeStatuses: toggleInSet(get().filters.nodeStatuses, status),
      },
    }),

  toggleCandidateStatus: (status) =>
    set({
      filters: {
        ...get().filters,
        candidateStatuses: toggleInSet(get().filters.candidateStatuses, status),
      },
    }),

  setDateRange: (dateRange) => set({ filters: { ...get().filters, dateRange } }),

  resetFilters: () => set({ filters: DEFAULT_ANALYTICS_FILTERS }),
}))
