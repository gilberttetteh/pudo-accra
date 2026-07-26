import { MOCK_EXISTING_NODES, MOCK_CANDIDATE_NODES } from './nodes'
import { MOCK_COVERAGE_GAPS } from './coverageGaps'
import { createSeededRandom, randomInRange, pickRandom } from './random'

/**
 * Mock operational-activity timeline for the Dashboard's Recent Activity
 * widget (Phase 7, Step 7). Purely illustrative event history — there is
 * no real event log yet (that arrives with Phase 10's backend), so this
 * generates a plausible, deterministic feed referencing real mock node/
 * candidate/gap names so it reads naturally rather than as "Item 3".
 *
 * Future backend integration
 * ---------------------------
 * Becomes a `GET /activity?limit=20` response backed by an actual audit
 * log (the same one that already powers generateAuditTrail per-node) —
 * the shape of ActivityEvent is designed to be that response's item type.
 */
export type ActivityEventType =
  | 'candidate-created'
  | 'candidate-approved'
  | 'candidate-rejected'
  | 'node-updated'
  | 'gap-identified'
  | 'coverage-analysis-generated'
  | 'layer-changed'

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  title: string
  description?: string
  actor: string
  timestamp: string // ISO
}

const ACTORS = ['Ama Owusu', 'Kwame Boateng', 'Kofi Mensah', 'System']
const ACTIVITY_SEED = 330501

function pastTimestamp(random: () => number, maxHoursAgo: number): string {
  const hoursAgo = randomInRange(random, 0, maxHoursAgo)
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()
}

export function generateActivityEvents(count = 14): ActivityEvent[] {
  const random = createSeededRandom(ACTIVITY_SEED)

  const builders: (() => Omit<ActivityEvent, 'id' | 'actor' | 'timestamp'>)[] = [
    () => {
      const candidate = pickRandom(random, MOCK_CANDIDATE_NODES)
      return {
        type: 'candidate-created',
        title: 'Candidate node created',
        description: `${candidate.name} in ${candidate.neighbourhood}`,
      }
    },
    () => {
      const candidate = pickRandom(random, MOCK_CANDIDATE_NODES)
      return {
        type: 'candidate-approved',
        title: 'Candidate approved',
        description: `${candidate.name} approved for deployment`,
      }
    },
    () => {
      const candidate = pickRandom(random, MOCK_CANDIDATE_NODES)
      return {
        type: 'candidate-rejected',
        title: 'Candidate rejected',
        description: `${candidate.name} did not meet suitability threshold`,
      }
    },
    () => {
      const node = pickRandom(random, MOCK_EXISTING_NODES)
      return {
        type: 'node-updated',
        title: 'Node updated',
        description: `${node.name} status changed to ${node.status}`,
      }
    },
    () => {
      const gap = pickRandom(random, MOCK_COVERAGE_GAPS)
      return {
        type: 'gap-identified',
        title: 'Coverage gap identified',
        description: `${gap.neighbourhood} flagged as underserved`,
      }
    },
    () => ({
      type: 'coverage-analysis-generated',
      title: 'Coverage analysis generated',
      description: 'Citywide coverage statistics refreshed',
    }),
    () => ({
      type: 'layer-changed',
      title: 'Map layer changed',
      description: pickRandom(random, [
        'Flood Zones layer enabled',
        'Coverage Gaps layer enabled',
        'Population Density layer disabled',
      ]),
    }),
  ]

  return Array.from({ length: count }, (_, index) => {
    const builder = pickRandom(random, builders)
    const base = builder()
    return {
      id: `activity-${index + 1}`,
      actor: pickRandom(random, ACTORS),
      timestamp: pastTimestamp(random, 72),
      ...base,
    }
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export const MOCK_ACTIVITY_EVENTS = generateActivityEvents()
