import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCoordinate, formatPercent } from '@/utils/formatters'
import { NODE_STATUS_TONE } from '@/features/nodes/types'
import type { MockNode, MockCandidateNode } from '@/mock/nodes'
import type { LatLngExpression } from 'leaflet'

/**
 * Purpose
 * -------
 * Shared popup body content for NodeMarker/CandidateMarker — factored
 * out of the map-canvas rendering loop so the "what a node popup shows"
 * decision lives in one readable place: name, coordinates, status,
 * coverage, and a quick action.
 *
 * Props
 * -----
 * - node: MockNode | MockCandidateNode
 * - onViewDetails: () => void — opens InspectorPanel for this node
 *
 * Example usage
 * -------------
 * <NodeMarker position={node.position} label={node.name}
 *   popupContent={<NodePopupContent node={node} onViewDetails={() => selectNode(node.id)} />} />
 *
 * Accessibility
 * -------------
 * Plain semantic content inside MapPopup, which already handles the
 * popup's own a11y via Leaflet.
 *
 * Future extension
 * -----------------
 * Add an "Accepted/Rejected" quick-action pair for candidates once a
 * review workflow exists (Phase 10).
 */
const statusTone = NODE_STATUS_TONE

function coords(position: LatLngExpression): string {
  const [lat, lng] = Array.isArray(position) ? position : [position.lat, position.lng]
  return formatCoordinate(lat, lng, 4)
}

export function NodePopupContent({
  node,
  onViewDetails,
}: {
  node: MockNode
  onViewDetails: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Badge tone={statusTone[node.status]} size="sm">
          {node.status}
        </Badge>
        <span className="font-mono text-caption text-text-tertiary">{coords(node.position)}</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-caption">
        <dt className="text-text-tertiary">Coverage</dt>
        <dd className="text-text-primary">{formatPercent(node.coverageScore)}</dd>
        <dt className="text-text-tertiary">Capacity</dt>
        <dd className="text-text-primary">{node.dailyCapacity}/day</dd>
      </dl>
      <Button size="sm" variant="outline" onClick={onViewDetails} className="mt-1 w-full">
        View details
      </Button>
    </div>
  )
}

export function CandidatePopupContent({
  node,
  onViewDetails,
}: {
  node: MockCandidateNode
  onViewDetails: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Badge tone={statusTone[node.status]} size="sm">
          {node.status.replace('-', ' ')}
        </Badge>
        <span className="font-mono text-caption text-text-tertiary">{coords(node.position)}</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-caption">
        <dt className="text-text-tertiary">Suitability</dt>
        <dd className="text-text-primary">{formatPercent(node.suitabilityScore)}</dd>
        <dt className="text-text-tertiary">Coverage gain</dt>
        <dd className="text-text-primary">+{formatPercent(node.estimatedCoverageGain)}</dd>
      </dl>
      <Button size="sm" variant="outline" onClick={onViewDetails} className="mt-1 w-full">
        View details
      </Button>
    </div>
  )
}
