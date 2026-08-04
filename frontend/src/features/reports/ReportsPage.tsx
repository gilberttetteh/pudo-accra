import { useMemo, useRef, useState } from 'react'
import { useNodeStore } from '@/store/nodeStore'
import { Button } from '@/components/ui/Button'
import { Download, FileText } from '@/components/icons'
import { calculateOverviewStatistics } from '@/features/map/analysis/statistics'
import { rankCandidateNodes } from '@/features/map/analysis/candidateRanking'
import { averageCandidateScore } from '@/features/dashboard/selectors'
import { MOCK_POPULATION_CELLS } from '@/mock/population'
import { MOCK_COVERAGE_GAPS } from '@/mock/coverageGaps'
import { useReportBuilderStore } from './store/reportBuilderStore'
import { filterNodesForReport, filterCandidatesForReport, buildDistrictBreakdown, buildCandidateRecommendationRows } from './selectors'
import { exportReportCsv } from './export/exportCsv'
import { ReportBuilderPanel } from './ReportBuilderPanel'
import { ReportPreview } from './ReportPreview'
import { REPORT_TYPE_LABELS } from './types'

/**
 * Purpose
 * -------
 * Phase 9 Reports workspace — a configurable, exportable report builder.
 * Every number shown comes from one of three places, same discipline as
 * every workspace before it:
 *   1. useNodeStore (existingNodes, candidateNodes), filtered by
 *      useReportBuilderStore's current selection.
 *   2. Phase 6's analysis/* pure functions (calculateOverviewStatistics,
 *      rankCandidateNodes), called via useMemo over the *filtered* data.
 *   3. This feature's own selectors.ts (buildDistrictBreakdown,
 *      buildCandidateRecommendationRows) — new row-shaping only, no new
 *      scoring/severity logic.
 *
 * Export
 * ------
 * - CSV: reuses Phase 8's toCsv/downloadCsv via export/exportCsv.ts.
 * - PDF: screenshots the ReportPreview DOM node via
 *   export/exportPdf.ts (jsPDF + html2canvas) — see that file's header
 *   comment for the trade-offs of this approach vs a real paginated PDF
 *   document tree.
 *
 * Routing
 * -------
 * Mounted at /reports in App.tsx, replacing the Phase 8 ComingSoonPage
 * placeholder.
 */
export function ReportsPage() {
  const existingNodes = useNodeStore((state) => state.existingNodes)
  const candidateNodes = useNodeStore((state) => state.candidateNodes)

  const reportType = useReportBuilderStore((state) => state.reportType)
  const sections = useReportBuilderStore((state) => state.sections)
  const filters = useReportBuilderStore((state) => state.filters)
  const setReportType = useReportBuilderStore((state) => state.setReportType)
  const toggleSection = useReportBuilderStore((state) => state.toggleSection)
  const setNeighbourhood = useReportBuilderStore((state) => state.setNeighbourhood)
  const toggleNodeStatus = useReportBuilderStore((state) => state.toggleNodeStatus)
  const toggleCandidateStatus = useReportBuilderStore((state) => state.toggleCandidateStatus)
  const resetFilters = useReportBuilderStore((state) => state.resetFilters)

  const previewRef = useRef<HTMLDivElement>(null)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const filteredNodes = useMemo(
    () => filterNodesForReport(existingNodes, filters),
    [existingNodes, filters]
  )
  const filteredCandidates = useMemo(
    () => filterCandidatesForReport(candidateNodes, filters),
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

  const avgCandidateScore = useMemo(() => averageCandidateScore(rankedCandidates), [rankedCandidates])

  const districtRows = useMemo(
    () => buildDistrictBreakdown(filteredNodes, filteredCandidates),
    [filteredNodes, filteredCandidates]
  )

  const candidateRows = useMemo(
    () => buildCandidateRecommendationRows(rankedCandidates),
    [rankedCandidates]
  )

  const generatedAt = useMemo(() => new Date(), [])

  const filenameBase = `pudo-report-${reportType}-${generatedAt.toISOString().slice(0, 10)}`

  const handleExportCsv = () => {
    const exported = exportReportCsv(reportType, { districtRows, candidateRows }, filenameBase)
    if (!exported) {
      // Network Summary (and any custom mix with only KPIs selected) has
      // no row-shaped table to export as CSV — the KPIs themselves are
      // only meaningful in the PDF's formatted layout.
      window.alert(
        'This report has no tabular data to export as CSV. Add a District Breakdown or Candidate Recommendations section, or use PDF export.'
      )
    }
  }

  const handleExportPdf = async () => {
    if (!previewRef.current) return
    setIsExportingPdf(true)
    try {
      // jsPDF + html2canvas are ~180kB gzipped combined — dynamically
      // imported here so they only load when someone actually exports a
      // PDF, rather than being bundled into the /reports route's initial
      // chunk for every visitor.
      const { exportReportAsPdf } = await import('./export/exportPdf')
      await exportReportAsPdf(previewRef.current, filenameBase)
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-h2 text-text-primary">Reports</h1>
          <p className="text-body text-text-secondary">
            Build a configurable report from live network data, then export it as PDF or CSV.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" leftIcon={Download} onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={FileText}
            onClick={handleExportPdf}
            disabled={isExportingPdf || sections.size === 0}
          >
            {isExportingPdf ? 'Generating PDF…' : 'Export PDF'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <ReportBuilderPanel
          reportType={reportType}
          onReportTypeChange={setReportType}
          sections={sections}
          onToggleSection={toggleSection}
          filters={filters}
          onSetNeighbourhood={setNeighbourhood}
          onToggleNodeStatus={toggleNodeStatus}
          onToggleCandidateStatus={toggleCandidateStatus}
          onResetFilters={resetFilters}
        />

        <div className="min-w-0 flex-1">
          <ReportPreview
            ref={previewRef}
            reportType={reportType}
            sections={sections}
            stats={stats}
            candidateCount={filteredCandidates.length}
            averageCandidateScore={avgCandidateScore}
            nodes={filteredNodes}
            rankedCandidates={rankedCandidates}
            districtRows={districtRows}
            candidateRows={candidateRows}
            generatedAt={generatedAt}
          />
        </div>
      </div>

      <p className="text-caption text-text-tertiary">
        {REPORT_TYPE_LABELS[reportType]} · {filteredNodes.length} nodes ·{' '}
        {filteredCandidates.length} candidates in scope
      </p>
    </div>
  )
}
