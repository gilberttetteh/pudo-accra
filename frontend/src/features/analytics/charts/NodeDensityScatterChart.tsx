import { useMemo } from 'react'
import { Scatter } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import {
  ChartContainer,
  getBaseChartOptions,
  getChartPalette,
  getChartTextColor,
} from '@/components/charts'
import { nodeDensityVsPopulation } from '../selectors'
import type { MockNode } from '@/mock/nodes'
import type { PopulationCell } from '@/mock/population'

/**
 * Purpose
 * -------
 * Scatter of node count vs. average nearby population density, one
 * point per district — answers "are nodes concentrated where the
 * population actually is, or clustered somewhere else?" (Phase 8 plan
 * §3.2). Data from analytics/selectors.ts's nodeDensityVsPopulation,
 * which only groups existing nodeStore + mock population-grid data —
 * no new scoring logic.
 *
 * Props
 * -----
 * - nodes: MockNode[] (already filtered by AnalyticsFilterBar)
 * - populationCells: PopulationCell[]
 *
 * Future backend integration
 * ---------------------------
 * Becomes a PostGIS spatial join (nodes joined against a real
 * population raster, grouped by district) once Phase 10 exists.
 */
export interface NodeDensityScatterChartProps {
  nodes: MockNode[]
  populationCells: PopulationCell[]
}

export function NodeDensityScatterChart({ nodes, populationCells }: NodeDensityScatterChartProps) {
  const points = useMemo(() => nodeDensityVsPopulation(nodes, populationCells), [nodes, populationCells])
  const palette = useMemo(() => getChartPalette(), [])

  const data = {
    datasets: [
      {
        label: 'District',
        data: points.map((p) => ({ x: p.averagePopulationDensity, y: p.nodeCount })),
        backgroundColor: palette[0],
        pointRadius: 6,
        pointHoverRadius: 8,
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
            return `${point?.neighbourhood ?? ''}: ${ctx.parsed.y} nodes, ${Math.round(ctx.parsed.x)} people/km²`
          },
        },
      },
    },
    scales: {
      x: {
        ...base.scales?.x,
        title: {
          display: true,
          text: 'Avg. population density (people/km²)',
          color: getChartTextColor(),
        },
      },
      y: {
        ...base.scales?.y,
        title: { display: true, text: 'Node count', color: getChartTextColor() },
        ticks: { ...base.scales?.y?.ticks, precision: 0 },
      },
    },
  } as unknown as ChartOptions<'scatter'>

  return (
    <ChartContainer height={280} isEmpty={points.length === 0} emptyMessage="No districts match the current filters.">
      <Scatter data={data} options={options} aria-label="Node count vs population density by district" role="img" />
    </ChartContainer>
  )
}
