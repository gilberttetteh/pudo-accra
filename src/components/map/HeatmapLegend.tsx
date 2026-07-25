import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Continuous gradient legend for the coverage/accessibility heatmap
 * layer, mapping the low → high visual gradient to numeric meaning
 * (e.g. "0% → 100% walking coverage").
 *
 * Props
 * -----
 * - minLabel: string
 * - maxLabel: string
 * - title?: string
 * - className?: string
 *
 * Example usage
 * -------------
 * <HeatmapLegend title="Coverage Score" minLabel="Low (0%)" maxLabel="High (100%)" />
 *
 * Accessibility
 * -------------
 * Gradient bar is decorative (`aria-hidden`); the min/max text labels
 * carry the actual meaning for screen readers.
 *
 * Future extension
 * -----------------
 * Accept a custom color-stop array once multiple heatmap metrics
 * (coverage vs. population density) need different gradients.
 */
export interface HeatmapLegendProps {
  title?: string
  minLabel: string
  maxLabel: string
  className?: string
}

export function HeatmapLegend({
  title = 'Coverage',
  minLabel,
  maxLabel,
  className,
}: HeatmapLegendProps) {
  return (
    <div
      className={cn(
        'w-52 rounded-lg border border-border bg-surface p-3 shadow-floating',
        className
      )}
    >
      <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
        {title}
      </p>
      <div
        aria-hidden="true"
        className="h-2.5 w-full rounded-full"
        style={{
          background:
            'linear-gradient(to right, var(--color-map-heatmap-low), var(--color-map-heatmap-mid), var(--color-map-heatmap-high))',
        }}
      />
      <div className="mt-1.5 flex items-center justify-between text-caption text-text-secondary">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
}
