import { useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { Icon, MapPin, Users, AlertTriangle } from '@/components/icons'
import { formatNumber, formatPercent, formatDistance } from '@/utils/formatters'
import { haversineDistanceMeters } from '@/utils/geo'
import { useMapStore } from '@/store/mapStore'
import { useNodeStore } from '@/store/nodeStore'
import { useViewportController } from '@/features/map/viewportController'
import type { CoverageGap } from '@/mock/coverageGaps'
import { MOCK_FLOOD_ZONES } from '@/mock/floodZones'
import { MOCK_POPULATION_CELLS } from '@/mock/population'
import { calculateGapScore, classifyGapPriority } from '@/features/map/analysis/gapDetection'
import {
  estimatePopulationServed,
  calculateCoverageImprovement,
} from '@/features/map/analysis/coverageAnalysis'
import { minutesToRadiusMeters, ISOCHRONE_BANDS } from '@/features/map/analysis/isochroneEngine'
import { rankCandidateNodes } from '@/features/map/analysis/candidateRanking'

/**
 * Purpose
 * -------
 * The "Coverage Inspector" from Phase 6 Step 8 — InspectorPanel renders
 * this instead of NodeDetailsPanel when mapStore.selectedGapId is set.
 * Shows the gap's coverage %, population served (if a node were placed
 * at its centroid), gap size, recommended nearby nodes/candidates,
 * estimated walking times to the nearest existing node, risk factors
 * (flood-zone proximity), and an improvement estimate — all computed via
 * the analysis/ pure functions, not stored as static fields.
 *
 * Props
 * -----
 * - gap: CoverageGap
 *
 * Example usage
 * -------------
 * <GapInspectorPanel gap={selectedGap} />
 *
 * Accessibility
 * -------------
 * Plain semantic sections; "View recommended node" is a real button.
 *
 * Future extension
 * -----------------
 * Once routing/isochrones are backend-real, replace the walking-time
 * estimate (currently derived from isochroneEngine's circular
 * approximation) with an actual OpenRouteService duration.
 */
export function GapInspectorPanel({ gap }: { gap: CoverageGap }) {
  const existingNodes = useNodeStore((state) => state.existingNodes)
  const candidateNodes = useNodeStore((state) => state.candidateNodes)
  const selectNode = useMapStore((state) => state.selectNode)
  const viewport = useViewportController()

  const score = calculateGapScore(gap)
  const priority = classifyGapPriority(score)

  const populationIfServed = useMemo(
    () => estimatePopulationServed(gap.position, MOCK_POPULATION_CELLS),
    [gap.position]
  )

  const improvement = useMemo(
    () =>
      calculateCoverageImprovement(
        gap.position,
        existingNodes.map((node) => node.position),
        MOCK_POPULATION_CELLS
      ),
    [gap.position, existingNodes]
  )

  const nearestCandidates = useMemo(() => {
    const ranked = rankCandidateNodes(
      candidateNodes,
      existingNodes.map((node) => node.position),
      MOCK_POPULATION_CELLS
    )
    return ranked
      .map((entry) => ({
        entry,
        distance: haversineDistanceMeters(gap.position, entry.candidate.position),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2)
  }, [candidateNodes, existingNodes, gap.position])

  const nearestFloodZone = useMemo(() => {
    return MOCK_FLOOD_ZONES.map((zone) => ({
      zone,
      distance: haversineDistanceMeters(gap.position, zone.positions[0]!),
    })).sort((a, b) => a.distance - b.distance)[0]
  }, [gap.position])

  const nearestNode = existingNodes.find((node) => node.id === gap.nearestNodeId)
  const walkingMinutes = ISOCHRONE_BANDS.find(
    (minutes) => minutesToRadiusMeters(minutes) >= gap.nearestNodeDistanceMeters
  )

  const priorityTone = { high: 'error', medium: 'warning', low: 'info' } as const

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-h4 text-text-primary">{gap.neighbourhood} Coverage Gap</h2>
            <p className="mt-0.5 flex items-center gap-1 text-caption text-text-tertiary">
              <Icon icon={MapPin} size={12} />
              Underserved area
            </p>
          </div>

          <Badge tone={priorityTone[priority]}>{priority} priority</Badge>

          <Divider />

          <section>
            <p className="mb-1.5 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
              Gap Metrics
            </p>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-small">
              <div>
                <dt className="text-caption text-text-tertiary">Gap size</dt>
                <dd className="text-text-primary">{gap.areaKm2} km²</dd>
              </div>
              <div>
                <dt className="text-caption text-text-tertiary">Population affected</dt>
                <dd className="text-text-primary">{formatNumber(gap.populationAffected)}</dd>
              </div>
              <div>
                <dt className="text-caption text-text-tertiary">Would-serve population</dt>
                <dd className="text-text-primary">{formatNumber(populationIfServed)}</dd>
              </div>
              <div>
                <dt className="text-caption text-text-tertiary">Coverage improvement</dt>
                <dd className="text-text-primary">+{formatPercent(improvement)}</dd>
              </div>
            </dl>
          </section>

          <Divider />

          <section>
            <p className="mb-1.5 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
              Walking Times
            </p>
            <p className="text-small text-text-primary">
              {nearestNode ? (
                <>
                  Nearest node ({nearestNode.name}) is{' '}
                  {formatDistance(gap.nearestNodeDistanceMeters)} away
                  {walkingMinutes
                    ? ` — roughly a ${walkingMinutes}+ minute walk.`
                    : ' — beyond a 20 minute walk.'}
                </>
              ) : (
                'No existing node found nearby.'
              )}
            </p>
          </section>

          <Divider />

          <section>
            <p className="mb-1.5 flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
              <Icon icon={AlertTriangle} size={12} />
              Risk Factors
            </p>
            {nearestFloodZone && nearestFloodZone.distance < 1500 ? (
              <p className="text-small text-text-primary">
                Within {formatDistance(nearestFloodZone.distance)} of {nearestFloodZone.zone.label}{' '}
                ({nearestFloodZone.zone.riskLevel} flood risk).
              </p>
            ) : (
              <p className="text-small text-text-tertiary">No significant flood risk nearby.</p>
            )}
          </section>

          <Divider />

          <section>
            <p className="mb-1.5 flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
              <Icon icon={Users} size={12} />
              Recommended Nodes
            </p>
            {nearestCandidates.length === 0 ? (
              <p className="text-small text-text-tertiary">No candidate nodes available nearby.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {nearestCandidates.map(({ entry, distance }) => (
                  <li
                    key={entry.candidate.id}
                    className="flex items-center justify-between text-small"
                  >
                    <div>
                      <p className="text-text-primary">{entry.candidate.name}</p>
                      <p className="text-caption text-text-tertiary">
                        {formatDistance(distance)} from gap center
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        selectNode(entry.candidate.id)
                        viewport.zoomToNode(entry.candidate.position)
                      }}
                    >
                      View
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
