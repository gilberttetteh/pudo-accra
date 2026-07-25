import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'
import { Icon, TrendingUp, TrendingDown } from '@/components/icons'
import { cn } from '@/utils/cn'
import { Skeleton } from '@/components/feedback/Skeleton'

/**
 * Purpose
 * -------
 * Top-of-dashboard summary tile: a single number with a label, optional
 * icon, and optional trend indicator. Distinct from MetricCard, which is
 * built for denser analytics grids with multiple data points.
 *
 * Props
 * -----
 * - label: string
 * - value: string | number
 * - icon?: LucideIcon
 * - trend?: { direction: 'up' | 'down'; value: string; isPositive?: boolean }
 * - isLoading?: boolean — renders a Skeleton in place of the value
 *
 * Example usage
 * -------------
 * <StatCard label="Active Nodes" value={128} icon={MapPin}
 *   trend={{ direction: 'up', value: '+12 this month', isPositive: true }} />
 *
 * Accessibility
 * -------------
 * The value is the primary readable content; trend text is appended so
 * screen readers get label -> value -> trend in reading order.
 *
 * Future extension
 * -----------------
 * Add a sparkline slot once Chart.js wiring lands in Phase 8.
 */
export interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    direction: 'up' | 'down'
    value: string
    isPositive?: boolean
  }
  isLoading?: boolean
  className?: string
}

export function StatCard({ label, value, icon, trend, isLoading, className }: StatCardProps) {
  return (
    <Card className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-small text-text-secondary">{label}</span>
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
            <Icon icon={icon} size={16} />
          </span>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <span className="text-h3 text-text-primary">{value}</span>
      )}

      {trend && !isLoading && (
        <div
          className={cn(
            'flex items-center gap-1 text-caption font-medium',
            (trend.isPositive ?? trend.direction === 'up') ? 'text-success-600' : 'text-error-600'
          )}
        >
          <Icon icon={trend.direction === 'up' ? TrendingUp : TrendingDown} size={14} />
          <span>{trend.value}</span>
        </div>
      )}
    </Card>
  )
}
