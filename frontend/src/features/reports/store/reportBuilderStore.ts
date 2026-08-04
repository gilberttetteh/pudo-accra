import { createStore } from '@/store/createStore'
import type { NodeStatus, CandidateStatus } from '@/mock/nodes'
import {
  DEFAULT_REPORT_FILTERS,
  REPORT_TYPE_DEFAULT_SECTIONS,
  type ReportFilters,
  type ReportSectionId,
  type ReportType,
} from '../types'

/**
 * Purpose
 * -------
 * Report-builder UI state: which report type is selected, which sections
 * are checked, and the current filter selections. Own small store (same
 * createStore factory every other store uses), deliberately NOT added to
 * mapStore/nodeStore/analyticsFilterStore — this is view state scoped to
 * one workspace, not shared domain data, following the precedent set by
 * Phase 8's analyticsFilterStore.
 *
 * Session-only by design: there's no backend until Phase 10, so a
 * "custom" report configuration is rebuilt each visit rather than saved.
 * If named/saved report configs become a requirement later, this store's
 * shape (type + sections + filters) is exactly the payload that would
 * get persisted.
 *
 * Usage
 * -----
 * const reportType = useReportBuilderStore((s) => s.reportType)
 * const setReportType = useReportBuilderStore((s) => s.setReportType)
 */
function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

interface ReportBuilderState {
  reportType: ReportType
  sections: Set<ReportSectionId>
  filters: ReportFilters

  setReportType: (type: ReportType) => void
  toggleSection: (id: ReportSectionId) => void

  /** Replaces the whole neighbourhood selection with either a single
   *  district or "all" (empty set) — the District filter is a single-
   *  select Select control, not a multi-select chip row, so this
   *  replaces rather than toggles (see toggleNeighbourhood below for
   *  the multi-select variant, kept for API symmetry with
   *  Analytics/Nodes filters even though this panel's UI currently only
   *  drives one district at a time). */
  setNeighbourhood: (neighbourhood: string | null) => void
  toggleNeighbourhood: (neighbourhood: string) => void
  toggleNodeStatus: (status: NodeStatus) => void
  toggleCandidateStatus: (status: CandidateStatus) => void
  resetFilters: () => void
}

export const useReportBuilderStore = createStore<ReportBuilderState>((set, get) => ({
  reportType: 'network-summary',
  sections: new Set(REPORT_TYPE_DEFAULT_SECTIONS['network-summary']),
  filters: DEFAULT_REPORT_FILTERS,

  // Switching report type resets sections to that type's default preset
  // — the user can still hand-adjust from there, but starting from a
  // sensible preset beats either an empty checklist or carrying over an
  // unrelated type's section choices.
  setReportType: (type) => set({ reportType: type, sections: new Set(REPORT_TYPE_DEFAULT_SECTIONS[type]) }),

  toggleSection: (id) => set({ sections: toggleInSet(get().sections, id) }),

  setNeighbourhood: (neighbourhood) =>
    set({
      filters: {
        ...get().filters,
        neighbourhoods: neighbourhood ? new Set([neighbourhood]) : new Set(),
      },
    }),

  toggleNeighbourhood: (neighbourhood) =>
    set({
      filters: {
        ...get().filters,
        neighbourhoods: toggleInSet(get().filters.neighbourhoods, neighbourhood),
      },
    }),

  toggleNodeStatus: (status) =>
    set({
      filters: { ...get().filters, nodeStatuses: toggleInSet(get().filters.nodeStatuses, status) },
    }),

  toggleCandidateStatus: (status) =>
    set({
      filters: {
        ...get().filters,
        candidateStatuses: toggleInSet(get().filters.candidateStatuses, status),
      },
    }),

  resetFilters: () => set({ filters: DEFAULT_REPORT_FILTERS }),
}))
