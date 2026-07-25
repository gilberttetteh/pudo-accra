import { DropdownMenu } from '@/components/navigation/DropdownMenu'
import { IconButton } from '@/components/ui/IconButton'
import { Icon, Layers, Check } from '@/components/icons'
import { BASEMAPS, type BasemapId } from '@/constants/map'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Centralized basemap picker — the single place that knows about
 * available tile providers (see constants/map.ts). Switching is a pure
 * `onChange(id)` callback; MapCanvas is what actually swaps the
 * Leaflet TileLayer URL, keeping this component presentation-only.
 *
 * Props
 * -----
 * - value: BasemapId
 * - onChange: (id: BasemapId) => void
 *
 * Example usage
 * -------------
 * <BasemapSwitcher value={basemap} onChange={setBasemap} />
 *
 * Accessibility
 * -------------
 * Built on the DropdownMenu component (Radix-backed).
 *
 * Future extension
 * -----------------
 * Show a small thumbnail preview per basemap once real Satellite/Terrain
 * tile providers (requiring an API key) are configured in Phase 10.
 */
export interface BasemapSwitcherProps {
  value: BasemapId
  onChange: (id: BasemapId) => void
  className?: string
}

export function BasemapSwitcher({ value, onChange, className }: BasemapSwitcherProps) {
  return (
    <DropdownMenu
      align="end"
      trigger={
        <IconButton
          icon={Layers}
          label="Switch basemap"
          variant="outline"
          className={cn('bg-surface shadow-floating', className)}
        />
      }
      items={Object.values(BASEMAPS).map((basemap) => ({
        label: basemap.isPlaceholder ? `${basemap.label} (preview)` : basemap.label,
        icon: value === basemap.id ? Check : undefined,
        onSelect: () => onChange(basemap.id),
      }))}
    />
  )
}

/** Small inline swatch showing which basemap is active — used in MapStatusBarWired. */
export function BasemapLabel({ id }: { id: BasemapId }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon icon={Layers} size={12} />
      {BASEMAPS[id].label}
    </span>
  )
}
