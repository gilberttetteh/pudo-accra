import type { LatLngExpression } from 'leaflet'
import { ACCRA_NEIGHBOURHOODS } from './geo'
import { createSeededRandom, randomInRange, pickRandom } from './random'

/**
 * Local, display-only node shape for the map feature's mock data. Not a
 * shared domain model (Phase 2.5's domain layer, if built, would
 * supersede this) — scoped intentionally to what the map + node
 * management UI needs.
 */
export type NodeStatus = 'active' | 'maintenance' | 'offline' | 'archived'
export type CandidateStatus = 'proposed' | 'under-review' | 'approved' | 'rejected'
export type RiskLevel = 'low' | 'moderate' | 'high'

export const PROVIDERS = [
  'Accra PUDO Network',
  'Jumia Logistics',
  'Speedaf Express',
  'Bolt Send',
  'Yango Delivery',
  'Glovo Ghana',
] as const
export type Provider = (typeof PROVIDERS)[number]

export interface MockNode {
  id: string
  name: string
  neighbourhood: string
  position: LatLngExpression
  status: NodeStatus
  provider: Provider
  coverageScore: number // 0–1
  accessibilityScore: number // 0–1
  nearestRoadDistanceMeters: number
  riskLevel: RiskLevel
  dailyCapacity: number
  address: string
  lastUpdated: string // ISO timestamp
}

export interface MockCandidateNode {
  id: string
  name: string
  neighbourhood: string
  position: LatLngExpression
  status: CandidateStatus
  provider: Provider
  suitabilityScore: number // 0–1
  accessibilityScore: number // 0–1
  nearestRoadDistanceMeters: number
  riskLevel: RiskLevel
  estimatedCoverageGain: number // 0–1, population newly covered
  address: string
  lastUpdated: string
}

export interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  action: string
  description: string
}

const LANDMARK_SUFFIXES = [
  'Junction',
  'Market',
  'Terminal',
  'Plaza',
  'Station',
  'Hub',
  'Point',
  'Center',
  'Roundabout',
]
const STREET_NAMES = [
  'Oxford St',
  'Liberation Rd',
  'Independence Ave',
  'Ring Rd',
  'Spintex Rd',
  'Tetteh Quarshie Rd',
  'Kanda Highway',
  'Graphic Rd',
]
const RISK_LEVELS: RiskLevel[] = ['low', 'low', 'low', 'moderate', 'moderate', 'high']
const ACTORS = ['Ama Owusu', 'Kwame Boateng', 'System', 'Kofi Mensah']

const RANDOM_SEED = 20260723

function jitter(random: () => number, lat: number, lng: number): LatLngExpression {
  return [lat + randomInRange(random, -0.012, 0.012), lng + randomInRange(random, -0.012, 0.012)]
}

function pastTimestamp(random: () => number, maxDaysAgo: number): string {
  const daysAgo = randomInRange(random, 0, maxDaysAgo)
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
}

export function generateExistingNodes(count = 60): MockNode[] {
  const random = createSeededRandom(RANDOM_SEED)
  const statuses: NodeStatus[] = ['active', 'active', 'active', 'active', 'maintenance', 'offline']

  return Array.from({ length: count }, (_, index) => {
    const seed = pickRandom(random, ACCRA_NEIGHBOURHOODS)
    const suffix = pickRandom(random, LANDMARK_SUFFIXES)
    return {
      id: `node-${index + 1}`,
      name: `${seed.name} ${suffix}`,
      neighbourhood: seed.name,
      position: jitter(random, seed.lat, seed.lng),
      status: pickRandom(random, statuses),
      provider: pickRandom(random, PROVIDERS),
      coverageScore: Math.round(randomInRange(random, 0.35, 0.98) * 100) / 100,
      accessibilityScore: Math.round(randomInRange(random, 0.3, 0.99) * 100) / 100,
      nearestRoadDistanceMeters: Math.round(randomInRange(random, 15, 450)),
      riskLevel: pickRandom(random, RISK_LEVELS),
      dailyCapacity: Math.round(randomInRange(random, 20, 120)),
      address: `${pickRandom(random, STREET_NAMES)}, ${seed.name}, Accra`,
      lastUpdated: pastTimestamp(random, 45),
    }
  })
}

export function generateCandidateNodes(count = 28): MockCandidateNode[] {
  const random = createSeededRandom(RANDOM_SEED + 1)
  const statuses: CandidateStatus[] = ['proposed', 'proposed', 'under-review', 'approved']

  return Array.from({ length: count }, (_, index) => {
    const seed = pickRandom(random, ACCRA_NEIGHBOURHOODS)
    const suffix = pickRandom(random, LANDMARK_SUFFIXES)
    return {
      id: `candidate-${index + 1}`,
      name: `${seed.name} ${suffix} (Proposed)`,
      neighbourhood: seed.name,
      position: jitter(random, seed.lat, seed.lng),
      status: pickRandom(random, statuses),
      provider: pickRandom(random, PROVIDERS),
      suitabilityScore: Math.round(randomInRange(random, 0.4, 0.97) * 100) / 100,
      accessibilityScore: Math.round(randomInRange(random, 0.3, 0.95) * 100) / 100,
      nearestRoadDistanceMeters: Math.round(randomInRange(random, 15, 450)),
      riskLevel: pickRandom(random, RISK_LEVELS),
      estimatedCoverageGain: Math.round(randomInRange(random, 0.05, 0.35) * 100) / 100,
      address: `${pickRandom(random, STREET_NAMES)}, ${seed.name}, Accra`,
      lastUpdated: pastTimestamp(random, 20),
    }
  })
}

/** Generates a short, plausible audit trail for a node's detail panel.
 *  Deterministic per node id so the same node always shows the same
 *  history across re-renders. */
export function generateAuditTrail(nodeId: string): AuditEntry[] {
  let seed = 0
  for (let i = 0; i < nodeId.length; i += 1) seed = (seed * 31 + nodeId.charCodeAt(i)) | 0
  const random = createSeededRandom(seed)
  const entryCount = Math.round(randomInRange(random, 3, 6))

  const templates = [
    { action: 'Created', description: 'Node added to the network.' },
    { action: 'Status changed', description: 'Status updated after field verification.' },
    { action: 'Capacity updated', description: 'Daily capacity revised based on demand.' },
    {
      action: 'Coverage recalculated',
      description: 'Coverage score refreshed after isochrone update.',
    },
    { action: 'Provider reassigned', description: 'Operating provider changed.' },
  ]

  return Array.from({ length: entryCount }, (_, index) => {
    const template = pickRandom(random, templates)
    return {
      id: `${nodeId}-audit-${index}`,
      timestamp: pastTimestamp(random, 90),
      actor: pickRandom(random, ACTORS),
      action: template.action,
      description: template.description,
    }
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export const MOCK_EXISTING_NODES = generateExistingNodes()
export const MOCK_CANDIDATE_NODES = generateCandidateNodes()
