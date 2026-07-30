import { useMemo, useState } from 'react'
import { useNodeStore } from '@/store/nodeStore'
import { useMapStore } from '@/store/mapStore'
import { useToast } from '@/components/feedback/Toast'
import { useViewportController } from '@/features/map/viewportController'
import { CreateCandidateForm } from '@/features/nodes/forms/CreateCandidateForm'
import { calculateOverviewStatistics } from '@/features/map/analysis/statistics'
import { rankCandidateNodes } from '@/features/map/analysis/candidateRanking'
import type { ScoredCandidate } from '@/features/map/analysis/candidateRanking'
import { MOCK_POPULATION_CELLS } from '@/mock/population'
import { MOCK_COVERAGE_GAPS } from '@/mock/coverageGaps'
import { MOCK_ACTIVITY_EVENTS } from '@/mock/activity'
import { averageCandidateScore, buildDashboardAlerts } from './selectors'
import { DashboardKpiSection } from './DashboardKpiSection'
import { DashboardMapPreviewCard } from './DashboardMapPreviewCard'
import { DashboardCoverageSummaryCard } from './DashboardCoverageSummaryCard'
import { DashboardCandidateRankingsCard } from './DashboardCandidateRankingsCard'
import { DashboardActivityFeedCard } from './DashboardActivityFeedCard'
import { DashboardQuickActionsCard } from './DashboardQuickActionsCard'
import { DashboardAlertsCard } from './DashboardAlertsCard'
import { DashboardChartsGrid } from './DashboardChartsGrid'

const TOP_CANDIDATE_COUNT = 5

/**
 * Purpose
 * -------
 * Phase 7 operational overview. Not the primary workspace — it's a
 * summary of live nodeStore/mapStore/analysis state with quick access
 * into the real Map Workspace and Node Management flows. Every number
 * on this page is either:
 *   1. Read directly from useNodeStore/useMapStore (existingNodes,
 *      candidateNodes, activeLayers, ...), or
 *   2. Computed via Phase 6's analysis/* pure functions
 *      (calculateOverviewStatistics, rankCandidateNodes) inside
 *      useMemo, or
 *   3. Computed via this feature's own selectors.ts (grouping/bucketing
 *      that layers on top of #2's output, same pattern as #2).
 * Mock activity/alerts/trend data is isolated to mock/activity.ts,
 * mock/systemAlerts.ts, and mock/dashboardTrends.ts — each documents,
 * at the point of definition, exactly what it stands in for and what
 * replaces it once Phase 10's backend exists.
 *
 * No new store fields were added — selectedGapId/highlightedNodeIds
 * (Phase 6) and selectedNodeId/activeLayers (Phase 4) are reused as-is.
 *
 * Routing
 * -------
 * Built in isolation per the current phase's scope — `onOpenMapWorkspace`
 * is an optional prop with no default, so the page renders standalone;
 * wire it to real navigation once routing exists.
 */
export interface DashboardPageProps {
  onOpenMapWorkspace?: () => void
  onInspectNodes?: () => void
  onViewAnalytics?: () => void
}

