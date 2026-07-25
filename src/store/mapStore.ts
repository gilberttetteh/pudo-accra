import type { LatLngBoundsLiteral, LatLngExpression, Map as LeafletMap } from 'leaflet'
import { createStore } from '@/store/createStore'
import { emitMapEvent } from '@/store/eventBus'
import { LAYER_DEFINITIONS, MAP_CONFIG, type BasemapId, type LayerId } from '@/constants/map'

/**
 * Purpose
 * -------
 * The single source of truth for everything about the current map view
 * and interaction state. No component owns zoom/center/selection
 * locally — they all read from and write to this store, so Toolbar,
 * Sidebar, Inspector, and StatusBar always agree with each other and
 * with the actual Leaflet instance (synced by MapEventsBinder /
 * InteractionLayer). Actions that represent a meaningful cross-feature
 * moment (selection, layer toggles) also emit an event via
 * store/eventBus.ts — see that file for the state-vs-event distinction.
 *
 * Usage
 * -----
 * const zoom = useMapStore((state) => state.zoom)
 * const selectNode = useMapStore((state) => state.selectNode)
 *
 * Future extension
 * -----------------
 * Phase 10: `selectedNodeId` will drive a real NodeService detail fetch
 * instead of a mock-data lookup; `searchResult` will come from a
 * geocoding API instead of client-side filtering.
 */

/**
 * Proper tool-mode system, replacing an earlier isMeasuring/isDrawing
 * boolean pair. Only one tool is ever active at a time — components
 * compare `currentTool === MapTool.Measure` directly rather than
 * checking a growing pile of independent booleans, which doesn't scale
 * (what would isMeasuring && isDrawing even mean?) and extends cleanly
 * to Edit/AddNode/DeleteNode/Inspect without new state shape changes.
 *
 * Implemented as a const object + derived union type rather than a real
 * TypeScript `enum` — this project's tsconfig enables
 * `erasableSyntaxOnly` (so the build can transpile one file at a time
 * without full type info), and real enums compile to non-erasable
 * runtime code that violates that constraint. This pattern gives
 * identical call-site ergonomics (`MapTool.Pan`, `MapTool.Measure`, ...)
 * and an identical `currentTool: MapTool` type.
 */
export const MapTool = {
  Pan: 'pan',
  Select: 'select',
  Measure: 'measure',
  Draw: 'draw',
  Edit: 'edit',
  AddNode: 'add-node',
  DeleteNode: 'delete-node',
  Inspect: 'inspect',
} as const
export type MapTool = (typeof MapTool)[keyof typeof MapTool]

export interface SearchResult {
  id: string
  label: string
  type: 'node' | 'road' | 'area' | 'coordinate'
  position: LatLngExpression
}

export type ContextMenuTargetType = 'map' | 'node' | 'candidate'

export interface ContextMenuState {
  targetType: ContextMenuTargetType
  targetId?: string
  mapPosition: LatLngExpression
  /** Screen coordinates (clientX/clientY) — where the floating menu renders. */
  screenPosition: { x: number; y: number }
}

interface MapState {
  // Viewport
  zoom: number
  center: LatLngExpression
  bounds: LatLngBoundsLiteral | null
  basemap: BasemapId
  /** The live Leaflet instance, set once by MapReadyBridge. Components
   *  should generally prefer useViewportController() over reading this
   *  directly — it centralizes navigation logic in one place. */
  mapInstance: LeafletMap | null
  setZoom: (zoom: number) => void
  setCenter: (center: LatLngExpression) => void
  setBounds: (bounds: LatLngBoundsLiteral) => void
  setBasemap: (basemap: BasemapId) => void
  setMapInstance: (map: LeafletMap | null) => void
  resetView: () => void

  // Layers
  activeLayers: Record<LayerId, boolean>
  layerOpacity: Record<LayerId, number>
  toggleLayer: (id: LayerId) => void
  setLayerVisibility: (id: LayerId, visible: boolean) => void
  setLayerOpacity: (id: LayerId, opacity: number) => void

  // Selection / interaction
  selectedNodeId: string | null
  hoveredNodeId: string | null
  selectNode: (id: string | null) => void
  hoverNode: (id: string | null) => void

  /** The currently selected coverage gap (Phase 6) — mutually exclusive
   *  with selectedNodeId conceptually (selecting a gap clears node
   *  selection and vice versa) so InspectorPanel knows which detail
   *  view to render. */
  selectedGapId: string | null
  selectGap: (id: string | null) => void

