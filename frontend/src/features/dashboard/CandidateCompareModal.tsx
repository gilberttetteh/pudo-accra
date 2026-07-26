import { useMemo } from 'react'
import { Modal } from '@/components/layout/Modal'
import { Table, type Column } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { compareCandidates, type ComparisonMetricRow } from '@/features/map/analysis/comparison'
import type { ScoredCandidate } from '@/features/map/analysis/candidateRanking'

/**
 * Purpose
 * -------
 * Side-by-side comparison table for up to 3 candidates selected via
 * CandidateRankCard's "Compare" action (Step 6). Pivoting is entirely
 * Phase 6's analysis/comparison.ts (`compareCandidates`) — this
 * component only renders the rows it returns using the existing Table
 * primitive.
 *
 * Props
 * -----
 * - open / onOpenChange
 * - candidates: ScoredCandidate[] (2–3 entries)
 */
export interface CandidateCompareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidates: ScoredCandidate[]
}

function formatValue(value: number, format: ComparisonMetricRow['format']): string {
  if (format === 'count') return Math.round(value).toLocaleString()
  return `${Math.round(value * 100)}%`
}

export function CandidateCompareModal({
  open,
  onOpenChange,
  candidates,
}: CandidateCompareModalProps) {
  const rows = useMemo(() => compareCandidates(candidates), [candidates])

  const columns: Column<ComparisonMetricRow>[] = [
    { id: 'metric', header: 'Metric', accessor: (row) => row.metric },
    ...candidates.map((entry): Column<ComparisonMetricRow> => ({
      id: entry.candidate.id,
      header: entry.candidate.name,
      render: (row) => {
        const cell = row.values.find((v) => v.candidateId === entry.candidate.id)
        if (!cell) return '—'
        return (
          <span className="flex items-center gap-2">
            {formatValue(cell.value, row.format)}
            {cell.isBest && <Badge tone="success">Best</Badge>}
          </span>
        )
      },
    })),
  ]

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Compare Candidates"
      description={`Comparing ${candidates.length} candidate node${candidates.length === 1 ? '' : 's'}`}
      size="xl"
    >
      <Table keyField="metric" columns={columns} data={rows} emptyMessage="Select candidates to compare." />
    </Modal>
  )
}
