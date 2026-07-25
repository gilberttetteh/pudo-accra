import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon, Sparkles } from '@/components/icons'
import { formatPercent } from '@/utils/formatters'
import { useMapStore } from '@/store/mapStore'
import { useNodeStore } from '@/store/nodeStore'
import { useViewportController } from '@/features/map/viewportController'
import { MOCK_POPULATION_CELLS } from '@/mock/population'
import { rankCandidateNodes } from '@/features/map/analysis/candidateRanking'

/**
 * Purpose
 * -------
 * The Coverage Analysis panel's Recommendations section — the top 3
 * ranked candidates (analysis/candidateRanking.ts), surfaced with a
 * plain-language rationale built from whichever metric drove their
 * ranking. This is a presentation-only reframing of the same ranking
 * data CandidateRankingsSection shows in full — "here's what to do
 * next" rather than "here's everything, sorted."
 *
 * Props
 * -----
 * None — self-contained.
 *
 * Example usage
 * -------------
 * <RecommendationsSection />
 *
 * Accessibility
 * -------------
 * Standard Card composition; "View on map" is a real labeled Button.
 *
 * Future extension
 * -----------------
 * Generate rationale server-side (an LLM summary of the metrics) once a
 * backend exists — the current rationale is a simple rule-based
 * "highest sub-score wins" sentence.
 */
function buildRationale(metrics: ReturnType<typeof rankCandidateNodes>[number]['metrics']): string {
  const entries: [string, number][] = [
    ['adds strong coverage in an underserved area', metrics.coverageImprovement],
    ['sits in a highly accessible location', metrics.accessibility],
    ['has excellent road access', metrics.roadAccess],
    ['would serve a large population', metrics.populationScore],
    ['carries low flood risk', metrics.floodRisk],
  ]
  const [label] = entries.sort((a, b) => b[1] - a[1])[0]!
  return `Recommended because it ${label}.`
}

export function RecommendationsSection() {
  const existingNodes = useNodeStore((state) => state.existingNodes)
  const candidateNodes = useNodeStore((state) => state.candidateNodes)
  const selectNode = useMapStore((state) => state.selectNode)
  const viewport = useViewportController()

  const topCandidates = useMemo(() => {
    const ranked = rankCandidateNodes(
      candidateNodes,
      existingNodes.map((node) => node.position),
      MOCK_POPULATION_CELLS
    )
    return ranked.slice(0, 3)
  }, [candidateNodes, existingNodes])

  return (
    <div className="flex flex-col gap-3">
      {topCandidates.map(({ candidate, metrics, rank }) => (
        <Card key={candidate.id} className="p-3">
          <CardHeader className="mb-2 flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-1.5 text-small">
                <Icon icon={Sparkles} size={14} className="text-warning-500" />#{rank}{' '}
                {candidate.name}
              </CardTitle>
              <CardDescription>{buildRationale(metrics)}</CardDescription>
            </div>
            <Badge tone="success">{formatPercent(metrics.overallScore)}</Badge>
          </CardHeader>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              selectNode(candidate.id)
              viewport.zoomToNode(candidate.position)
            }}
          >
            View on map
          </Button>
        </Card>
      ))}

      {topCandidates.length === 0 && (
        <p className="py-6 text-center text-small text-text-tertiary">
          No candidates available to recommend.
        </p>
      )}
    </div>
  )
}
