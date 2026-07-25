import { useMapEvents } from 'react-leaflet'
import { useMapStore, MapTool } from '@/store/mapStore'

/**
 * Purpose
 * -------
 * Invisible layer mounted inside <MapContainer> that owns every raw
 * Leaflet interaction event (pan, zoom, mousemove, click, right-click)
 * and translates it into mapStore writes. This is the one place "the
 * actual Leaflet map" and "our state" are kept in sync — every other
 * layer/component only ever reads from mapStore, never touches
 * Leaflet's event system directly. Right-click (contextmenu) on empty
 * map space opens the map context menu (see MapContextMenuHost);
 * right-click on a marker is handled separately by NodeLayer/
 * CandidateLayer, since Leaflet fires contextmenu on the marker itself.
 *
 * Props
 * -----
 * None — reads/writes global map state via useMapStore.
 *
 * Example usage
 * -------------
 * <MapContainer>
 *   <InteractionLayer />
 *   ...other layers...
 * </MapContainer>
 *
 * Accessibility
 * -------------
 * N/A — non-visual, event-wiring only.
 *
 * Future extension
 * -----------------
 * Add a `moveend`-driven bounds fetch trigger once NodeService supports
 * viewport-scoped queries (Phase 10) instead of loading all mock nodes
 * up front.
 */
export function InteractionLayer() {
  const setZoom = useMapStore((state) => state.setZoom)
  const setCenter = useMapStore((state) => state.setCenter)
  const setBounds = useMapStore((state) => state.setBounds)
  const setCursorPosition = useMapStore((state) => state.setCursorPosition)
  const selectNode = useMapStore((state) => state.selectNode)
  const selectGap = useMapStore((state) => state.selectGap)
  const currentTool = useMapStore((state) => state.currentTool)
  const openContextMenu = useMapStore((state) => state.openContextMenu)
  const closeContextMenu = useMapStore((state) => state.closeContextMenu)

  useMapEvents({
    moveend: (event) => {
      const map = event.target
      const center = map.getCenter()
      setCenter([center.lat, center.lng])
      setBounds([
        [map.getBounds().getSouth(), map.getBounds().getWest()],
        [map.getBounds().getNorth(), map.getBounds().getEast()],
      ])
    },
    zoomend: (event) => {
      setZoom(event.target.getZoom())
    },
    mousemove: (event) => {
      setCursorPosition({ lat: event.latlng.lat, lng: event.latlng.lng })
    },
    mouseout: () => {
      setCursorPosition(null)
    },
    click: () => {
      closeContextMenu()
      // Clicking empty map space deselects, but only in Pan/Select mode
      // — a bare click shouldn't clear selection mid-measure or mid-draw.
      if (currentTool === MapTool.Select || currentTool === MapTool.Pan) {
        selectNode(null)
        selectGap(null)
      }
    },
    contextmenu: (event) => {
      event.originalEvent.preventDefault()
      openContextMenu({
        targetType: 'map',
        mapPosition: event.latlng,
        screenPosition: { x: event.originalEvent.clientX, y: event.originalEvent.clientY },
      })
    },
  })

  return null
}
