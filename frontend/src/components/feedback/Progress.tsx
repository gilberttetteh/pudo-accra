import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Determinate progress bar — file uploads, multi-step isochrone
 * generation jobs, batch scoring runs.
 *
 * Props
 * -----
 * - value: number (0–100)
 * - label?: string — visible label above the bar
 * - tone: 'primary' | 'success' | 'warning' | 'error'
 *
 * Example usage
 * -------------
 * <Progress value={64} label="Generating isochrones…" />
 *
 * Accessibility
 * -------------
 * Built on @radix-ui/react-progress, which exposes the correct
 * `role="progressbar"` and `aria-valuenow`/`aria-valuemax` automatically.
 *
 * Future extension
 * -----------------
 * Add an indeterminate mode for jobs without a known total.
 */
export interface ProgressProps {
  value: number
  label?: string
  tone?: 'primary' | 'success' | 'warning' | 'error'
  className?: string
}

const toneClass = {
  primary: 'bg-primary-600',
  success: 'bg-success-600',
  warning: 'bg-warning-600',
  error: 'bg-error-600',
}

export function Progress({ value, label, tone = 'primary', className }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between text-small text-text-secondary">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <ProgressPrimitive.Root
        value={clamped}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-tertiary"
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full rounded-full transition-transform duration-(--duration-slow) ease-(--ease-standard)',
            toneClass[tone]
          )}
          style={{ transform: `translateX(-${100 - clamped}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
}
