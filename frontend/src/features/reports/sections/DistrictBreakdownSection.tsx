import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Table, type Column } from '@/components/ui/Table'
import type { DistrictBreakdownRow } from '../selectors'

/**
 * Purpose
 * -------
 * "District Breakdown" report section — a full per-district table
 * (every district with data, not just the worst-10 the Dashboard chart
 * shows). Rows come from features/reports/selectors.ts's
 * buildDistrictBreakdown, which itself reuses
 * dashboard/selectors.ts's coverageByNeighbourhood rather than
 * re-averaging coverage scores here.
 */
export interface DistrictBreakdownSectionProps {
  rows: DistrictBreakdownRow[]
}

export function DistrictBreakdownSection({ rows }: DistrictBreakdownSectionProps) {
  const columns: Column<DistrictBreakdownRow>[] = [
    { id: 'neighbourhood', header: 'District', accessor: (row) => row.neighbourhood },
    { id: 'nodeCount', header: 'Nodes', accessor: (row) => row.nodeCount, align: 'right' },
    {
      id: 'averageCoverage',
      header: 'Avg. Coverage',
      accessor: (row) => `${Math.round(row.averageCoverage * 100)}%`,
      align: 'right',
    },
    { id: 'candidateCount', header: 'Candidates', accessor: (row) => row.candidateCount, align: 'right' },
  ]

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="p-5 pb-0">
        <CardHeader>
          <CardTitle>District Breakdown</CardTitle>
          <CardDescription>{rows.length} district{rows.length === 1 ? '' : 's'} included</CardDescription>
        </CardHeader>
      </div>
      <Table
        columns={columns}
        data={rows}
        keyField="neighbourhood"
        emptyMessage="No districts match the current filters."
      />
    </Card>
  )
}
