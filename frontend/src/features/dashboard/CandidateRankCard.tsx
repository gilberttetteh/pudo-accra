import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/layout/Modal'
import { MapPin, Eye, GitCompare } from '@/components/icons'
import type { ScoredCandidate } from '@/features/map/analysis/candidateRanking'

const CANDIDATE_STATUS_TONE = {
  proposed: 'info',
  'under-review': 'warning',
  approved: 'success',
  rejected: 'error',
} as const

/**
 * Purpose
 * -------
 * One ranked candidate node (Step 6): name, neighbourhood, overall
 * score, and the three requested metrics, plus View on Map / Inspect /
 * Compare actions. Metrics all come from Phase 6's
 * analysis/candidateRanking.ts — this component only presents them.
 *
 * Props
 * -----
 * - entry: ScoredCandidate
 * - onViewOnMap: (entry: ScoredCandidate) => void
 * - onToggleCompare: (entry: ScoredCandidate) => void
 * - isSelectedForCompare: boolean
 * - compareDisabled?: boolean — true once 3 candidates are already
 *   selected for comparison and this one isn't among them
 */
export interface CandidateRankCardProps {
  entry: ScoredCandidate
  onViewOnMap: (entry: ScoredCandidate) => void
  onToggleCompare: (entry: ScoredCandidate) => void
  isSelectedForCompare: boolean
  compareDisabled?: boolean
}

export function CandidateRankCard({
  entry,
  onViewOnMap,
  onToggleCompare,
  isSelectedForCompare,
  compareDisabled,
}: CandidateRankCardProps) {
  const [isInspectOpen, setInspectOpen] = useState(false)
  const { candidate, metrics, rank } = entry

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-caption font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
              {rank}
            </span>
            <span className="text-body font-medium text-text-primary">{candidate.name}</span>
          </div>
          <span className="text-caption text-text-secondary">{candidate.neighbourhood}</span>
        </div>
        <Badge tone={CANDIDATE_STATUS_TONE[candidate.status]}>{candidate.status.replace('-', ' ')}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-small sm:grid-cols-4">
        <Metric label="Overall" value={`${Math.round(metrics.overallScore * 100)}%`} emphasize />
        <Metric label="Coverage Gain" value={`${Math.round(metrics.coverageImprovement * 100)}%`} />
        <Metric label="Accessibility" value={`${Math.round(metrics.accessibility * 100)}%`} />
        <Metric label="Flood Safety" value={`${Math.round(metrics.floodRisk * 100)}%`} />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Button variant="outline" size="sm" leftIcon={MapPin} onClick={() => onViewOnMap(entry)}>
          View on Map
        </Button>
        <Button variant="outline" size="sm" leftIcon={Eye} onClick={() => setInspectOpen(true)}>
          Inspect
        </Button>
        <Button
          variant={isSelectedForCompare ? 'secondary' : 'outline'}
          size="sm"
          leftIcon={GitCompare}
          disabled={compareDisabled && !isSelectedForCompare}
          onClick={() => onToggleCompare(entry)}
        >
          {isSelectedForCompare ? 'Comparing' : 'Compare'}
        </Button>
      </div>

      <Modal
        open={isInspectOpen}
        onOpenChange={setInspectOpen}
        title={candidate.name}
        description={`${candidate.neighbourhood} · ${candidate.address}`}
        size="md"
      >
        <div className="grid grid-cols-2 gap-4 text-small">
          <Metric label="Overall Score" value={`${Math.round(metrics.overallScore * 100)}%`} />
          <Metric
            label="Coverage Improvement"
            value={`${Math.round(metrics.coverageImprovement * 100)}%`}
          />
          <Metric label="Accessibility" value={`${Math.round(metrics.accessibility * 100)}%`} />
          <Metric label="Road Access" value={`${Math.round(metrics.roadAccess * 100)}%`} />
          <Metric
            label="Population Served"
            value={metrics.populationServed.toLocaleString()}
          />
          <Metric label="Flood Risk (higher = safer)" value={`${Math.round(metrics.floodRisk * 100)}%`} />
          <Metric label="Provider" value={candidate.provider} />
          <Metric label="Risk Level" value={candidate.riskLevel} />
        </div>
      </Modal>
    </div>
  )
}

function Metric({
  label,
  value,
  emphasize,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  return (
    <div className="flex flex-col">
      <span className="text-caption text-text-tertiary">{label}</span>
      <span className={emphasize ? 'text-body font-semibold text-text-primary' : 'text-small text-text-primary'}>
        {value}
      </span>
    </div>
  )
}
