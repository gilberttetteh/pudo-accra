import type { ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * A denser analytics tile for dashboards/analytics pages that need a
 * title, description, and arbitrary body content (a chart, a mini-table,
 * a list of contributing factors) — unlike StatCard, which is a single
 * headline number.
 *
 * Props
 * -----
 * - title: string
 * - description?: string
 * - action?: ReactNode — rendered top-right (e.g. a period selector)
 * - children: ReactNode — the metric body (chart, list, etc.)
 *
 * Example usage
 * -------------
 * <MetricCard title="Population Served" description="By district" action={<Select .../>}>
 *   <AnalyticsChart ... />
 * </MetricCard>
 *
 * Accessibility
 * -------------
 * Uses semantic heading (CardTitle -> h3) so screen-reader users can
 * navigate dashboards by heading level.
 *
 * Future extension
 * -----------------
 * Add a `footnote` slot for data-source attribution.
 */
export interface MetricCardProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function MetricCard({ title, description, action, children, className }: MetricCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className={cn(action && 'flex-row items-start justify-between')}>
        <div className="flex flex-col gap-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
