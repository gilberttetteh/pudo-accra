import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import { ChartContainer, getBaseChartOptions, getChartPalette } from '@/components/charts'
import { candidateScoreHistogram } from '../selectors'
import type { ScoredCandidate } from '@/features/map/analysis/candidateRanking'

/**
 * Purpose
 * -------
 * Histogram of candidate overall scores (0–100 in 10-point bands) —
 * deeper than the Dashboard's by-status doughnut (Phase 8 plan §3.2:
 * "Candidate score distribution (histogram, not just by-status
 * doughnut)"). Shows whether the candidate pool is broadly strong or
 * has a long weak tail, which the single "Average Candidate Score" KPI
 * can't reveal.
 *
 * Props
 * -----
 * - ranked: ScoredCandidate[] (from rankCandidateNodes, already filtered)
 */
export interface CandidateScoreHistogramChartProps {
  ranked: ScoredCandidate[]
}

export function CandidateScoreHistogramChart({ ranked }: CandidateScoreHistogramChartProps) {
  const buckets = useMemo(() => candidateScoreHistogram(ranked), [ranked])
  const palette = useMemo(() => getChartPalette(), [])

  const data = {
    labels: buckets.map((b) => `${b.label}%`),
    datasets: [
      {
        label: 'Candidates',
        data: buckets.map((b) => b.count),
        backgroundColor: palette[2],
        borderRadius: 4,
        maxBarThickness: 32,
      },
    ],
  }

  const base = getBaseChartOptions()
  const options: ChartOptions<'bar'> = {
    ...base,
    plugins: { ...base.plugins, legend: { display: false } },
    scales: base.scales,
  }

  return (
    <ChartContainer
      height={280}
      isEmpty={ranked.length === 0}
      emptyMessage="No candidates match the current filters."
    >
      <Bar data={data} options={options} aria-label="Candidate score distribution" role="img" />
    </ChartContainer>
  )
}