  /** Nodes/candidates highlighted as a side effect of selecting a gap
   *  (nearby existing nodes + recommended candidates) — distinct from
   *  hoveredNodeId since multiple nodes can be highlighted at once. */
  highlightedNodeIds: Set<string>
  setHighlightedNodeIds: (ids: Set<string>) => void

  // Tools
  currentTool: MapTool
  setTool: (tool: MapTool) => void

  // Search
  searchResult: SearchResult | null
  setSearchResult: (result: SearchResult | null) => void

  // Cursor (for status bar coordinate readout)
  cursorPosition: { lat: number; lng: number } | null
  setCursorPosition: (position: { lat: number; lng: number } | null) => void

  // Context menu (right-click on map / node / candidate)
  contextMenu: ContextMenuState | null
  openContextMenu: (menu: ContextMenuState) => void
  closeContextMenu: () => void
}

const defaultActiveLayers = LAYER_DEFINITIONS.reduce<Record<LayerId, boolean>>(
  (acc, layer) => {
    acc[layer.id] = layer.defaultVisible
    return acc
  },
  {} as Record<LayerId, boolean>
)

const defaultLayerOpacity = LAYER_DEFINITIONS.reduce<Record<LayerId, number>>(
  (acc, layer) => {
    acc[layer.id] = layer.defaultOpacity
    return acc
  },
  {} as Record<LayerId, number>
)

export const useMapStore = createStore<MapState>((set, get) => ({
  zoom: MAP_CONFIG.defaultZoom,
  center: MAP_CONFIG.defaultCenter,
  bounds: null,
  basemap: 'osm',
  mapInstance: null,
  setZoom: (zoom) => {
    set({ zoom })
    emitMapEvent('MapZoomed', { zoom })
  },
  setCenter: (center) => {
    set({ center })
    emitMapEvent('MapMoved', { center })
  },
  setBounds: (bounds) => set({ bounds }),
  setBasemap: (basemap) => set({ basemap }),
  setMapInstance: (map) => set({ mapInstance: map }),
  resetView: () => set({ zoom: MAP_CONFIG.defaultZoom, center: MAP_CONFIG.defaultCenter }),

  activeLayers: defaultActiveLayers,
  layerOpacity: defaultLayerOpacity,
  toggleLayer: (id) => {
    const next = !get().activeLayers[id]
    set((state) => ({ activeLayers: { ...state.activeLayers, [id]: next } }))
    emitMapEvent(next ? 'LayerEnabled' : 'LayerDisabled', { layerId: id })
  },
  setLayerVisibility: (id, visible) => {
    set((state) => ({ activeLayers: { ...state.activeLayers, [id]: visible } }))
    emitMapEvent(visible ? 'LayerEnabled' : 'LayerDisabled', { layerId: id })
  },
  setLayerOpacity: (id, opacity) =>
    set((state) => ({ layerOpacity: { ...state.layerOpacity, [id]: opacity } })),

  selectedNodeId: null,
  hoveredNodeId: null,
  selectNode: (id) => {
    set({ selectedNodeId: id, selectedGapId: id ? null : get().selectedGapId })
    emitMapEvent('NodeSelected', { nodeId: id })
  },
  hoverNode: (id) => {
    set({ hoveredNodeId: id })
    emitMapEvent('FeatureHovered', { featureId: id })
  },

  selectedGapId: null,
  selectGap: (id) => set({ selectedGapId: id, selectedNodeId: id ? null : get().selectedNodeId }),

  highlightedNodeIds: new Set(),
  setHighlightedNodeIds: (ids) => set({ highlightedNodeIds: ids }),

  currentTool: MapTool.Pan,
  setTool: (tool) =>
    set({
      currentTool: tool,
      // Switching tools clears the active selection so inspector state
      // doesn't linger while the user is, say, measuring distance.
      selectedNodeId: tool === MapTool.Select ? get().selectedNodeId : null,
    }),

  searchResult: null,
  setSearchResult: (result) => set({ searchResult: result }),

  cursorPosition: null,
  setCursorPosition: (position) => set({ cursorPosition: position }),

  contextMenu: null,
  openContextMenu: (menu) => set({ contextMenu: menu }),
  closeContextMenu: () => set({ contextMenu: null }),
}))
