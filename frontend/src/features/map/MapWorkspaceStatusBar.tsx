import { CoordinateDisplay } from '@/components/map/CoordinateDisplay'
import { Divider } from '@/components/ui/Divider'
import { BasemapLabel } from '@/components/map/BasemapSwitcher'
import { useMapStore } from '@/store/mapStore'
import { MAP_CONFIG } from '@/constants/map'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The Map Workspace's bottom status strip (Step 13): mouse coordinates,
 * zoom level, an approximate scale readout, how many layers are
 * currently active, the CRS label, and the active basemap. All values
 * are read directly from mapStore — this component is pure display.
 *
 * Props
 * -----
 * None — reads mapStore directly (unlike the reusable MapStatusBar
 * primitive in components/map, which takes props so it can be used in
 * non-workspace contexts like a dashboard map preview).
 *
 * Example usage
 * -------------
 * <MapWorkspaceStatusBar />
 *
 * Accessibility
 * -------------
 * Plain text content in a `role="status"` region so screen-reader users
 * can query the current view state on demand without it being
 * announced on every pan (not `aria-live`, deliberately — that would be
 * extremely noisy during continuous panning).
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
export function MapWorkspaceStatusBar({ className }: { className?: string }) {
  const zoom = useMapStore((state) => state.zoom)
  const cursorPosition = useMapStore((state) => state.cursorPosition)
  const activeLayers = useMapStore((state) => state.activeLayers)
  const basemap = useMapStore((state) => state.basemap)

  const activeLayerCount = Object.values(activeLayers).filter(Boolean).length
  // Rough meters-per-pixel at the equator for the current zoom, used only
  // for the scale bar readout — real precision isn't needed for display.
  const metersPerPixel = (156543.03392 * Math.cos(0)) / Math.pow(2, zoom)

  return (
    <div
      role="status"
      className={cn(
        'flex h-8 items-center gap-3 border-t border-border bg-surface px-3 text-caption text-text-secondary',
        className
      )}
    >
      <span>Zoom {zoom.toFixed(0)}</span>
      <Divider orientation="vertical" className="h-3.5" />
      <span>Scale ~1:{Math.round(metersPerPixel * 1000).toLocaleString()}</span>
      <Divider orientation="vertical" className="h-3.5" />
      {cursorPosition ? (
        <CoordinateDisplay lat={cursorPosition.lat} lng={cursorPosition.lng} label="Cursor" />
      ) : (
        <span className="text-text-tertiary">Move over map for coordinates</span>
      )}
      <Divider orientation="vertical" className="h-3.5" />
      <span>{activeLayerCount} layers active</span>
      <div className="ml-auto flex items-center gap-3">
        <span>{MAP_CONFIG.crs}</span>
        <Divider orientation="vertical" className="h-3.5" />
        <BasemapLabel id={basemap} />
      </div>
    </div>
  )
}
