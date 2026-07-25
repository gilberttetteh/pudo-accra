import type { ReactNode } from 'react'
import { LoadingState } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Consistent wrapper for every Chart.js chart in the Analytics phase
 * (Phase 8) — handles loading/empty states uniformly so individual chart
 * components only need to render the chart itself. No charting logic
 * lives here yet; this is deliberately a thin shell until real datasets
 * exist.
 *
 * Props
 * -----
 * - isLoading?: boolean
 * - isEmpty?: boolean
 * - emptyMessage?: string
 * - height?: number — fixed pixel height (charts need explicit sizing)
 * - children: ReactNode — the actual Chart.js <Chart /> component
 *
 * Example usage
 * -------------
 * <ChartContainer isLoading={isLoading} isEmpty={data.length === 0} height={280}>
 *   <Bar data={chartData} options={chartOptions} />
 * </ChartContainer>
 *
 * Accessibility
 * -------------
 * Chart.js canvases are not screen-reader accessible by default; Phase 8
 * should pair every chart with a visually-hidden data table or summary
 * text describing the trend.
 *
 * Future extension
 * -----------------
 * Phase 8 will add: a shared color palette helper (chart-1…chart-6
 * tokens), a standard tooltip theme, and export-as-image support.
 */
export interface ChartContainerProps {
  isLoading?: boolean
  isEmpty?: boolean
  emptyMessage?: string
  height?: number
  children: ReactNode
  className?: string
}

export function ChartContainer({
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No data available for this period.',
  height = 280,
  children,
  className,
}: ChartContainerProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      {isLoading ? (
        <LoadingState message="Loading chart data…" fullHeight />
      ) : isEmpty ? (
        <EmptyState title={emptyMessage} />
      ) : (
        children
      )}
    </div>
  )
}
