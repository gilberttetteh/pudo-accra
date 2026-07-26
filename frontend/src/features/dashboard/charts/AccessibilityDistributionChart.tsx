import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import { ChartContainer } from '@/components/charts'
import { accessibilityDistribution } from '../selectors'
import { getBaseChartOptions, getChartPalette } from './chartTheme'
import type { MockNode } from '@/mock/nodes'

/**
 * Purpose
 * -------
 * Histogram of existing nodes by accessibility-score band (0–20%,
 * 20–40%, ... 80–100%) — shows whether accessibility is broadly strong
 * or concentrated in a weak tail, which the single "Average
 * Accessibility Score" KPI can't reveal on its own. Bucketing via
 * dashboard/selectors.ts's accessibilityDistribution.
 *
 * Props
 * -----
 * - nodes: MockNode[] (from useNodeStore)
 */
export interface AccessibilityDistributionChartProps {
  nodes: MockNode[]
}

export function AccessibilityDistributionChart({ nodes }: AccessibilityDistributionChartProps) {
  const buckets = useMemo(() => accessibilityDistribution(nodes), [nodes])
  const palette = useMemo(() => getChartPalette(), [])

  const data = {
    labels: buckets.map((b) => b.label),
    datasets: [
      {
        label: 'Nodes',
        data: buckets.map((b) => b.count),
        backgroundColor: palette[3],
        borderRadius: 4,
        maxBarThickness: 36,
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
      <Bar
        data={data}
        options={options}
        aria-label="Existing nodes by accessibility score band"
        role="img"
      />
    </ChartContainer>
  )
}
