import { lazy, Suspense } from 'react'
import { MetricCard } from '@/components/ui/MetricCard'
import { LoadingState } from '@/components/feedback/LoadingState'
import type { MockNode, MockCandidateNode } from '@/mock/nodes'

/**
 * Purpose
 * -------
 * Composes the five small Chart.js visualizations (Step 10) into a
 * responsive grid, each wrapped in the shared MetricCard so they match
 * every other Dashboard widget. Deliberately embedded here rather than
 * behind its own route — per the Phase 7 prompt, "Do NOT create a
 * separate Analytics page." This IS the Analytics-adjacent surface for
 * now; Phase 8 is a different, dedicated workspace.
 *
 * Lazy-loaded (matching MapWorkspace's pattern in App.tsx) since
 * Chart.js is a meaningfully sized dependency the rest of the Dashboard
 * shouldn't have to wait on.
 *
 * Props
 * -----
 * - existingNodes / candidateNodes: MockNode[] / MockCandidateNode[]
 * - coveragePercent: number — passed through to CoverageTrendChart so
 *   the trend line ends at the same live value the KPI row shows
 */
const CoverageByDistrictChart = lazy(() =>
  import('./charts/CoverageByDistrictChart').then((m) => ({ default: m.CoverageByDistrictChart }))
)
const CandidateDistributionChart = lazy(() =>
  import('./charts/CandidateDistributionChart').then((m) => ({
    default: m.CandidateDistributionChart,
  }))
)
const NodeStatusBreakdownChart = lazy(() =>
  import('./charts/NodeStatusBreakdownChart').then((m) => ({
    default: m.NodeStatusBreakdownChart,
  }))
)
const CoverageTrendChart = lazy(() =>
  import('./charts/CoverageTrendChart').then((m) => ({ default: m.CoverageTrendChart }))
)
const AccessibilityDistributionChart = lazy(() =>
  import('./charts/AccessibilityDistributionChart').then((m) => ({
    default: m.AccessibilityDistributionChart,
  }))
)

export interface DashboardChartsGridProps {
  existingNodes: MockNode[]
  candidateNodes: MockCandidateNode[]
  coveragePercent: number
}

function ChartFallback() {
  return <LoadingState message="Loading chart…" />
}

export function DashboardChartsGrid({
  existingNodes,
  candidateNodes,
  coveragePercent,
}: DashboardChartsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
      <MetricCard title="Coverage by District" description="Lowest-coverage districts first">
        <Suspense fallback={<ChartFallback />}>
          <CoverageByDistrictChart nodes={existingNodes} />
        </Suspense>
      </MetricCard>

      <MetricCard title="Candidate Distribution" description="By review status">
        <Suspense fallback={<ChartFallback />}>
          <CandidateDistributionChart candidates={candidateNodes} />
        </Suspense>
      </MetricCard>

      <MetricCard title="Node Status Breakdown" description="Existing node health">
        <Suspense fallback={<ChartFallback />}>
          <NodeStatusBreakdownChart nodes={existingNodes} />
        </Suspense>
      </MetricCard>

      <MetricCard title="Coverage Trend" description="Last 6 months (illustrative)">
        <Suspense fallback={<ChartFallback />}>
          <CoverageTrendChart currentCoveragePercent={coveragePercent} />
        </Suspense>
      </MetricCard>

      <MetricCard title="Accessibility Distribution" description="Existing nodes by score band">
        <Suspense fallback={<ChartFallback />}>
          <AccessibilityDistributionChart nodes={existingNodes} />
        </Suspense>
      </MetricCard>
    </div>
  )
}
