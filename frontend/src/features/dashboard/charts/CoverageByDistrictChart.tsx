import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import { ChartContainer } from '@/components/charts'
import { coverageByNeighbourhood } from '../selectors'
import { getBaseChartOptions, getChartPalette } from './chartTheme'
import type { MockNode } from '@/mock/nodes'

/**
 * Purpose
 * -------
 * Horizontal bar chart of average coverage score per district, worst
 * districts first — answers the Dashboard's "where are the biggest
 * problems?" question directly. Data comes from
 * dashboard/selectors.ts's coverageByNeighbourhood, which only groups
 * existing nodeStore data — no new scoring logic here.
 *
 * Props
 * -----
 * - nodes: MockNode[] (from useNodeStore)
 *
 * Future backend integration
 * ---------------------------
 * Becomes a `GROUP BY neighbourhood` query in the same
 * `/analytics/coverage-overview`-style endpoint statistics.ts already
 * anticipates.
 */
export interface CoverageByDistrictChartProps {
  nodes: MockNode[]
}

export function CoverageByDistrictChart({ nodes }: CoverageByDistrictChartProps) {
  const districts = useMemo(() => coverageByNeighbourhood(nodes, 8), [nodes])
  const palette = useMemo(() => getChartPalette(), [])

  const data = {
    labels: districts.map((d) => d.neighbourhood),
    datasets: [
      {
        label: 'Average coverage',
        data: districts.map((d) => Math.round(d.averageCoverage * 100)),
        backgroundColor: palette[0],
        borderRadius: 4,
        maxBarThickness: 22,
      },
    ],
  }

  const base = getBaseChartOptions()
  const options: ChartOptions<'bar'> = {
    ...base,
    indexAxis: 'y' as const,
    plugins: {
      ...base.plugins,
      legend: { display: false },
    },
    scales: {
      x: {
        ...base.scales?.x,
        min: 0,
        max: 100,
        ticks: { ...base.scales?.x?.ticks, callback: (value) => `${value}%` },
      },
      y: base.scales?.y,
    },
  }

  return (
    <ChartContainer height={260} isEmpty={districts.length === 0} emptyMessage="No node data available.">
      <Bar data={data} options={options} aria-label="Average coverage percentage by district" role="img" />
    </ChartContainer>
  )
}
