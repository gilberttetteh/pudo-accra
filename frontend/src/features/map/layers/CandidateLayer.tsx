import { CandidateMarker } from '@/components/map/CandidateMarker'
import { CandidatePopupContent } from '../popups'
import { useMapStore, MapTool } from '@/store/mapStore'
import { LAYER_DEFINITIONS } from '@/constants/map'
import type { MockCandidateNode } from '@/mock/nodes'

/**
 * Purpose
 * -------
 * Renders the Candidate Nodes layer. Unlike NodeLayer, candidates are
 * never clustered — there are fewer of them and each one represents a
 * pending decision a planner needs to see individually. Owns click →
 * select, hover → hoverNode, and right-click → openContextMenu (which
 * surfaces "Delete Candidate" in addition to the shared node actions —
 * see MapContextMenuHost).
 *
 * Props
 * -----
 * - candidateNodes: MockCandidateNode[]
 *
 * Example usage
 * -------------
 * <CandidateLayer candidateNodes={candidates} /> // inside <MapContainer>
 *
 * Accessibility
 * -------------
 * See MapContainer's general map accessibility note.
 *
 * Future extension
 * -----------------
 * Add clustering here too if candidate volume grows significantly.
 */
const definition = LAYER_DEFINITIONS.find((layer) => layer.id === 'candidate-nodes')!

export function CandidateLayer({ candidateNodes }: { candidateNodes: MockCandidateNode[] }) {
  const visible = useMapStore((state) => state.activeLayers['candidate-nodes'])
  const zoom = useMapStore((state) => state.zoom)
  const selectedNodeId = useMapStore((state) => state.selectedNodeId)
  const highlightedNodeIds = useMapStore((state) => state.highlightedNodeIds)
  const selectNode = useMapStore((state) => state.selectNode)
  const hoverNode = useMapStore((state) => state.hoverNode)
  const setTool = useMapStore((state) => state.setTool)
  const openContextMenu = useMapStore((state) => state.openContextMenu)

  if (!visible || zoom < definition.minZoom || zoom > definition.maxZoom) return null

  return (
    <>
      {candidateNodes.map((node) => (
        <CandidateMarker
          key={node.id}
          position={node.position}
          label={node.name}
          score={node.suitabilityScore}
          selected={node.id === selectedNodeId || highlightedNodeIds.has(node.id)}
          onClick={() => {
            setTool(MapTool.Select)
            selectNode(node.id)
          }}
          onHoverChange={(hovered) => hoverNode(hovered ? node.id : null)}
          onContextMenu={(event) =>
            openContextMenu({
              targetType: 'candidate',
              targetId: node.id,
              mapPosition: node.position,
              screenPosition: { x: event.clientX, y: event.clientY },
            })
          }
          popupContent={
            <CandidatePopupContent node={node} onViewDetails={() => selectNode(node.id)} />
          }
        />
      ))}
    </>
  )
}
