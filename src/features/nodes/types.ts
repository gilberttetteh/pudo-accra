import type { LatLngExpression } from 'leaflet'
import type { MockNode, MockCandidateNode, Provider, RiskLevel } from '@/mock/nodes'

/**
 * A normalized shape covering both existing and candidate nodes, used
 * by NodeList/NodeListRow/sorting/grouping so that code doesn't need to
 * branch on "is this an existing node or a candidate" for anything
 * except rendering a status badge and picking which score to show.
 * NodeDetailsPanel still works with the raw MockNode/MockCandidateNode
 * (looked up by id+kind) since it needs every field, not just the
 * list-row subset.
 */
export type CombinedNodeKind = 'existing' | 'candidate'

export interface CombinedNode {
  kind: CombinedNodeKind
  id: string
  name: string
  neighbourhood: string
  position: LatLngExpression
  status: string
  provider: Provider
  /** coverageScore for existing nodes, suitabilityScore for candidates */
  primaryScore: number
  primaryScoreLabel: 'Coverage' | 'Suitability'
  accessibilityScore: number
  nearestRoadDistanceMeters: number
  riskLevel: RiskLevel
  lastUpdated: string
}

export function toCombinedNode(
  node: MockNode | MockCandidateNode,
  kind: CombinedNodeKind
): CombinedNode {
  const isExisting = kind === 'existing'
  const existing = node as MockNode
  const candidate = node as MockCandidateNode
  return {
    kind,
    id: node.id,
    name: node.name,
    neighbourhood: node.neighbourhood,
    position: node.position,
    status: node.status,
    provider: node.provider,
    primaryScore: isExisting ? existing.coverageScore : candidate.suitabilityScore,
    primaryScoreLabel: isExisting ? 'Coverage' : 'Suitability',
    accessibilityScore: node.accessibilityScore,
    nearestRoadDistanceMeters: node.nearestRoadDistanceMeters,
    riskLevel: node.riskLevel,
    lastUpdated: node.lastUpdated,
  }
}

export type NodeSortField =
  'name' | 'primaryScore' | 'accessibilityScore' | 'nearestRoadDistanceMeters' | 'lastUpdated'
export type SortDirection = 'asc' | 'desc'
export type NodeGroupField = 'none' | 'neighbourhood' | 'status' | 'provider'

export const SORT_FIELD_OPTIONS: { value: NodeSortField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'primaryScore', label: 'Coverage / Suitability' },
  { value: 'accessibilityScore', label: 'Accessibility' },
  { value: 'nearestRoadDistanceMeters', label: 'Distance to road' },
  { value: 'lastUpdated', label: 'Last updated' },
]

export const GROUP_FIELD_OPTIONS: { value: NodeGroupField; label: string }[] = [
  { value: 'none', label: 'No grouping' },
  { value: 'neighbourhood', label: 'Neighbourhood' },
  { value: 'status', label: 'Status' },
  { value: 'provider', label: 'Provider' },
]

/** A row in the flattened, virtualized list — either a group header or a node. */
export type NodeListRowData =
  { type: 'header'; label: string; count: number } | { type: 'node'; node: CombinedNode }

/** Shared status -> Badge tone mapping, covering every NodeStatus and
 *  CandidateStatus value. Centralized here so NodeListRow,
 *  NodeDetailsPanel, and the map marker popups never drift out of sync
 *  with each other (or forget a newly-added status like 'archived'). */
export const NODE_STATUS_TONE = {
  active: 'success',
  maintenance: 'warning',
  offline: 'error',
  archived: 'neutral',
  proposed: 'info',
  'under-review': 'warning',
  approved: 'success',
  rejected: 'error',
} as const
