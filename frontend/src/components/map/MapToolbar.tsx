import type { LucideIcon } from 'lucide-react'
import { IconButton } from '@/components/ui/IconButton'
import { Tooltip } from '@/components/navigation/Tooltip'
import { Divider } from '@/components/ui/Divider'
import { ZoomIn, ZoomOut, Locate, Layers, Ruler } from '@/components/icons'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Floating vertical (or horizontal) cluster of map action buttons —
 * zoom, locate-me, toggle layers panel, measure distance. Presentational
 * only; Phase 7 wires each `on*` callback to real Leaflet map methods.
 *
 * Props
 * -----
 * - onZoomIn / onZoomOut / onLocate / onToggleLayers / onMeasure:
 *   optional callbacks — a button only renders if its callback is provided
 * - orientation: 'vertical' | 'horizontal'
 * - className?: string — for positioning (e.g. `absolute bottom-4 left-4`)
 *
 * Example usage
 * -------------
 * <MapToolbar onZoomIn={map.zoomIn} onZoomOut={map.zoomOut} onLocate={locateMe} />
 *
 * Accessibility
 * -------------
 * Each control is an IconButton (required `label`) wrapped in a Tooltip
 * for sighted users — screen readers get the accessible name either way.
 *
 * Future extension
 * -----------------
 * Add a custom-tool slot (array of { icon, label, onClick }) so future
 * GIS tools (draw isochrone, add candidate) can extend this without a
 * new component.
 */
export interface MapToolbarProps {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onLocate?: () => void
  onToggleLayers?: () => void
  onMeasure?: () => void
  orientation?: 'vertical' | 'horizontal'
  className?: string
}

interface ToolbarAction {
  icon: LucideIcon
  label: string
  onClick?: () => void
}

export function MapToolbar({
  onZoomIn,
  onZoomOut,
  onLocate,
  onToggleLayers,
  onMeasure,
  orientation = 'vertical',
  className,
}: MapToolbarProps) {
  const zoomActions: ToolbarAction[] = [
    { icon: ZoomIn, label: 'Zoom in', onClick: onZoomIn },
    { icon: ZoomOut, label: 'Zoom out', onClick: onZoomOut },
  ].filter((action) => action.onClick)

  const otherActions: ToolbarAction[] = [
    { icon: Locate, label: 'My location', onClick: onLocate },
    { icon: Layers, label: 'Toggle layers', onClick: onToggleLayers },
    { icon: Ruler, label: 'Measure distance', onClick: onMeasure },
  ].filter((action) => action.onClick)

  return (
    <div
      className={cn(
        'flex gap-px overflow-hidden rounded-lg border border-border bg-surface shadow-floating',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        className
      )}
    >
      {zoomActions.map((action) => (
        <Tooltip
          key={action.label}
          content={action.label}
          side={orientation === 'vertical' ? 'left' : 'top'}
        >
          <IconButton
            icon={action.icon}
            label={action.label}
            variant="ghost"
            onClick={action.onClick}
            className="rounded-none"
          />
        </Tooltip>
      ))}

      {zoomActions.length > 0 && otherActions.length > 0 && (
        <Divider orientation={orientation === 'vertical' ? 'horizontal' : 'vertical'} />
      )}

      {otherActions.map((action) => (
        <Tooltip
          key={action.label}
          content={action.label}
          side={orientation === 'vertical' ? 'left' : 'top'}
        >
          <IconButton
            icon={action.icon}
            label={action.label}
            variant="ghost"
            onClick={action.onClick}
            className="rounded-none"
          />
        </Tooltip>
      ))}
    </div>
  )
}
