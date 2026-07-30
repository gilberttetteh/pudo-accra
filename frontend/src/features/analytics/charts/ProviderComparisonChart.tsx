import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import { ChartContainer, getBaseChartOptions, getChartPalette } from '@/components/charts'
import { compareProviders } from '../selectors'
import type { MockNode, MockCandidateNode } from '@/mock/nodes'

/**
 * Purpose
 * -------
 * Grouped bar chart of existing vs. candidate node counts per operating
 * provider (Phase 8 plan §3.2: "Provider comparison"). Nothing in Phase
 * 6/7 breaks the network down by `provider` at all — this is a genuinely
 * new dimension, not a re-slice of something the Dashboard already
 * shows.
 *
 * Props
 * -----
 * - existingNodes / candidateNodes: already filtered by AnalyticsFilterBar
 */
export interface ProviderComparisonChartProps {
  existingNodes: MockNode[]
  candidateNodes: MockCandidateNode[]
}

export function ProviderComparisonChart({
  existingNodes,
  candidateNodes,
}: ProviderComparisonChartProps) {
  const rows = useMemo(
    () => compareProviders(existingNodes, candidateNodes),
    [existingNodes, candidateNodes]
  )
  const palette = useMemo(() => getChartPalette(), [])

  const data = {
    labels: rows.map((r) => r.provider),
    datasets: [
      {
        label: 'Existing nodes',
        data: rows.map((r) => r.existingCount),
        backgroundColor: palette[0],
        borderRadius: 4,
        maxBarThickness: 22,
      },
      {
        label: 'Candidate nodes',
        data: rows.map((r) => r.candidateCount),
        backgroundColor: palette[2],
        borderRadius: 4,
        maxBarThickness: 22,
      },
    ],
  }

  const base = getBaseChartOptions()
  const options: ChartOptions<'bar'> = {
    ...base,
    indexAxis: 'y' as const,
    plugins: { ...base.plugins, legend: { display: true, position: 'bottom' as const } },
    scales: base.scales,
  }

  return (
    <ChartContainer
      height={280}
      isEmpty={rows.length === 0}
      emptyMessage="No providers match the current filters."
    >
      <Bar
        data={data}
        options={options}
        aria-label="Existing vs candidate node count by provider"
        role="img"
      />
    </ChartContainer>
  )
}
