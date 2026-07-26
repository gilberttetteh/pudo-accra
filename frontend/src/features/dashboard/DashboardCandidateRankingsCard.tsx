import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Sparkles } from '@/components/icons'
import { CandidateRankCard } from './CandidateRankCard'
import { CandidateCompareModal } from './CandidateCompareModal'
import type { ScoredCandidate } from '@/features/map/analysis/candidateRanking'

const MAX_COMPARE = 3

/**
 * Purpose
 * -------
 * Displays the top-ranked candidate nodes (Step 6). Ranking itself is
 * Phase 6's `rankCandidateNodes` (analysis/candidateRanking.ts), sliced
 * to the top N by the parent — this component only owns the local
 * "which candidates are selected for the Compare modal" UI state,
 * which is presentation-only and doesn't belong in a shared store.
 *
 * Props
 * -----
 * - ranked: ScoredCandidate[] — already top-N sliced by the caller
 * - onViewOnMap: (entry: ScoredCandidate) => void
 */
export interface DashboardCandidateRankingsCardProps {
  ranked: ScoredCandidate[]
  onViewOnMap: (entry: ScoredCandidate) => void
}

export function DashboardCandidateRankingsCard({
  ranked,
  onViewOnMap,
}: DashboardCandidateRankingsCardProps) {
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [isCompareOpen, setCompareOpen] = useState(false)

  const toggleCompare = (entry: ScoredCandidate) => {
    setCompareIds((current) => {
      if (current.includes(entry.candidate.id)) {
        return current.filter((id) => id !== entry.candidate.id)
      }
      if (current.length >= MAX_COMPARE) return current
      return [...current, entry.candidate.id]
    })
  }

  const compareEntries = ranked.filter((entry) => compareIds.includes(entry.candidate.id))

  return (
    <Card className="flex flex-col gap-4">
      <CardHeader className="flex-row items-start justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Candidate Rankings</CardTitle>
          <CardDescription>Highest-scoring proposed PUDO locations</CardDescription>
        </div>
        {compareEntries.length >= 2 && (
          <button
            type="button"
            onClick={() => setCompareOpen(true)}
            className="text-caption font-medium text-primary-600 hover:underline"
          >
            Compare {compareEntries.length} selected
          </button>
        )}
      </CardHeader>

      {ranked.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No candidate nodes yet"
          description="Create a candidate to see it ranked here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {ranked.map((entry) => (
            <CandidateRankCard
              key={entry.candidate.id}
              entry={entry}
              onViewOnMap={onViewOnMap}
              onToggleCompare={toggleCompare}
              isSelectedForCompare={compareIds.includes(entry.candidate.id)}
              compareDisabled={compareIds.length >= MAX_COMPARE}
            />
          ))}
        </div>
      )}

      <CandidateCompareModal
        open={isCompareOpen}
        onOpenChange={setCompareOpen}
        candidates={compareEntries}
      />
    </Card>
  )
}
