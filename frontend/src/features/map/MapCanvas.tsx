import { useEffect } from 'react'
import { MapContainer } from '@/components/map/MapContainer'
import { MapToolbar } from '@/components/map/MapToolbar'
import { MapReadyBridge } from './MapReadyBridge'
import {
  BaseMapLayer,
  RoadLayer,
  FloodLayer,
  CoverageLayer,
  IsochroneLayer,
  AdminBoundariesLayer,
  NodeLayer,
  CandidateLayer,
  LabelLayer,
  InteractionLayer,
  CoverageGapLayer,
  PopulationDensityLayer,
  AccessibilityLayer,
  WalkingRadiusLayer,
} from './layers'
import { useMapStore, MapTool } from '@/store/mapStore'
import { useViewportController } from './viewportController'
import type { MockNode, MockCandidateNode } from '@/mock/nodes'

/**
 * Purpose
 * -------
 * The Leaflet map surface for the Map Workspace. Composes the layer
 * stack in explicit bottom-to-top render order (each layer is
 * self-contained — see features/map/layers/*.tsx — and reads its own
 * slice of mapStore rather than receiving prop-drilled state), and
 * hosts the floating zoom/locate/layers/measure toolbar. Node/candidate
 * data still flows in as props since it's page-level filtered data, not
 * core viewport state (see MapWorkspace).
 *
 * Layer render order (bottom → top): BaseMapLayer, AdminBoundariesLayer,
 * FloodLayer, CoverageLayer, IsochroneLayer, RoadLayer, NodeLayer,
 * CandidateLayer, LabelLayer, InteractionLayer (invisible, always last
 * so it doesn't block pointer events meant for markers below it — Leaflet
 * layers stack in DOM order and later layers can intercept events from
 * earlier ones only where they have visible geometry; InteractionLayer
 * renders nothing, so this is purely for logical clarity, not z-fighting).
 *
 * Props
 * -----
 * - existingNodes / candidateNodes: MockNode[] / MockCandidateNode[]
 * - onToggleLayerPanel?: () => void
 *
 * Example usage
 * -------------
 * <MapCanvas existingNodes={filteredNodes} candidateNodes={filteredCandidates} />
 *
 * Accessibility
 * -------------
 * See MapContainer's note — pair with InspectorPanel/Table views for
 * non-visual access to the same data.
 *
 * Future extension
 * -----------------
 * Phase 10: real backend data replaces the mock arrays; nothing else in
 * this component needs to change.
 */
export interface MapCanvasProps {
  existingNodes: MockNode[]
  candidateNodes: MockCandidateNode[]
  onToggleLayerPanel?: () => void
}

export function MapCanvas({ existingNodes, candidateNodes, onToggleLayerPanel }: MapCanvasProps) {
  const basemap = useMapStore((state) => state.basemap)
  const zoom = useMapStore((state) => state.zoom)
  const mapInstance = useMapStore((state) => state.mapInstance)
  const setTool = useMapStore((state) => state.setTool)
  const searchResult = useMapStore((state) => state.searchResult)
  const setSearchResult = useMapStore((state) => state.setSearchResult)
  const viewport = useViewportController()

  useEffect(() => {
    if (searchResult) {
      viewport.flyToLocation(searchResult.position, 15)
      setSearchResult(null)
    }
  }, [searchResult, viewport, setSearchResult])

  const handleLocate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((position) => {
      viewport.flyToLocation([position.coords.latitude, position.coords.longitude], 15)
    })
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        basemap={basemap}
        hideDefaultBasemap
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full"
      >
        <MapReadyBridge />

        <BaseMapLayer />
        <AdminBoundariesLayer />
        <PopulationDensityLayer />
        <FloodLayer />
        <CoverageLayer />
        <CoverageGapLayer />
        <AccessibilityLayer />
        <IsochroneLayer existingNodes={existingNodes} />
        <RoadLayer />
        <WalkingRadiusLayer existingNodes={existingNodes} candidateNodes={candidateNodes} />
        <NodeLayer existingNodes={existingNodes} />
        <CandidateLayer candidateNodes={candidateNodes} />
        <LabelLayer />
        <InteractionLayer />
      </MapContainer>

      <div className="absolute bottom-6 right-4 z-[500] flex flex-col gap-3">
        <MapToolbar
          onZoomIn={() => mapInstance?.zoomIn()}
          onZoomOut={() => mapInstance?.zoomOut()}
          onLocate={handleLocate}
          onToggleLayers={onToggleLayerPanel}
          onMeasure={() => setTool(MapTool.Measure)}
        />
      </div>

      <button
        type="button"
        onClick={viewport.resetView}
        className="absolute bottom-6 left-4 z-[500] rounded-md border border-border bg-surface px-3 py-1.5 text-caption font-medium text-text-secondary shadow-floating hover:text-text-primary"
      >
        Reset view
      </button>
    </div>
  )
}
