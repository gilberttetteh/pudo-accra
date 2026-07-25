import { useMemo } from 'react'
import { NodeMarker } from '@/components/map/NodeMarker'
import { ClusterMarker } from '@/components/map/ClusterMarker'
import { NodePopupContent } from '../popups'
import { useMapStore, MapTool } from '@/store/mapStore'
import { useViewportController } from '../viewportController'
import { clusterPoints, MIN_CLUSTER_SIZE } from '@/utils/clustering'
import { LAYER_DEFINITIONS } from '@/constants/map'
import type { MockNode } from '@/mock/nodes'

/**
 * Purpose
 * -------
 * Renders the Existing Nodes layer: grid-clusters below zoom 13 (see
 * utils/clustering.ts for the documented algorithm), individual
 * NodeMarkers above it. Owns click → select, hover → hoverNode, and
 * right-click → openContextMenu wiring for this layer's markers.
 *
 * Props
 * -----
 * - existingNodes: MockNode[] — pre-filtered by MapWorkspace's
 *   FilterPanel state before reaching this layer
 *
 * Example usage
 * -------------
 * <NodeLayer existingNodes={filteredNodes} /> // inside <MapContainer>
 *
 * Accessibility
 * -------------
 * See MapContainer's general map accessibility note.
 *
 * Future extension
 * -----------------
 * Swap grid clustering for Supercluster once real node volume justifies
 * it — only this component's internal clustering call changes.
 */
const CLUSTER_ZOOM_THRESHOLD = 13
const definition = LAYER_DEFINITIONS.find((layer) => layer.id === 'existing-nodes')!

export function NodeLayer({ existingNodes }: { existingNodes: MockNode[] }) {
  const visible = useMapStore((state) => state.activeLayers['existing-nodes'])
  const zoom = useMapStore((state) => state.zoom)
  const selectedNodeId = useMapStore((state) => state.selectedNodeId)
  const highlightedNodeIds = useMapStore((state) => state.highlightedNodeIds)
  const selectNode = useMapStore((state) => state.selectNode)
  const hoverNode = useMapStore((state) => state.hoverNode)
  const setTool = useMapStore((state) => state.setTool)
  const openContextMenu = useMapStore((state) => state.openContextMenu)
  const viewport = useViewportController()

  const clusters = useMemo(() => {
    if (zoom >= CLUSTER_ZOOM_THRESHOLD) return null
    return clusterPoints(existingNodes, (node) => node.position, zoom)
  }, [existingNodes, zoom])

  if (!visible || zoom < definition.minZoom || zoom > definition.maxZoom) return null

  const renderMarker = (node: MockNode) => (
    <NodeMarker
      key={node.id}
      position={node.position}
      label={node.name}
      selected={node.id === selectedNodeId || highlightedNodeIds.has(node.id)}
      onClick={() => {
        setTool(MapTool.Select)
        selectNode(node.id)
      }}
      onHoverChange={(hovered) => hoverNode(hovered ? node.id : null)}
      onContextMenu={(event) =>
        openContextMenu({
          targetType: 'node',
          targetId: node.id,
          mapPosition: node.position,
          screenPosition: { x: event.clientX, y: event.clientY },
        })
      }
      popupContent={<NodePopupContent node={node} onViewDetails={() => selectNode(node.id)} />}
    />
  )

  if (!clusters) return <>{existingNodes.map(renderMarker)}</>

  return (
    <>
      {clusters.map((cluster, index) =>
        cluster.items.length >= MIN_CLUSTER_SIZE ? (
          <ClusterMarker
            key={`cluster-${index}`}
            position={cluster.position}
            count={cluster.items.length}
            onClick={() => viewport.zoomToNode(cluster.position, zoom + 2)}
          />
        ) : (
          renderMarker(cluster.items[0]!)
        )
      )}
    </>
  )
}
