import type { NodeStatus, CandidateStatus } from '@/mock/nodes'
import type { AnalyticsDateRangePreset } from '@/mock/analyticsTrends'

/**
 * Purpose
 * -------
 * The filter shape shared by AnalyticsFilterBar and every consumer that
 * needs to slice by the same dimensions (summary strip, charts grid).
 * Mirrors features/nodes/filtering.ts's NodeFilters conventions (Set-based
 * multi-select, "empty set = show all") so the two filter systems read
 * the same way even though they're intentionally separate — Analytics
 * filters are UI-only state for this workspace, not shared domain state,
 * per the Phase 8 plan §4 ("Don't add filter state to mapStore or
 * nodeStore").
 */
export interface AnalyticsFilters {
  neighbourhoods: Set<string>
  nodeStatuses: Set<NodeStatus>
  candidateStatuses: Set<CandidateStatus>
  dateRange: AnalyticsDateRangePreset
}

export const DEFAULT_ANALYTICS_FILTERS: AnalyticsFilters = {
  neighbourhoods: new Set(),
  nodeStatuses: new Set(),
  candidateStatuses: new Set(),
  dateRange: '30d',
}

export function hasActiveFilters(filters: AnalyticsFilters): boolean {
  return (
    filters.neighbourhoods.size > 0 ||
    filters.nodeStatuses.size > 0 ||
    filters.candidateStatuses.size > 0 ||
    filters.dateRange !== DEFAULT_ANALYTICS_FILTERS.dateRange
  )
}
