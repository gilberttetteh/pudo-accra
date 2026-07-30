import { useMemo } from 'react'
import { useNodeStore } from '@/store/nodeStore'
import { Button } from '@/components/ui/Button'
import { Download } from '@/components/icons'
import { calculateOverviewStatistics } from '@/features/map/analysis/statistics'
import { rankCandidateNodes } from '@/features/map/analysis/candidateRanking'
import { averageCandidateScore } from '@/features/dashboard/selectors'
import { MOCK_POPULATION_CELLS } from '@/mock/population'
import { MOCK_COVERAGE_GAPS } from '@/mock/coverageGaps'
import { useAnalyticsFilterStore } from './store/analyticsFilterStore'
import { filterNodesForAnalytics, filterCandidatesForAnalytics } from './selectors'
import { toCsv, downloadCsv } from './export'
import { AnalyticsFilterBar } from './AnalyticsFilterBar'
import { AnalyticsSummaryStrip } from './AnalyticsSummaryStrip'
import { AnalyticsChartsGrid } from './AnalyticsChartsGrid'

/**
 * Purpose
 * -------
 * Phase 8 standalone Analytics workspace — a deeper, filterable
 * counterpart to the Dashboard's embedded charts (Phase 7), which stay
 * exactly where they are and are not modified or duplicated here. Every
 * number on this page is either:
 *   1. Read directly from useNodeStore (existingNodes, candidateNodes),
 *      filtered by useAnalyticsFilterStore's current selection, or
 *   2. Computed via Phase 6's analysis/* pure functions
 *      (calculateOverviewStatistics, rankCandidateNodes) inside
 *      useMemo, over the *filtered* arrays, or
 *   3. Computed via this feature's own selectors.ts (new groupings
 *      layered on top of #2's output — by-provider, score histograms,
 *      flood-vs-accessibility, isochrone-band coverage).
 * No new scoring/severity logic is introduced — Analytics visualizes
 * what Phase 6 already computes, filtered to a different slice.
 *
 * Coverage gaps (MOCK_COVERAGE_GAPS) are not filtered by district/status
 * since gap records aren't node/candidate records — the "High-priority
 * gaps" summary figure is intentionally network-wide, not filtered, and
 * AnalyticsSummaryStrip documents this via its tooltip.
 *
 * Routing
 * -------
 * Built in isolation, same as DashboardPage — no props wire this into
 * real navigation; that happens whenever a future phase introduces
 * react-router-dom routes (see the Phase 8 plan §7, open question 1).
 */
export function AnalyticsPage() {
  const existingNodes = useNodeStore((state) => state.existingNodes)
  const candidateNodes = useNodeStore((state) => state.candidateNodes)

  const filters = useAnalyticsFilterStore((state) => state.filters)
  const setFilters = useAnalyticsFilterStore((state) => state.setFilters)
  const resetFilters = useAnalyticsFilterStore((state) => state.resetFilters)

  const filteredNodes = useMemo(
    () => filterNodesForAnalytics(existingNodes, filters),
    [existingNodes, filters]
  )
  const filteredCandidates = useMemo(
    () => filterCandidatesForAnalytics(candidateNodes, filters),
    [candidateNodes, filters]
  )

  const stats = useMemo(
    () => calculateOverviewStatistics(filteredNodes, MOCK_POPULATION_CELLS, MOCK_COVERAGE_GAPS),
    [filteredNodes]
  )

  const rankedCandidates = useMemo(
    () =>
      rankCandidateNodes(
        filteredCandidates,
        filteredNodes.map((node) => node.position),
        MOCK_POPULATION_CELLS
      ),
    [filteredCandidates, filteredNodes]
  )

  const avgCandidateScore = useMemo(
    () => averageCandidateScore(rankedCandidates),
    [rankedCandidates]
  )

  const handleExportNodesCsv = () => {
    const rows = filteredNodes.map((node) => ({
      id: node.id,
      name: node.name,
      neighbourhood: node.neighbourhood,
      status: node.status,
      provider: node.provider,
      coverageScore: node.coverageScore,
      accessibilityScore: node.accessibilityScore,
      riskLevel: node.riskLevel,
    }))
    downloadCsv(toCsv(rows), 'pudo-nodes-export')
  }

  const handleExportCandidatesCsv = () => {
    const rows = rankedCandidates.map((entry) => ({
      id: entry.candidate.id,
      name: entry.candidate.name,
      neighbourhood: entry.candidate.neighbourhood,
      status: entry.candidate.status,
      provider: entry.candidate.provider,
      rank: entry.rank,
      overallScore: entry.metrics.overallScore,
    }))
    downloadCsv(toCsv(rows), 'pudo-candidates-export')
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-h2 text-text-primary">Analytics</h1>
          <p className="text-body text-text-secondary">
            Slice the Accra PUDO network by district, status, and time — export what you find.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" leftIcon={Download} onClick={handleExportNodesCsv}>
            Export nodes CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={Download}
            onClick={handleExportCandidatesCsv}
          >
            Export candidates CSV
          </Button>
        </div>
      </div>

      <AnalyticsFilterBar filters={filters} onFiltersChange={setFilters} onReset={resetFilters} />

      <AnalyticsSummaryStrip
        stats={stats}
        filteredNodeCount={filteredNodes.length}
        filteredCandidateCount={filteredCandidates.length}
        averageCandidateScore={avgCandidateScore}
      />

      <AnalyticsChartsGrid
        existingNodes={filteredNodes}
        candidateNodes={filteredCandidates}
        rankedCandidates={rankedCandidates}
        populationCells={MOCK_POPULATION_CELLS}
      />
    </div>
  )
}
