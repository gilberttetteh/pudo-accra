import { IconButton } from '@/components/ui/IconButton'
import { Divider } from '@/components/ui/Divider'
import { Tooltip } from '@/components/navigation/Tooltip'
import { MapSearch, type MapSearchSuggestion } from '@/components/map/MapSearch'
import { BasemapSwitcher } from '@/components/map/BasemapSwitcher'
import {
  Locate,
  ZoomIn,
  ZoomOut,
  Compass,
  Ruler,
  Route as DrawIcon,
  Layers,
  Download,
  Settings,
  ChevronLeft as UndoIcon,
  ChevronRight as RedoIcon,
  PanelLeft,
  PanelLeftClose,
} from '@/components/icons'
import { useMapStore, MapTool } from '@/store/mapStore'
import { useNodeStore } from '@/store/nodeStore'
import { useViewportController } from './viewportController'
import { useToast } from '@/components/feedback/Toast'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The full-width toolbar spanning the top of the Map Workspace (distinct
 * from the compact floating MapToolbar in components/map, which only
 * has zoom/locate/layers/measure for embedded/preview maps). Includes
 * every control called for in Phase 4 Step 8. Search, viewport tools
 * (zoom, locate, reset), layer toggle, and measure are fully wired —
 * zoom/locate/reset go through mapStore's mapInstance and
 * useViewportController rather than owning a Leaflet reference here.
 * Draw, Export, Settings, Undo, and Redo remain placeholders (no draw
 * engine, export pipeline, or command-history stack exist yet) — they
 * surface a toast rather than silently doing nothing, so the UI never
 * lies about what just happened.
 *
 * Props
 * -----
 * - sidebarOpen: boolean / onToggleSidebar: () => void
 * - searchQuery / onSearchChange / searchSuggestions / onSelectSuggestion
 *
 * Example usage
 * -------------
 * <MapWorkspaceToolbar sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar}
 *   searchQuery={query} onSearchChange={setQuery} searchSuggestions={suggestions}
 *   onSelectSuggestion={handleSelect} />
 *
 * Accessibility
 * -------------
 * Every icon-only control is an IconButton (required `label`) wrapped
 * in a Tooltip for sighted users.
 *
 * Future extension
 * -----------------
 * Wire Draw to a real Leaflet.draw-style toolset, Export to a
 * PNG/GeoJSON export pipeline, and Undo/Redo to a real command-history
 * stack once those features are prioritized.
 */
export interface MapWorkspaceToolbarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  searchQuery: string
  onSearchChange: (value: string) => void
  searchSuggestions: MapSearchSuggestion[]
  onSelectSuggestion: (id: string) => void
  className?: string
}

export function MapWorkspaceToolbar({
  sidebarOpen,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  searchSuggestions,
  onSelectSuggestion,
  className,
}: MapWorkspaceToolbarProps) {
  const { showToast } = useToast()
  const basemap = useMapStore((state) => state.basemap)
  const setBasemap = useMapStore((state) => state.setBasemap)
  const currentTool = useMapStore((state) => state.currentTool)
  const setTool = useMapStore((state) => state.setTool)
  const mapInstance = useMapStore((state) => state.mapInstance)
  const viewport = useViewportController()
  const undo = useNodeStore((state) => state.undo)
  const redo = useNodeStore((state) => state.redo)
  const canUndo = useNodeStore((state) => state.undoStack.length > 0)
  const canRedo = useNodeStore((state) => state.redoStack.length > 0)

  const notImplemented = (feature: string) =>
    showToast({
      tone: 'info',
      title: `${feature} coming soon`,
      description: 'Not wired up in this phase yet.',
    })

  const handleLocate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((position) => {
      viewport.flyToLocation([position.coords.latitude, position.coords.longitude], 15)
    })
  }

  return (
    <div
      className={cn(
        'flex h-14 items-center gap-2 border-b border-border bg-surface px-3',
        className
      )}
    >
      <Tooltip content={sidebarOpen ? 'Collapse panel' : 'Expand panel'}>
        <IconButton
          icon={sidebarOpen ? PanelLeftClose : PanelLeft}
          label={sidebarOpen ? 'Collapse panel' : 'Expand panel'}
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
        />
      </Tooltip>

      <Divider orientation="vertical" className="h-6" />

      <MapSearch
        value={searchQuery}
        onChange={onSearchChange}
        suggestions={searchSuggestions}
        onSelectSuggestion={onSelectSuggestion}
        placeholder="Search nodes, roads, areas…"
        className="max-w-[20rem]"
      />

      <Divider orientation="vertical" className="h-6" />

      <Tooltip content="Reset view">
        <IconButton
          icon={Compass}
          label="Reset view"
          variant="ghost"
          size="sm"
          onClick={viewport.resetView}
        />
      </Tooltip>
      <Tooltip content="Zoom in">
        <IconButton
          icon={ZoomIn}
          label="Zoom in"
          variant="ghost"
          size="sm"
          onClick={() => mapInstance?.zoomIn()}
        />
      </Tooltip>
      <Tooltip content="Zoom out">
        <IconButton
          icon={ZoomOut}
          label="Zoom out"
          variant="ghost"
          size="sm"
          onClick={() => mapInstance?.zoomOut()}
        />
      </Tooltip>
      <Tooltip content="My location">
        <IconButton
          icon={Locate}
          label="My location"
          variant="ghost"
          size="sm"
          onClick={handleLocate}
        />
      </Tooltip>

      <Divider orientation="vertical" className="h-6" />

      <Tooltip content="Measure distance">
        <IconButton
          icon={Ruler}
          label="Measure distance"
          variant={currentTool === MapTool.Measure ? 'solid' : 'ghost'}
          size="sm"
          onClick={() => setTool(currentTool === MapTool.Measure ? MapTool.Pan : MapTool.Measure)}
        />
      </Tooltip>
      <Tooltip content="Draw">
        <IconButton
          icon={DrawIcon}
          label="Draw"
          variant="ghost"
          size="sm"
          onClick={() => notImplemented('Draw tool')}
        />
      </Tooltip>
      <Tooltip content="Toggle layers panel">
        <IconButton
          icon={Layers}
          label="Toggle layers panel"
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
        />
      </Tooltip>

      <div className="ml-auto flex items-center gap-2">
        <Tooltip content="Undo">
          <IconButton
            icon={UndoIcon}
            label="Undo"
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
          />
        </Tooltip>
        <Tooltip content="Redo">
          <IconButton
            icon={RedoIcon}
            label="Redo"
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
          />
        </Tooltip>

        <Divider orientation="vertical" className="h-6" />

        <BasemapSwitcher value={basemap} onChange={setBasemap} />

        <Tooltip content="Export map">
          <IconButton
            icon={Download}
            label="Export map"
            variant="ghost"
            size="sm"
            onClick={() => notImplemented('Export')}
          />
        </Tooltip>
        <Tooltip content="Map settings">
          <IconButton
            icon={Settings}
            label="Map settings"
            variant="ghost"
            size="sm"
            onClick={() => notImplemented('Map settings')}
          />
        </Tooltip>
      </div>
    </div>
  )
}


