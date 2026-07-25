import type { MockNode, MockCandidateNode, Provider, RiskLevel } from '@/mock/nodes'
import {
  toCombinedNode,
  type CombinedNode,
  type NodeSortField,
  type SortDirection,
  type NodeGroupField,
  type NodeListRowData,
} from './types'
import { formatDate } from '@/utils/formatters'

/**
 * Purpose
 * -------
 * Shared filter/search/sort/group logic used by both the node
 * management panel's list and (indirectly) the map layers — MapWorkspace
 * calls the `matches*` predicates once to derive filtered
 * MockNode[]/MockCandidateNode[] arrays, which feed both NodeList (via
 * toCombinedNode) and NodeLayer/CandidateLayer. This is what keeps map
 * and list results consistent by construction rather than by
 * duplicating filter logic in two places.
 */
export interface NodeFilters {
  statuses: Set<string>
  types: Set<'existing' | 'candidate'>
  minCoverage: number
  minAccessibility: number
  providers: Set<Provider>
  neighbourhoods: Set<string>
  riskLevels: Set<RiskLevel>
}

export const DEFAULT_NODE_FILTERS: NodeFilters = {
  statuses: new Set(['active', 'maintenance', 'offline', 'proposed', 'under-review', 'approved']),
  types: new Set(['existing', 'candidate']),
  minCoverage: 0,
  minAccessibility: 0,
  providers: new Set(),
  neighbourhoods: new Set(),
  riskLevels: new Set(),
}

function matchesSearch(searchQuery: string, ...fields: (string | number)[]): boolean {
  if (!searchQuery.trim()) return true
  const query = searchQuery.toLowerCase()
  return fields.some((field) => String(field).toLowerCase().includes(query))
}

function coordinateString(position: MockNode['position']): string {
  const [lat, lng] = Array.isArray(position) ? position : [position.lat, position.lng]
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
}

export function matchesExistingNode(
  node: MockNode,
  filters: NodeFilters,
  searchQuery: string
): boolean {
  if (!filters.types.has('existing')) return false
  if (!filters.statuses.has(node.status)) return false
  if (node.coverageScore < filters.minCoverage) return false
  if (node.accessibilityScore < filters.minAccessibility) return false
  if (filters.providers.size > 0 && !filters.providers.has(node.provider)) return false
  if (filters.neighbourhoods.size > 0 && !filters.neighbourhoods.has(node.neighbourhood))
    return false
  if (filters.riskLevels.size > 0 && !filters.riskLevels.has(node.riskLevel)) return false
  return matchesSearch(
    searchQuery,
    node.name,
    node.neighbourhood,
    node.provider,
    node.status,
    'existing',
    coordinateString(node.position)
  )
}

export function matchesCandidateNode(
  node: MockCandidateNode,
  filters: NodeFilters,
  searchQuery: string
): boolean {
  if (!filters.types.has('candidate')) return false
  if (!filters.statuses.has(node.status)) return false
  if (node.suitabilityScore < filters.minCoverage) return false
  if (node.accessibilityScore < filters.minAccessibility) return false
  if (filters.providers.size > 0 && !filters.providers.has(node.provider)) return false
  if (filters.neighbourhoods.size > 0 && !filters.neighbourhoods.has(node.neighbourhood))
    return false
  if (filters.riskLevels.size > 0 && !filters.riskLevels.has(node.riskLevel)) return false
  return matchesSearch(
    searchQuery,
    node.name,
    node.neighbourhood,
    node.provider,
    node.status,
    'candidate',
    coordinateString(node.position)
  )
}

export function sortCombinedNodes(
  nodes: CombinedNode[],
  field: NodeSortField,
  direction: SortDirection
): CombinedNode[] {
  const sorted = [...nodes].sort((a, b) => {
    let result: number
    if (field === 'name') result = a.name.localeCompare(b.name)
    else if (field === 'lastUpdated')
      result = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
    else result = (a[field] as number) - (b[field] as number)
    return direction === 'asc' ? result : -result
  })
  return sorted
}

export function groupCombinedNodes(
  nodes: CombinedNode[],
  field: NodeGroupField
): NodeListRowData[] {
  if (field === 'none') return nodes.map((node) => ({ type: 'node', node }))

  const groups = new Map<string, CombinedNode[]>()
  for (const node of nodes) {
    const key =
      field === 'neighbourhood'
        ? node.neighbourhood
        : field === 'status'
          ? node.status
          : node.provider
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(node)
  }

  const rows: NodeListRowData[] = []
  for (const [label, groupNodes] of groups) {
    rows.push({ type: 'header', label, count: groupNodes.length })
    groupNodes.forEach((node) => rows.push({ type: 'node', node }))
  }
  return rows
}

export { toCombinedNode, formatDate }
