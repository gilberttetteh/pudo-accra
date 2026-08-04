import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { CoverageByDistrictChart } from '@/features/dashboard/charts/CoverageByDistrictChart'
import { CandidateScoreHistogramChart } from '@/features/analytics/charts/CandidateScoreHistogramChart'
import type { MockNode } from '@/mock/nodes'
import type { ScoredCandidate } from '@/features/map/analysis/candidateRanking'
import type { ReportSectionId } from '../types'

/**
 * Purpose
 * -------
 * Wraps an existing Dashboard (Phase 7) or Analytics (Phase 8) chart
 * component for inclusion in a report — no chart is re-implemented here,
 * this only supplies the Card/title wrapper a report section needs.
 * Reusing the actual chart components (not copies) means a report's
 * chart is pixel-identical to what Dashboard/Analytics already show, and
 * any future fix to those chart components applies here automatically.
 */
export interface ChartSectionProps {
  id: Extract<ReportSectionId, 'coverage-by-district-chart' | 'candidate-score-chart'>
  nodes: MockNode[]
  rankedCandidates: ScoredCandidate[]
}

export function ChartSection({ id, nodes, rankedCandidates }: ChartSectionProps) {
  if (id === 'coverage-by-district-chart') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coverage by District</CardTitle>
        </CardHeader>
        <CoverageByDistrictChart nodes={nodes} />
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate Score Distribution</CardTitle>
      </CardHeader>
      <CandidateScoreHistogramChart ranked={rankedCandidates} />
    </Card>
  )
}
