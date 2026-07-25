import type { LucideIcon } from 'lucide-react'
import { Checkbox } from '@/components/forms/Checkbox'
import { Label } from '@/components/forms/Label'
import { Icon } from '@/components/icons'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Floating/embedded panel listing toggleable map layers, entirely
 * data-driven off a `layers` array (mirrors constants/map.ts's
 * LayerDefinition shape, minus fields this UI doesn't need) — adding a
 * new layer to the app means adding a LayerDefinition entry, never
 * touching this component. Optionally renders a per-layer icon and
 * opacity slider when the layer definition supplies them.
 *
 * Props
 * -----
 * - layers: LayerControlItem[]
 * - onToggle: (id: string) => void
 * - onOpacityChange?: (id: string, opacity: number) => void — omit to
 *   hide opacity sliders entirely (e.g. for a compact embedded preview)
 * - className?: string — for map-relative positioning (e.g. `absolute
 *   top-4 right-4`), left to the consumer/page layout
 *
 * Example usage
 * -------------
 * <LayerControl
 *   layers={[
 *     { id: 'existing-nodes', label: 'Existing Nodes', checked: true, icon: MapPin, opacity: 1 },
 *     { id: 'flood-zones', label: 'Flood Zones', checked: false, icon: Waves, opacity: 0.6 },
 *   ]}
 *   onToggle={(id) => toggleLayer(id)}
 *   onOpacityChange={(id, opacity) => setLayerOpacity(id, opacity)}
 * />
 *
 * Accessibility
 * -------------
 * Each layer is a real Checkbox + Label pair (see forms/Checkbox),
 * fully keyboard operable. Opacity sliders are native
 * `<input type="range">`, which carries correct a11y semantics for free.
 *
 * Future extension
 * -----------------
 * Add a "Base map" radio group once multiple tile providers need to be
 * selectable from this same panel rather than BasemapSwitcher.
 */
export interface LayerControlItem {
  id: string
  label: string
  checked: boolean
  disabled?: boolean
  icon?: LucideIcon
  opacity?: number
}

export interface LayerControlProps {
  layers: LayerControlItem[]
  onToggle: (id: string) => void
  onOpacityChange?: (id: string, opacity: number) => void
  className?: string
}

export function LayerControl({ layers, onToggle, onOpacityChange, className }: LayerControlProps) {
  return (
    <div
      className={cn(
        'w-56 rounded-lg border border-border bg-surface p-3 shadow-floating',
        className
      )}
    >
      <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
        Layers
      </p>
      <div className="flex flex-col gap-3">
        {layers.map((layer) => (
          <div key={layer.id} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <Checkbox
                id={`layer-${layer.id}`}
                checked={layer.checked}
                disabled={layer.disabled}
                onCheckedChange={() => onToggle(layer.id)}
              />
              {layer.icon && <Icon icon={layer.icon} size={14} className="text-text-tertiary" />}
              <Label htmlFor={`layer-${layer.id}`} className="cursor-pointer font-normal">
                {layer.label}
              </Label>
            </div>
            {onOpacityChange && layer.opacity !== undefined && layer.checked && (
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={layer.opacity}
                onChange={(event) => onOpacityChange(layer.id, Number(event.target.value))}
                aria-label={`${layer.label} opacity`}
                className="ml-6 h-1 w-[calc(100%-1.5rem)] cursor-pointer accent-primary-600"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
