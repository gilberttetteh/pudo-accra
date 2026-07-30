import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import { ChartContainer, getBaseChartOptions, getChartPalette } from '@/components/charts'
import { isochroneCoverageByBand } from '../selectors'
import type { MockNode } from '@/mock/nodes'
import type { PopulationCell } from '@/mock/population'

/**
 * Purpose
 * -------
 * Coverage % at each of the four standard walking-time bands (5/10/15/20
 * min) — Phase 8 plan §3.2: "Isochrone coverage by walk-time band."
 * Shows how much coverage grows as the acceptable walk time relaxes,
 * using the exact radii features/map/analysis/isochroneEngine.ts already
 * defines (and IsochroneLayer already draws), so this stays consistent
 * with the map rather than inventing separate band definitions.
 *
 * Props
 * -----
 * - nodes: MockNode[] (already filtered)
 * - populationCells: PopulationCell[]
 */
export interface IsochroneCoverageByBandChartProps {
  nodes: MockNode[]
  populationCells: PopulationCell[]
}

export function IsochroneCoverageByBandChart({
  nodes,
  populationCells,
}: IsochroneCoverageByBandChartProps) {
  const bands = useMemo(
    () => isochroneCoverageByBand(nodes.map((n) => n.position), populationCells),
    [nodes, populationCells]
  )
  const palette = useMemo(() => getChartPalette(), [])

  const data = {
    labels: bands.map((b) => `${b.minutes} min`),
    datasets: [
      {
        label: 'Coverage',
        data: bands.map((b) => Math.round(b.coveragePercent * 10) / 10),
        backgroundColor: palette[1],
        borderRadius: 4,
        maxBarThickness: 40,
      },
    ],
  }

  const base = getBaseChartOptions()
  const options: ChartOptions<'bar'> = {
    ...base,
    plugins: { ...base.plugins, legend: { display: false } },
    scales: {
      ...base.scales,
      y: {
        ...base.scales?.y,
        min: 0,
        max: 100,
        ticks: { ...base.scales?.y?.ticks, callback: (value) => `${value}%` },
      },
    },
  }

  return (
    <ChartContainer
      height={280}
      isEmpty={nodes.length === 0}
      emptyMessage="No nodes match the current filters."
    >
      <Bar
        data={data}
        options={options}
        aria-label="Population coverage percent by walking-time band"
        role="img"
      />
    </ChartContainer>
  )
}
