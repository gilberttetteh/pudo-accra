import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import { ChartContainer } from '@/components/charts'
import { groupNodesByStatus } from '../selectors'
import { getBaseChartOptions, getChartPalette } from './chartTheme'
import type { MockNode } from '@/mock/nodes'

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  maintenance: 'Maintenance',
  offline: 'Offline',
  archived: 'Archived',
}

/**
 * Purpose
 * -------
 * Vertical bar chart of existing nodes grouped by operational status —
 * a quick health check on the live network, separate from the candidate
 * pipeline (see CandidateDistributionChart). Grouping via
 * dashboard/selectors.ts's groupNodesByStatus over live nodeStore data.
 *
 * Props
 * -----
 * - nodes: MockNode[] (from useNodeStore)
 */
export interface NodeStatusBreakdownChartProps {
  nodes: MockNode[]
}

export function NodeStatusBreakdownChart({ nodes }: NodeStatusBreakdownChartProps) {
  const grouped = useMemo(() => groupNodesByStatus(nodes), [nodes])
  const palette = useMemo(() => getChartPalette(), [])

  const data = {
    labels: grouped.map((g) => STATUS_LABELS[g.status] ?? g.status),
    datasets: [
      {
        label: 'Nodes',
        data: grouped.map((g) => g.count),
        backgroundColor: grouped.map((_, index) => palette[index % palette.length]),
        borderRadius: 4,
        maxBarThickness: 40,
      },
    ],
  }

  const base = getBaseChartOptions()
  const options: ChartOptions<'bar'> = {
    ...base,
    plugins: { ...base.plugins, legend: { display: false } },
  }

  return (
    <ChartContainer height={260} isEmpty={nodes.length === 0} emptyMessage="No node data available.">
      <Bar data={data} options={options} aria-label="Existing nodes by operational status" role="img" />
    </ChartContainer>
  )
}
