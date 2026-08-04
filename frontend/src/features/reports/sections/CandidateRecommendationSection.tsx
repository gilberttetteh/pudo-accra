import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Table, type Column } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import type { CandidateRecommendationRow } from '../selectors'

const STATUS_TONE: Record<string, 'neutral' | 'info' | 'success' | 'error'> = {
  proposed: 'neutral',
  'under-review': 'info',
  approved: 'success',
  rejected: 'error',
}

/**
 * Purpose
 * -------
 * "Candidate Recommendations" report section — ranked candidates with
 * their scoring breakdown. Rows come from
 * features/reports/selectors.ts's buildCandidateRecommendationRows,
 * which flattens features/map/analysis/candidateRanking.ts's
 * rankCandidateNodes output — no scoring logic lives here, only table
 * presentation.
 */
export interface CandidateRecommendationSectionProps {
  rows: CandidateRecommendationRow[]
}

export function CandidateRecommendationSection({ rows }: CandidateRecommendationSectionProps) {
  const columns: Column<CandidateRecommendationRow>[] = [
    { id: 'rank', header: '#', accessor: (row) => row.rank, align: 'right', widthClassName: 'w-12' },
    { id: 'name', header: 'Candidate', accessor: (row) => row.name },
    { id: 'neighbourhood', header: 'District', accessor: (row) => row.neighbourhood },
    {
      id: 'status',
      header: 'Status',
      render: (row) => <Badge tone={STATUS_TONE[row.status] ?? 'neutral'}>{row.status}</Badge>,
    },
    {
      id: 'overallScore',
      header: 'Overall Score',
      accessor: (row) => `${Math.round(row.overallScore * 100)}%`,
      align: 'right',
    },
    {
      id: 'coverageImprovement',
      header: 'Coverage Gain',
      accessor: (row) => `${Math.round(row.coverageImprovement * 100)}%`,
      align: 'right',
    },
    {
      id: 'floodRisk',
      header: 'Flood Safety',
      accessor: (row) => `${Math.round(row.floodRisk * 100)}%`,
      align: 'right',
    },
  ]

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="p-5 pb-0">
        <CardHeader>
          <CardTitle>Candidate Recommendations</CardTitle>
          <CardDescription>
            {rows.length} candidate{rows.length === 1 ? '' : 's'} ranked by overall score
          </CardDescription>
        </CardHeader>
      </div>
      <Table
        columns={columns}
        data={rows}
        keyField="id"
        emptyMessage="No candidates match the current filters."
      />
    </Card>
  )
}