export function DashboardPage({ onOpenMapWorkspace, onInspectNodes, onViewAnalytics }: DashboardPageProps) {
  const existingNodes = useNodeStore((state) => state.existingNodes)
  const candidateNodes = useNodeStore((state) => state.candidateNodes)
  const addCandidate = useNodeStore((state) => state.addCandidate)

  const selectNode = useMapStore((state) => state.selectNode)
  const selectGap = useMapStore((state) => state.selectGap)
  const toggleLayer = useMapStore((state) => state.toggleLayer)
  const activeLayers = useMapStore((state) => state.activeLayers)

  const { showToast } = useToast()
  const viewport = useViewportController()

  const [isCreateCandidateOpen, setCreateCandidateOpen] = useState(false)

  const stats = useMemo(
    () => calculateOverviewStatistics(existingNodes, MOCK_POPULATION_CELLS, MOCK_COVERAGE_GAPS),
    [existingNodes]
  )

  const rankedCandidates = useMemo<ScoredCandidate[]>(
    () =>
      rankCandidateNodes(
        candidateNodes,
        existingNodes.map((node) => node.position),
        MOCK_POPULATION_CELLS
      ),
    [candidateNodes, existingNodes]
  )

  const topCandidates = rankedCandidates.slice(0, TOP_CANDIDATE_COUNT)
  const avgCandidateScore = useMemo(() => averageCandidateScore(rankedCandidates), [rankedCandidates])

  const alerts = useMemo(
    () => buildDashboardAlerts(MOCK_COVERAGE_GAPS, candidateNodes),
    [candidateNodes]
  )

  const handleViewCandidateOnMap = (entry: ScoredCandidate) => {
    selectNode(entry.candidate.id)
    viewport.zoomToNode(entry.candidate.position)
  }

  const handleViewCoverageGaps = () => {
    const topGap = [...MOCK_COVERAGE_GAPS].sort(
      (a, b) => b.populationAffected - a.populationAffected
    )[0]
    if (!topGap) return
    selectGap(topGap.id)
    viewport.zoomToNode(topGap.position, 13)
  }

  const handleManageLayers = () => {
    toggleLayer('coverage-gaps')
    showToast({
      tone: 'info',
      title: 'Coverage Gaps layer toggled',
      description: activeLayers['coverage-gaps']
        ? 'Layer hidden. Open the full Map Workspace to manage every layer.'
        : 'Layer shown. Open the full Map Workspace to manage every layer.',
    })
  }

  const handleRunCoverageAnalysis = () => {
    showToast({
      tone: 'success',
      title: 'Coverage analysis refreshed',
      description: 'Statistics above reflect the current node network.',
    })
  }

  const handleAlertViewDetails = (alert: { source: string; linkedId?: string }) => {
    if (alert.source === 'coverage-gap' && alert.linkedId) {
      selectGap(alert.linkedId)
    } else if (alert.source === 'candidate-approval' && alert.linkedId) {
      selectNode(alert.linkedId)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-h2 text-text-primary">Operations Overview</h1>
        <p className="text-body text-text-secondary">
          A summary of the Accra PUDO network — open the Map Workspace for full detail.
        </p>
      </div>

      <DashboardKpiSection
        stats={stats}
        candidateCount={candidateNodes.length}
        averageCandidateScore={avgCandidateScore}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <DashboardMapPreviewCard
            existingNodes={existingNodes}
            candidateNodes={candidateNodes}
            onOpenMapWorkspace={onOpenMapWorkspace}
          />
          <DashboardCandidateRankingsCard
            ranked={topCandidates}
            onViewOnMap={handleViewCandidateOnMap}
          />
        </div>

        <div className="flex flex-col gap-6">
          <DashboardCoverageSummaryCard stats={stats} existingNodes={existingNodes} />
          <DashboardActivityFeedCard events={MOCK_ACTIVITY_EVENTS} />
          <DashboardAlertsCard alerts={alerts} onViewDetails={handleAlertViewDetails} />
        </div>
      </div>

      <DashboardQuickActionsCard
        onOpenMapWorkspace={onOpenMapWorkspace}
        onCreateCandidate={() => setCreateCandidateOpen(true)}
        onRunCoverageAnalysis={handleRunCoverageAnalysis}
        onViewCoverageGaps={handleViewCoverageGaps}
        onInspectNodes={onInspectNodes}
        onManageLayers={handleManageLayers}
        onViewAnalytics={onViewAnalytics}
      />

      <DashboardChartsGrid
        existingNodes={existingNodes}
        candidateNodes={candidateNodes}
        coveragePercent={stats.coveragePercent}
      />

      <CreateCandidateForm
        open={isCreateCandidateOpen}
        onOpenChange={setCreateCandidateOpen}
        onSubmit={(values) => {
          const id = `candidate-manual-${Date.now()}`
          addCandidate({
            id,
            name: values.name,
            neighbourhood: values.neighbourhood,
            position: [values.latitude, values.longitude],
            status: 'proposed',
            provider: values.provider,
            suitabilityScore: 0.5,
            accessibilityScore: 0.5,
            nearestRoadDistanceMeters: 200,
            riskLevel: 'low',
            estimatedCoverageGain: 0.1,
            address: values.address,
            lastUpdated: new Date().toISOString(),
          })
          selectNode(id)
          showToast({ tone: 'success', title: 'Candidate created', description: values.name })
        }}
      />
    </div>
  )
}
