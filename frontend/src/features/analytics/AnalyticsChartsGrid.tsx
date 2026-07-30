import { lazy, Suspense } from 'react'
import { MetricCard } from '@/components/ui/MetricCard'
import { LoadingState } from '@/components/feedback/LoadingState'
import type { MockNode, MockCandidateNode } from '@/mock/nodes'
import type { PopulationCell } from '@/mock/population'
import type { ScoredCandidate } from '@/features/map/analysis/candidateRanking'

/**
 * Purpose
 * -------
 * Composes Analytics' five new charts (Phase 8 plan §3.2) into a
 * responsive grid — same lazy-loading + MetricCard-wrapping pattern as
 * DashboardChartsGrid (Phase 7), since Chart.js is a meaningfully sized
 * dependency neither workspace should force onto the initial bundle.
 * This is a genuinely separate grid from DashboardChartsGrid, not a
 * duplicate — five different charts, filtered by AnalyticsFilterBar's
 * state, which the Dashboard's charts don't accept at all.
 *
 * Props
 * -----
 * - existingNodes / candidateNodes: MockNode[] / MockCandidateNode[]
 *   (already filtered by AnalyticsPage before being passed down)
 * - rankedCandidates: ScoredCandidate[] (already filtered)
 * - populationCells: PopulationCell[]
 */
const NodeDensityScatterChart = lazy(() =>
  import('./charts/NodeDensityScatterChart').then((m) => ({ default: m.NodeDensityScatterChart }))
)
const CandidateScoreHistogramChart = lazy(() =>
  import('./charts/CandidateScoreHistogramChart').then((m) => ({
    default: m.CandidateScoreHistogramChart,
  }))
)
const FloodAccessibilityScatterChart = lazy(() =>
  import('./charts/FloodAccessibilityScatterChart').then((m) => ({
    default: m.FloodAccessibilityScatterChart,
  }))
)
const ProviderComparisonChart = lazy(() =>
  import('./charts/ProviderComparisonChart').then((m) => ({ default: m.ProviderComparisonChart }))
)
const IsochroneCoverageByBandChart = lazy(() =>
  import('./charts/IsochroneCoverageByBandChart').then((m) => ({
    default: m.IsochroneCoverageByBandChart,
  }))
)

export interface AnalyticsChartsGridProps {
  existingNodes: MockNode[]
  candidateNodes: MockCandidateNode[]
  rankedCandidates: ScoredCandidate[]
  populationCells: PopulationCell[]
}

function ChartFallback() {
  return <LoadingState message="Loading chart…" />
}

export function AnalyticsChartsGrid({
  existingNodes,
  candidateNodes,
  rankedCandidates,
  populationCells,
}: AnalyticsChartsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
      <MetricCard title="Node Density vs Population" description="Nodes vs. population density by district">
        <Suspense fallback={<ChartFallback />}>
          <NodeDensityScatterChart nodes={existingNodes} populationCells={populationCells} />
        </Suspense>
      </MetricCard>

      <MetricCard title="Candidate Score Distribution" description="Overall score, 10-point bands">
        <Suspense fallback={<ChartFallback />}>
          <CandidateScoreHistogramChart ranked={rankedCandidates} />
        </Suspense>
      </MetricCard>

      <MetricCard title="Flood Risk vs Accessibility" description="Are safe locations also accessible?">
        <Suspense fallback={<ChartFallback />}>
          <FloodAccessibilityScatterChart candidates={candidateNodes} />
        </Suspense>
      </MetricCard>

      <MetricCard title="Provider Comparison" description="Existing vs candidate nodes by provider">
        <Suspense fallback={<ChartFallback />}>
          <ProviderComparisonChart existingNodes={existingNodes} candidateNodes={candidateNodes} />
        </Suspense>
      </MetricCard>

      <MetricCard title="Coverage by Walk-Time Band" description="5 / 10 / 15 / 20 minute isochrones">
        <Suspense fallback={<ChartFallback />}>
          <IsochroneCoverageByBandChart nodes={existingNodes} populationCells={populationCells} />
        </Suspense>
      </MetricCard>
    </div>
  )
}
