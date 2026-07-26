import { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import { ChartContainer } from '@/components/charts'
import { groupCandidatesByStatus } from '../selectors'
import { getBaseChartOptions, getChartPalette } from './chartTheme'
import type { MockCandidateNode } from '@/mock/nodes'

const STATUS_LABELS: Record<string, string> = {
  proposed: 'Proposed',
  'under-review': 'Under review',
  approved: 'Approved',
  rejected: 'Rejected',
}

/**
 * Purpose
 * -------
 * Doughnut chart of candidate nodes by review status — a fast read on
 * how much of the candidate pipeline is still awaiting a decision vs
 * approved/rejected. Grouping comes from
 * dashboard/selectors.ts's groupCandidatesByStatus over live nodeStore
 * data (no separate candidate dataset).
 *
 * Props
 * -----
 * - candidates: MockCandidateNode[] (from useNodeStore)
 */
export interface CandidateDistributionChartProps {
  candidates: MockCandidateNode[]
}

export function CandidateDistributionChart({ candidates }: CandidateDistributionChartProps) {
  const grouped = useMemo(() => groupCandidatesByStatus(candidates), [candidates])
  const palette = useMemo(() => getChartPalette(), [])

  const data = {
    labels: grouped.map((g) => STATUS_LABELS[g.status] ?? g.status),
    datasets: [
      {
        data: grouped.map((g) => g.count),
        backgroundColor: palette,
        borderColor: 'transparent',
        hoverOffset: 4,
      },
    ],
  }

  const base = getBaseChartOptions()
  const options = {
    ...base,
    scales: undefined,
    cutout: '65%',
    plugins: { ...base.plugins, legend: { ...base.plugins?.legend, position: 'bottom' as const } },
  } as unknown as ChartOptions<'doughnut'>

  return (
    <ChartContainer
      height={260}
      isEmpty={candidates.length === 0}
      emptyMessage="No candidate nodes available."
    >
      <Doughnut data={data} options={options} aria-label="Candidate nodes by review status" role="img" />
    </ChartContainer>
  )
}
