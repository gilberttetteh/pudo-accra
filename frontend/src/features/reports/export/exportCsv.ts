import { toCsv, downloadCsv } from '@/features/analytics/export'
import type { DistrictBreakdownRow, CandidateRecommendationRow } from '../selectors'
import type { ReportType } from '../types'

/**
 * Purpose
 * -------
 * CSV export for the Reports workspace. Deliberately reuses Phase 8's
 * `toCsv`/`downloadCsv` from features/analytics/export.ts rather than
 * re-implementing CSV serialization — the plan's own scoping note (see
 * that file's header comment) draws the Analytics/Reports line at
 * "chart-image + raw-data export" (Analytics) vs. "formatted document
 * generation" (Reports); the underlying CSV *string builder* has no
 * reason to be duplicated between them.
 *
 * One CSV per report (not one per section) — matches the "single
 * downloadable artifact per report" framing used for the PDF export.
 * Which table gets exported depends on the report type: a Network
 * Summary report has no natural row-shaped table, so its CSV falls back
 * to whichever breakdown/candidate rows are present in a custom mix.
 */

export function exportDistrictBreakdownCsv(rows: DistrictBreakdownRow[], filename: string): void {
  downloadCsv(
    toCsv(
      rows.map((row) => ({
        district: row.neighbourhood,
        nodeCount: row.nodeCount,
        averageCoveragePercent: Math.round(row.averageCoverage * 1000) / 10,
        candidateCount: row.candidateCount,
      }))
    ),
    filename
  )
}

export function exportCandidateRecommendationsCsv(
  rows: CandidateRecommendationRow[],
  filename: string
): void {
  downloadCsv(
    toCsv(
      rows.map((row) => ({
        rank: row.rank,
        id: row.id,
        name: row.name,
        district: row.neighbourhood,
        status: row.status,
        overallScorePercent: Math.round(row.overallScore * 1000) / 10,
        coverageImprovementPercent: Math.round(row.coverageImprovement * 1000) / 10,
        accessibilityPercent: Math.round(row.accessibility * 1000) / 10,
        floodSafetyPercent: Math.round(row.floodRisk * 1000) / 10,
      }))
    ),
    filename
  )
}

/** Picks the right CSV export for whichever data is available, based on
 *  report type. Returns false if there was nothing exportable (e.g. a
 *  Network Summary report, whose KPIs don't flatten into a row table). */
export function exportReportCsv(
  reportType: ReportType,
  data: {
    districtRows?: DistrictBreakdownRow[]
    candidateRows?: CandidateRecommendationRow[]
  },
  filenameBase: string
): boolean {
  if (reportType === 'district-breakdown' && data.districtRows?.length) {
    exportDistrictBreakdownCsv(data.districtRows, `${filenameBase}-districts`)
    return true
  }
  if (reportType === 'candidate-recommendations' && data.candidateRows?.length) {
    exportCandidateRecommendationsCsv(data.candidateRows, `${filenameBase}-candidates`)
    return true
  }
  // "custom" reports may include either table — export whichever is present,
  // preferring district data first since it's the broader network view.
  if (data.districtRows?.length) {
    exportDistrictBreakdownCsv(data.districtRows, `${filenameBase}-districts`)
    return true
  }
  if (data.candidateRows?.length) {
    exportCandidateRecommendationsCsv(data.candidateRows, `${filenameBase}-candidates`)
    return true
  }
  return false
}
