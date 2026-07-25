import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Static legend explaining marker shapes/colors on the map (Existing
 * Node, Candidate Node, Selected). Distinct from HeatmapLegend, which
 * shows a continuous gradient scale rather than discrete symbols.
 *
 * Props
 * -----
 * - items: { label: string; color: string; shape?: 'circle' | 'diamond' | 'square' }[]
 * - className?: string
 *
 * Example usage
 * -------------
 * <Legend items={[
 *   { label: 'Existing Node', color: 'var(--color-map-node-existing)', shape: 'circle' },
 *   { label: 'Candidate Node', color: 'var(--color-map-node-candidate)', shape: 'diamond' },
 * ]} />
 *
 * Accessibility
 * -------------
 * Rendered as a labeled list (`<dl>`-like pairing of swatch + label) so
 * screen readers get symbol -> meaning association, not just color.
 *
 * Future extension
 * -----------------
 * Auto-derive `items` from the active LayerControl selection once the
 * map page wires real layer state (Phase 7).
 */
export interface LegendItem {
  label: string
  color: string
  shape?: 'circle' | 'diamond' | 'square'
}

export interface LegendProps {
  items: LegendItem[]
  className?: string
}

const shapeClass = {
  circle: 'rounded-full',
  diamond: 'rotate-45 rounded-[2px]',
  square: 'rounded-[2px]',
}

export function Legend({ items, className }: LegendProps) {
  return (
    <div
      className={cn(
        'w-52 rounded-lg border border-border bg-surface p-3 shadow-floating',
        className
      )}
    >
      <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
        Legend
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2.5 text-small text-text-secondary">
            <span
              aria-hidden="true"
              className={cn(
                'h-3 w-3 shrink-0 border border-white',
                shapeClass[item.shape ?? 'circle']
              )}
              style={{ backgroundColor: item.color, boxShadow: '0 1px 2px rgba(15,23,42,0.25)' }}
            />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
