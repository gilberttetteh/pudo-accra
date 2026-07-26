
import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'
import { Icon, TrendingUp, TrendingDown } from '@/components/icons'
import { cn } from '@/utils/cn'
import { Skeleton } from '@/components/feedback/Skeleton'
import { Tooltip } from '@/components/navigation/Tooltip'

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
 * - tooltip?: string — wraps the label in a Tooltip explaining the metric
 * - sparkline?: number[] — small inline trend line under the value
 *   (deliberately plain SVG, not Chart.js — this is a glanceable shape,
 *   not an interactive chart; Phase 8's Analytics charts are the place
 *   for the real Chart.js treatment)
 * - tone?: 'success' | 'warning' | 'error' | 'neutral' — renders a small
 *   status-color accent bar so an at-risk KPI (e.g. high-priority gaps)
 *   reads as urgent at a glance
 *
 * Example usage
 * -------------
 * <StatCard label="Active Nodes" value={128} icon={MapPin}
 *   trend={{ direction: 'up', value: '+12 this month', isPositive: true }}
 *   sparkline={[112, 115, 118, 121, 124, 128]} tone="success" />
 *
 * Accessibility
 * -------------
 * The value is the primary readable content; trend text is appended so
 * screen readers get label -> value -> trend in reading order. The
 * sparkline is `aria-hidden` (decorative — the trend text already
 * conveys the same information to screen readers).
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
  tooltip?: string
  sparkline?: number[]
  tone?: 'success' | 'warning' | 'error' | 'neutral'
  className?: string
}

const toneAccentClass: Record<NonNullable<StatCardProps['tone']>, string> = {
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  neutral: 'bg-border-strong',
}

function Sparkline({ values, tone }: { values: number[]; tone?: StatCardProps['tone'] }) {
  if (values.length < 2) return null
  const width = 100
  const height = 28
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  const strokeClass =
    tone === 'success'
      ? 'stroke-success-500'
      : tone === 'warning'
        ? 'stroke-warning-500'
        : tone === 'error'
          ? 'stroke-error-500'
          : 'stroke-primary-500'

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-7 w-full"
    >
      <polyline
        points={points}
        fill="none"
        className={strokeClass}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  isLoading,
  tooltip,
  sparkline,
  tone,
  className,
}: StatCardProps) {
  const labelNode = tooltip ? (
    <Tooltip content={tooltip}>
      <span className="cursor-help text-small text-text-secondary underline decoration-dotted underline-offset-4">
        {label}
      </span>
    </Tooltip>
  ) : (
    <span className="text-small text-text-secondary">{label}</span>
  )

  return (
    <Card className={cn('relative flex flex-col gap-3 overflow-hidden', className)}>
      {tone && (
        <span
          aria-hidden="true"
          className={cn('absolute inset-y-0 left-0 w-1', toneAccentClass[tone])}
        />
      )}

      <div className="flex items-center justify-between">
        {labelNode}
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

      {sparkline && sparkline.length > 1 && !isLoading && (
        <Sparkline values={sparkline} tone={tone} />
      )}
    </Card>
  )
}


