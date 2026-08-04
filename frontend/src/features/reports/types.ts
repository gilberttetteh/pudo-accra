import type { NodeStatus, CandidateStatus } from '@/mock/nodes'

/**
 * Purpose
 * -------
 * Shape definitions for the Reports workspace (Phase 9): which report a
 * user is building, which sections it includes, and which filters slice
 * the underlying node/candidate data. Mirrors the Set-based multi-select
 * + "empty set = show all" convention already used by
 * features/nodes/filtering.ts's NodeFilters and features/analytics/types.ts's
 * AnalyticsFilters, so all three filter systems read the same way even
 * though each is scoped to its own workspace's UI state.
 *
 * Reports filters are intentionally a separate type from AnalyticsFilters
 * (not reused directly) since Reports doesn't have a date-range dimension
 * — a report is a point-in-time export, not a trend view.
 */

export type ReportType =
  | 'network-summary'
  | 'district-breakdown'
  | 'candidate-recommendations'
  | 'custom'

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  'network-summary': 'Network Summary',
  'district-breakdown': 'District Breakdown',
  'candidate-recommendations': 'Candidate Recommendations',
  custom: 'Custom Report',
}

export const REPORT_TYPE_DESCRIPTIONS: Record<ReportType, string> = {
  'network-summary': 'Overall coverage, node counts, and gap severity across the network.',
  'district-breakdown': 'Per-district coverage, node density, and candidate activity.',
  'candidate-recommendations': 'Ranked candidate nodes with scoring and risk breakdown.',
  custom: 'Pick exactly which sections to include.',
}

/**
 * A report is assembled from these building blocks. Each maps to one
 * component in features/reports/sections/. "custom" report type starts
 * with none selected; the three named report types start with a sensible
 * default set (see REPORT_TYPE_DEFAULT_SECTIONS) that the user can still
 * adjust — every report is really "custom" underneath, the named types
 * are just starting presets.
 */
export type ReportSectionId =
  | 'network-summary'
  | 'district-breakdown'
  | 'candidate-recommendations'
  | 'coverage-by-district-chart'
  | 'candidate-score-chart'

export const REPORT_SECTION_LABELS: Record<ReportSectionId, string> = {
  'network-summary': 'Network Summary (KPIs)',
  'district-breakdown': 'District Breakdown Table',
  'candidate-recommendations': 'Candidate Recommendations Table',
  'coverage-by-district-chart': 'Coverage by District (chart)',
  'candidate-score-chart': 'Candidate Score Distribution (chart)',
}

export const REPORT_TYPE_DEFAULT_SECTIONS: Record<ReportType, ReportSectionId[]> = {
  'network-summary': ['network-summary', 'coverage-by-district-chart'],
  'district-breakdown': ['district-breakdown', 'coverage-by-district-chart'],
  'candidate-recommendations': ['candidate-recommendations', 'candidate-score-chart'],
  custom: [],
}

export interface ReportFilters {
  neighbourhoods: Set<string>
  nodeStatuses: Set<NodeStatus>
  candidateStatuses: Set<CandidateStatus>
}

export const DEFAULT_REPORT_FILTERS: ReportFilters = {
  neighbourhoods: new Set(),
  nodeStatuses: new Set(),
  candidateStatuses: new Set(),
}

export function hasActiveReportFilters(filters: ReportFilters): boolean {
  return (
    filters.neighbourhoods.size > 0 ||
    filters.nodeStatuses.size > 0 ||
    filters.candidateStatuses.size > 0
  )
}
