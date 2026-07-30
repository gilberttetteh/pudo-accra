import { useMemo } from 'react'
import { Scatter } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import { ChartContainer, getBaseChartOptions, getChartPalette } from '@/components/charts'
import { floodAccessibilityCorrelation } from '../selectors'
import type { MockCandidateNode } from '@/mock/nodes'

/**
 * Purpose
 * -------
 * Scatter of flood-safety score vs. accessibility score, one point per
 * candidate — answers the Phase 8 plan §3.2 question directly: "are
 * safe locations also accessible?" A cluster in the top-right means no
 * real trade-off; a cluster along the diagonal (high safety, low
 * accessibility or vice versa) means planners are choosing between the
 * two. Uses features/map/analysis/scoring.ts's calculateFloodRiskScore
 * (via analytics/selectors.ts) rather than a new flood formula.
 *
 * Props
 * -----
 * - candidates: MockCandidateNode[] (already filtered)
 */
export interface FloodAccessibilityScatterChartProps {
  candidates: MockCandidateNode[]
}

export function FloodAccessibilityScatterChart({
  candidates,
}: FloodAccessibilityScatterChartProps) {
  const points = useMemo(() => floodAccessibilityCorrelation(candidates), [candidates])
  const palette = useMemo(() => getChartPalette(), [])

  const data = {
    datasets: [
      {
        label: 'Candidate',
        data: points.map((p) => ({ x: p.accessibility * 100, y: p.floodSafety * 100 })),
        backgroundColor: palette[4],
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  }

  const base = getBaseChartOptions()
  const options = {
    ...base,
    plugins: {
      ...base.plugins,
      legend: { display: false },
      tooltip: {
        ...base.plugins?.tooltip,
        callbacks: {
          label: (ctx: { dataIndex: number; parsed: { x: number; y: number } }) => {
            const point = points[ctx.dataIndex]
            return `${point?.name ?? ''}: ${Math.round(ctx.parsed.x)}% accessible, ${Math.round(ctx.parsed.y)}% flood-safe`
          },
        },
      },
    },
    scales: {
      x: {
        ...base.scales?.x,
        min: 0,
        max: 100,
        title: { display: true, text: 'Accessibility (%)' },
      },
      y: {
        ...base.scales?.y,
        min: 0,
        max: 100,
        title: { display: true, text: 'Flood safety (%, higher = safer)' },
      },
    },
  } as unknown as ChartOptions<'scatter'>

  return (
    <ChartContainer
      height={280}
      isEmpty={points.length === 0}
      emptyMessage="No candidates match the current filters."
    >
      <Scatter
        data={data}
        options={options}
        aria-label="Flood safety vs accessibility by candidate"
        role="img"
      />
    </ChartContainer>
  )
}
