import { useMemo, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/layout/Tabs'
import { CoverageOverviewSection } from './CoverageOverviewSection'
import { CoverageStatisticsSection } from './CoverageStatisticsSection'
import { CoverageGapsSection } from './CoverageGapsSection'
import { CandidateRankingsSection } from './CandidateRankingsSection'
import { RecommendationsSection } from './RecommendationsSection'
import { ComparisonSection } from './ComparisonSection'
import { useNodeStore } from '@/store/nodeStore'
import { MOCK_POPULATION_CELLS } from '@/mock/population'
import { MOCK_COVERAGE_GAPS } from '@/mock/coverageGaps'
import { calculateOverviewStatistics } from '@/features/map/analysis/statistics'

/**
 * Purpose
 * -------
 * The Coverage Analysis Workspace's dedicated panel — Phase 6's primary
 * deliverable. Six sections (Overview, Coverage Statistics, Coverage
 * Gaps, Candidate Rankings, Recommendations, Comparison), all reading
 * from nodeStore + the mock GIS datasets directly rather than from
 * MapWorkspace's Node-Management-filtered arrays: coverage analysis
 * answers "how well is the *whole city* covered," which filtering by
 * search/status would distort. Lives in MapSidebarPanel's "Coverage"
 * tab.
 *
 * Props
 * -----
 * None — self-contained.
 *
 * Example usage
 * -------------
 * <CoverageAnalysisPanel />
 *
 * Accessibility
 * -------------
 * Built on Tabs (Radix-backed); see each section's own a11y notes.
 *
 * Future extension
 * -----------------
 * None anticipated beyond what sub-sections already note.
 */
export function CoverageAnalysisPanel() {
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set())
  const existingNodes = useNodeStore((state) => state.existingNodes)

  const overviewStats = useMemo(
    () => calculateOverviewStatistics(existingNodes, MOCK_POPULATION_CELLS, MOCK_COVERAGE_GAPS),
    [existingNodes]
  )

  const toggleCompare = (id: string) => {
    setCompareIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else if (next.size < 4) next.add(id)
      return next
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <p className="text-caption font-semibold uppercase tracking-wide text-text-tertiary">
          Coverage Analysis
        </p>
      </div>

      <Tabs defaultValue="overview" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="flex-wrap px-3 pt-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="statistics">Stats</TabsTrigger>
          <TabsTrigger value="gaps">Gaps</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="recommendations">Recs</TabsTrigger>
          <TabsTrigger value="comparison">Compare</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-3">
          <TabsContent value="overview">
            <CoverageOverviewSection stats={overviewStats} />
          </TabsContent>
          <TabsContent value="statistics">
            <CoverageStatisticsSection />
          </TabsContent>
          <TabsContent value="gaps">
            <CoverageGapsSection />
          </TabsContent>
          <TabsContent value="rankings">
            <CandidateRankingsSection compareIds={compareIds} onToggleCompare={toggleCompare} />
          </TabsContent>
          <TabsContent value="recommendations">
            <RecommendationsSection />
          </TabsContent>
          <TabsContent value="comparison">
            <ComparisonSection compareIds={compareIds} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
