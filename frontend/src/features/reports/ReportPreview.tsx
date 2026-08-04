import { forwardRef } from 'react'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { CoverageOverviewStats } from '@/features/map/analysis/statistics'
import type { MockNode } from '@/mock/nodes'
import type { ScoredCandidate } from '@/features/map/analysis/candidateRanking'
import { NetworkSummarySection } from './sections/NetworkSummarySection'
import { DistrictBreakdownSection } from './sections/DistrictBreakdownSection'
import { CandidateRecommendationSection } from './sections/CandidateRecommendationSection'
import { ChartSection } from './sections/ChartSection'
import type { DistrictBreakdownRow, CandidateRecommendationRow } from './selectors'
import { REPORT_TYPE_LABELS, type ReportSectionId, type ReportType } from './types'

/**
 * Purpose
 * -------
 * Assembles whichever sections are selected into one scrollable,
 * printable preview — this is both what the user sees on screen and,
 * via the forwarded ref, exactly what gets captured for PDF export
 * (features/reports/export/exportPdf.ts screenshots this element). No
 * section is duplicated or reimplemented here; this component only
 * decides ordering and passes each section its already-computed data.
 *
 * Section order is fixed (network summary → district → candidates →
 * charts) regardless of which report type/section-toggle combination
 * produced the set, so a report always reads top-to-bottom in a
 * consistent, sensible order rather than reflecting checkbox-click
 * order.
 */
const SECTION_ORDER: ReportSectionId[] = [
  'network-summary',
  'district-breakdown',
  'candidate-recommendations',
  'coverage-by-district-chart',
  'candidate-score-chart',
]

export interface ReportPreviewProps {
  reportType: ReportType
  sections: Set<ReportSectionId>
  stats: CoverageOverviewStats
  candidateCount: number
  averageCandidateScore: number
  nodes: MockNode[]
  rankedCandidates: ScoredCandidate[]
  districtRows: DistrictBreakdownRow[]
  candidateRows: CandidateRecommendationRow[]
  generatedAt: Date
}

export const ReportPreview = forwardRef<HTMLDivElement, ReportPreviewProps>(function ReportPreview(
  {
    reportType,
    sections,
    stats,
    candidateCount,
    averageCandidateScore,
    nodes,
    rankedCandidates,
    districtRows,
    candidateRows,
    generatedAt,
  },
  ref
) {
  if (sections.size === 0) {
    return (
      <div ref={ref} className="rounded-xl border border-border bg-surface p-10">
        <EmptyState
          title="No sections selected"
          description="Choose at least one section from the panel to preview and export a report."
        />
      </div>
    )
  }

  return (
    <div ref={ref} className="flex flex-col gap-4 rounded-xl bg-surface p-6">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <p className="text-caption font-semibold uppercase tracking-wide text-text-secondary">
          Accra PUDO Network Planning System
        </p>
        <h2 className="text-h3 text-text-primary">{REPORT_TYPE_LABELS[reportType]}</h2>
        <p className="text-small text-text-secondary">
          Generated {generatedAt.toLocaleDateString()} at {generatedAt.toLocaleTimeString()}
        </p>
      </div>

      {SECTION_ORDER.filter((id) => sections.has(id)).map((id) => {
        switch (id) {
          case 'network-summary':
            return (
              <NetworkSummarySection
                key={id}
                stats={stats}
                candidateCount={candidateCount}
                averageCandidateScore={averageCandidateScore}
              />
            )
          case 'district-breakdown':
            return <DistrictBreakdownSection key={id} rows={districtRows} />
          case 'candidate-recommendations':
            return <CandidateRecommendationSection key={id} rows={candidateRows} />
          case 'coverage-by-district-chart':
            return <ChartSection key={id} id={id} nodes={nodes} rankedCandidates={rankedCandidates} />
          case 'candidate-score-chart':
            return <ChartSection key={id} id={id} nodes={nodes} rankedCandidates={rankedCandidates} />
          default:
            return null
        }
      })}
    </div>
  )
})
