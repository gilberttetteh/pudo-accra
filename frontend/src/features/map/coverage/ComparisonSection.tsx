import { useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatPercent, formatNumber } from '@/utils/formatters'
import { useNodeStore } from '@/store/nodeStore'
import { MOCK_POPULATION_CELLS } from '@/mock/population'
import { rankCandidateNodes } from '@/features/map/analysis/candidateRanking'
import { compareCandidates } from '@/features/map/analysis/comparison'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The Coverage Analysis panel's Comparison Mode — a side-by-side table
 * of whichever candidates were checked in CandidateRankingsSection,
 * pivoted via analysis/comparison.ts's compareCandidates() so each row
 * is a metric and each column a candidate, with the best value per row
 * highlighted.
 *
 * Props
 * -----
 * - compareIds: Set<string>
 *
 * Example usage
 * -------------
 * <ComparisonSection compareIds={compareIds} />
 *
 * Accessibility
 * -------------
 * Real `<table>` markup with scoped headers.
 *
 * Future extension
 * -----------------
 * Add a "remove from comparison" affordance directly in the table header
 * once comparisons regularly involve the full 4-candidate limit.
 */
export function ComparisonSection({ compareIds }: { compareIds: Set<string> }) {
  const existingNodes = useNodeStore((state) => state.existingNodes)
  const candidateNodes = useNodeStore((state) => state.candidateNodes)

  const selectedCandidates = useMemo(() => {
    const ranked = rankCandidateNodes(
      candidateNodes,
      existingNodes.map((node) => node.position),
      MOCK_POPULATION_CELLS
    )
    return ranked.filter((entry) => compareIds.has(entry.candidate.id))
  }, [candidateNodes, existingNodes, compareIds])

  const rows = useMemo(() => compareCandidates(selectedCandidates), [selectedCandidates])

  if (selectedCandidates.length === 0) {
    return (
      <EmptyState
        title="No candidates selected"
        description="Check up to 4 candidates in the Rankings section to compare them here."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-small">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="p-2 text-left text-caption font-semibold text-text-tertiary">
              Metric
            </th>
            {selectedCandidates.map(({ candidate }) => (
              <th
                key={candidate.id}
                scope="col"
                className="p-2 text-left text-caption font-semibold text-text-primary"
              >
                {candidate.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.metric} className="border-b border-border last:border-0">
              <td className="p-2 text-caption text-text-tertiary">{row.metric}</td>
              {row.values.map((value) => (
                <td key={value.candidateId} className="p-2">
                  <Badge
                    tone={value.isBest ? 'success' : 'neutral'}
                    size="sm"
                    className={cn(value.isBest && 'font-semibold')}
                  >
                    {row.format === 'count'
                      ? formatNumber(value.value)
                      : formatPercent(value.value)}
                  </Badge>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
