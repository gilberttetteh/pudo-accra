import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/forms/Checkbox'
import { Select } from '@/components/forms/Select'
import { Button } from '@/components/ui/Button'
import { formatPercent, formatNumber } from '@/utils/formatters'
import { useMapStore } from '@/store/mapStore'
import { useNodeStore } from '@/store/nodeStore'
import { useViewportController } from '@/features/map/viewportController'
import { MOCK_POPULATION_CELLS } from '@/mock/population'
import {
  rankCandidateNodes,
  filterCandidatesByMinScore,
  type ScoredCandidate,
} from '@/features/map/analysis/candidateRanking'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The Coverage Analysis panel's Candidate Rankings section — every
 * candidate node scored (analysis/candidateRanking.ts's
 * rankCandidateNodes, using coverageAnalysis.ts + scoring.ts under the
 * hood) and shown as a ranked card. Supports a minimum-score filter, a
 * sort-metric picker, and multi-select for Comparison Mode (up to 4
 * candidates — a side-by-side table beyond that gets unreadable).
 *
 * Props
 * -----
 * - compareIds: Set<string> / onToggleCompare: (id) => void — lifted to
 *   CoverageAnalysisPanel so ComparisonSection can read the same selection
 *
 * Example usage
 * -------------
 * <CandidateRankingsSection compareIds={compareIds} onToggleCompare={toggleCompare} />
 *
 * Accessibility
 * -------------
 * Each card's compare checkbox has an accessible label; rank number is
 * conveyed as visible text, not color alone.
 *
 * Future extension
 * -----------------
 * Add custom weight sliders (wired to scoring.ts's ScoreWeights) once
 * planners want to tune coverage-vs-flood-risk tradeoffs themselves.
 */
const MAX_COMPARE = 4

export interface CandidateRankingsSectionProps {
  compareIds: Set<string>
  onToggleCompare: (id: string) => void
}

const SORT_OPTIONS = [
  { value: 'overallScore', label: 'Overall Score' },
  { value: 'coverageImprovement', label: 'Coverage Improvement' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'populationServed', label: 'Population Served' },
]

export function CandidateRankingsSection({
  compareIds,
  onToggleCompare,
}: CandidateRankingsSectionProps) {
  const [minScore, setMinScore] = useState(0)
  const [sortKey, setSortKey] = useState<keyof ScoredCandidate['metrics']>('overallScore')

  const existingNodes = useNodeStore((state) => state.existingNodes)
  const candidateNodes = useNodeStore((state) => state.candidateNodes)
  const selectedNodeId = useMapStore((state) => state.selectedNodeId)
  const selectNode = useMapStore((state) => state.selectNode)
  const viewport = useViewportController()

  const ranked = useMemo(() => {
    const scored = rankCandidateNodes(
      candidateNodes,
      existingNodes.map((node) => node.position),
      MOCK_POPULATION_CELLS
    )
    const filtered = filterCandidatesByMinScore(scored, minScore)
    return [...filtered].sort((a, b) => b.metrics[sortKey] - a.metrics[sortKey])
  }, [candidateNodes, existingNodes, minScore, sortKey])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        <Select
          value={sortKey}
          onValueChange={(value) => setSortKey(value as keyof ScoredCandidate['metrics'])}
          options={SORT_OPTIONS}
          size="sm"
          aria-label="Sort candidates by"
          className="flex-1"
        />
        <Select
          value={String(minScore)}
          onValueChange={(value) => setMinScore(Number(value))}
          options={[
            { value: '0', label: 'All scores' },
            { value: '0.5', label: '50%+' },
            { value: '0.7', label: '70%+' },
          ]}
          size="sm"
          aria-label="Minimum score"
        />
      </div>

      <p className="text-caption text-text-tertiary">
        Select up to {MAX_COMPARE} candidates to compare. {compareIds.size}/{MAX_COMPARE} selected.
      </p>

      <div className="flex flex-col gap-2.5">
        {ranked.map(({ candidate, metrics, rank }) => {
          const isSelected = candidate.id === selectedNodeId
          const isCompareChecked = compareIds.has(candidate.id)
          const compareDisabled = !isCompareChecked && compareIds.size >= MAX_COMPARE

          return (
            <Card
              key={candidate.id}
              className={cn('cursor-pointer p-3', isSelected && 'border-primary-500')}
              onClick={() => {
                selectNode(candidate.id)
                viewport.zoomToNode(candidate.position)
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-tertiary text-caption font-semibold text-text-secondary">
                    {rank}
                  </span>
                  <div>
                    <p className="text-small font-medium text-text-primary">{candidate.name}</p>
                    <p className="text-caption text-text-tertiary">{candidate.neighbourhood}</p>
                  </div>
                </div>
                <div
                  onClick={(event) => event.stopPropagation()}
                  className="flex items-center gap-1.5"
                >
                  <Checkbox
                    checked={isCompareChecked}
                    disabled={compareDisabled}
                    onCheckedChange={() => onToggleCompare(candidate.id)}
                    aria-label={`Compare ${candidate.name}`}
                  />
                </div>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-1.5 text-caption">
                <div>
                  <p className="text-text-tertiary">Overall</p>
                  <Badge
                    tone={
                      metrics.overallScore >= 0.6
                        ? 'success'
                        : metrics.overallScore >= 0.4
                          ? 'warning'
                          : 'error'
                    }
                    size="sm"
                  >
                    {formatPercent(metrics.overallScore)}
                  </Badge>
                </div>
                <div>
                  <p className="text-text-tertiary">Coverage +</p>
                  <p className="text-text-primary">{formatPercent(metrics.coverageImprovement)}</p>
                </div>
                <div>
                  <p className="text-text-tertiary">Population</p>
                  <p className="text-text-primary">{formatNumber(metrics.populationServed)}</p>
                </div>
              </div>
            </Card>
          )
        })}

        {ranked.length === 0 && (
          <p className="py-6 text-center text-small text-text-tertiary">
            No candidates meet this score threshold.
          </p>
        )}
      </div>

      <Button variant="link" size="sm" onClick={() => setMinScore(0)} className="self-start">
        Reset filter
      </Button>
    </div>
  )
}
