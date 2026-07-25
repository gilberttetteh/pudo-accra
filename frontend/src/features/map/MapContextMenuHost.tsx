import { ContextMenu, type ContextMenuItemConfig } from '@/components/navigation/ContextMenu'
import { useToast } from '@/components/feedback/Toast'
import { useMapStore, MapTool } from '@/store/mapStore'
import { useNodeStore } from '@/store/nodeStore'
import { useViewportController } from './viewportController'
import { formatCoordinate } from '@/utils/formatters'
import {
  Search,
  MapPin,
  Crosshair,
  Circle,
  Download,
  Ruler,
  Plus,
  Trash2,
} from '@/components/icons'
import { PROVIDERS } from '@/mock/nodes'

/**
 * Purpose
 * -------
 * Enterprise-GIS-style right-click menu. Reads mapStore.contextMenu
 * (set by InteractionLayer for empty map space, NodeLayer/CandidateLayer
 * for markers, or NodeListRow for list rows — all three funnel through
 * the same store field) and builds the appropriate action list per
 * target type. Mounted once in MapWorkspace. Add/Delete Candidate call
 * nodeStore directly (undoable); Center Here/Copy Coordinates/Inspect/
 * Measure are fully wired; Generate Isochrone/Export surface a toast,
 * consistent with the same pattern in MapWorkspaceToolbar.
 *
 * Props
 * -----
 * None — reads mapStore.contextMenu and nodeStore directly.
 *
 * Example usage
 * -------------
 * <MapContextMenuHost /> // mounted once in MapWorkspace
 *
 * Accessibility
 * -------------
 * Delegates to ContextMenu (role="menu"/"menuitem", Escape-to-close).
 *
 * Future extension
 * -----------------
 * Wire Generate Isochrone to a real OpenRouteService call and Export to
 * a real GeoJSON/PNG export pipeline once those backends exist.
 */
export function MapContextMenuHost() {
  const contextMenu = useMapStore((state) => state.contextMenu)
  const closeContextMenu = useMapStore((state) => state.closeContextMenu)
  const selectNode = useMapStore((state) => state.selectNode)
  const setTool = useMapStore((state) => state.setTool)
  const setLayerVisibility = useMapStore((state) => state.setLayerVisibility)
  const viewport = useViewportController()

  const existingNodes = useNodeStore((state) => state.existingNodes)
  const candidateNodes = useNodeStore((state) => state.candidateNodes)
  const addCandidate = useNodeStore((state) => state.addCandidate)
  const deleteCandidate = useNodeStore((state) => state.deleteCandidate)
  const { showToast } = useToast()

  if (!contextMenu) {
    return (
      <ContextMenu open={false} position={{ x: 0, y: 0 }} items={[]} onClose={closeContextMenu} />
    )
  }

  const [lat, lng] = Array.isArray(contextMenu.mapPosition)
    ? contextMenu.mapPosition
    : [contextMenu.mapPosition.lat, contextMenu.mapPosition.lng]

  const copyCoordinates = () => {
    navigator.clipboard?.writeText(formatCoordinate(lat, lng, 6))
    showToast({
      tone: 'success',
      title: 'Coordinates copied',
      description: formatCoordinate(lat, lng, 6),
    })
  }

  const centerHere = () => viewport.flyToLocation([lat, lng])

  const generateIsochrone = () => {
    setLayerVisibility('isochrones', true)
    if (contextMenu.targetId) selectNode(contextMenu.targetId)
    showToast({
      tone: 'info',
      title: 'Isochrone generated (mock)',
      description: 'OpenRouteService integration pending.',
    })
  }

  const exportHere = () =>
    showToast({
      tone: 'info',
      title: 'Export coming soon',
      description: 'Not wired up in this phase yet.',
    })

  const measureFromHere = () => setTool(MapTool.Measure)

  const addCandidateHere = () => {
    const id = `candidate-manual-${Date.now()}`
    addCandidate({
      id,
      name: `New Candidate (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
      neighbourhood: 'Unassigned',
      position: [lat, lng],
      status: 'proposed',
      provider: PROVIDERS[0],
      suitabilityScore: 0.5,
      accessibilityScore: 0.5,
      nearestRoadDistanceMeters: 200,
      riskLevel: 'low',
      estimatedCoverageGain: 0.1,
      address: 'Address pending review',
      lastUpdated: new Date().toISOString(),
    })
    selectNode(id)
    showToast({ tone: 'success', title: 'Candidate added' })
  }

  let items: ContextMenuItemConfig[] = []

  if (contextMenu.targetType === 'map') {
    items = [
      { label: 'Center here', icon: Crosshair, onSelect: centerHere },
      { label: 'Copy coordinates', icon: MapPin, onSelect: copyCoordinates },
      { label: '', divider: true },
      { label: 'Add candidate here', icon: Plus, onSelect: addCandidateHere },
      { label: '', divider: true },
      { label: 'Generate isochrone', icon: Circle, onSelect: generateIsochrone },
      { label: 'Measure distance', icon: Ruler, onSelect: measureFromHere },
      { label: 'Export view', icon: Download, onSelect: exportHere },
    ]
  } else if (contextMenu.targetType === 'node') {
    const node = existingNodes.find((n) => n.id === contextMenu.targetId)
    items = [
      { label: 'Inspect', icon: Search, onSelect: () => selectNode(contextMenu.targetId ?? null) },
      { label: 'Copy coordinates', icon: MapPin, onSelect: copyCoordinates },
      { label: 'Center here', icon: Crosshair, onSelect: centerHere },
      { label: '', divider: true },
      { label: 'Generate isochrone', icon: Circle, onSelect: generateIsochrone },
      { label: 'Measure distance', icon: Ruler, onSelect: measureFromHere },
      { label: 'Export node', icon: Download, onSelect: exportHere, disabled: !node },
    ]
  } else if (contextMenu.targetType === 'candidate') {
    const candidate = candidateNodes.find((n) => n.id === contextMenu.targetId)
    items = [
      { label: 'Inspect', icon: Search, onSelect: () => selectNode(contextMenu.targetId ?? null) },
      { label: 'Copy coordinates', icon: MapPin, onSelect: copyCoordinates },
      { label: 'Center here', icon: Crosshair, onSelect: centerHere },
      { label: '', divider: true },
      { label: 'Generate isochrone', icon: Circle, onSelect: generateIsochrone },
      { label: '', divider: true },
      {
        label: 'Delete candidate',
        icon: Trash2,
        destructive: true,
        onSelect: () => {
          if (!contextMenu.targetId) return
          deleteCandidate(contextMenu.targetId)
          showToast({ tone: 'success', title: 'Candidate deleted', description: candidate?.name })
        },
      },
    ]
  }

  return (
    <ContextMenu
      open={!!contextMenu}
      position={contextMenu.screenPosition}
      items={items}
      onClose={closeContextMenu}
    />
  )
}
