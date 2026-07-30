import type { MockNode, MockCandidateNode, Provider } from '@/mock/nodes'
import type { PopulationCell } from '@/mock/population'
import type { ScoredCandidate } from '@/features/map/analysis/candidateRanking'
import { calculateCoverage } from '@/features/map/analysis/coverageAnalysis'
import {
  ISOCHRONE_BANDS,
  minutesToRadiusMeters,
  type IsochroneBandMinutes,
} from '@/features/map/analysis/isochroneEngine'
import { calculateFloodRiskScore } from '@/features/map/analysis/scoring'
import type { AnalyticsFilters } from './types'

/**
 * Pure aggregation + filtering functions for the Analytics workspace
 * (Phase 8). Same discipline as features/map/analysis/* and
 * features/dashboard/selectors.ts: no React, no store imports. Anything
 * already computed by those two layers (coverage %, gap severity,
 * candidate scores, status grouping, accessibility buckets) is reused
 * via import, not re-derived here — this file only adds the groupings
 * Phase 6/7 didn't need (by-provider, score histograms, flood-vs-access
 * correlation, isochrone-band coverage) plus the filter predicates the
 * new AnalyticsFilterBar needs.
 *
 * Future backend integration
 * ---------------------------
 * Every grouping here is a `GROUP BY` / aggregate a backend would run
 * once real data exists, same as dashboard/selectors.ts — signatures
 * (raw records + params in, labeled buckets out) are designed to stay
 * the same after that swap.
 */

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

/** Applies the Analytics filter bar's neighbourhood + status selections
 *  to the existing-node array. Empty sets mean "show all" — same
 *  convention as features/nodes/filtering.ts's NodeFilters, so the two
 *  filter systems read consistently even though they're separate state. */
export function filterNodesForAnalytics(nodes: MockNode[], filters: AnalyticsFilters): MockNode[] {
  return nodes.filter((node) => {
    if (filters.neighbourhoods.size > 0 && !filters.neighbourhoods.has(node.neighbourhood)) {
      return false
    }
    if (filters.nodeStatuses.size > 0 && !filters.nodeStatuses.has(node.status)) {
      return false
    }
    return true
  })
}

/** Same idea as filterNodesForAnalytics, for candidate nodes. */
export function filterCandidatesForAnalytics(
  candidates: MockCandidateNode[],
  filters: AnalyticsFilters
): MockCandidateNode[] {
  return candidates.filter((candidate) => {
    if (filters.neighbourhoods.size > 0 && !filters.neighbourhoods.has(candidate.neighbourhood)) {
      return false
    }
    if (filters.candidateStatuses.size > 0 && !filters.candidateStatuses.has(candidate.status)) {
      return false
    }
    return true
  })
}

// ---------------------------------------------------------------------------
// Provider comparison (3.2)
// ---------------------------------------------------------------------------

export interface ProviderComparison {
  provider: Provider
  existingCount: number
  candidateCount: number
}

/** Groups existing + candidate nodes by operating provider — the "which
 *  providers run the most infrastructure vs propose the most new sites"
 *  view nothing in Phase 6/7 currently shows. */
export function compareProviders(
  existingNodes: MockNode[],
  candidateNodes: MockCandidateNode[]
): ProviderComparison[] {
  const counts = new Map<Provider, ProviderComparison>()

  const ensure = (provider: Provider) => {
    let entry = counts.get(provider)
    if (!entry) {
      entry = { provider, existingCount: 0, candidateCount: 0 }
      counts.set(provider, entry)
    }
    return entry
  }

  for (const node of existingNodes) ensure(node.provider).existingCount += 1
  for (const candidate of candidateNodes) ensure(candidate.provider).candidateCount += 1

  return Array.from(counts.values()).sort(
    (a, b) => b.existingCount + b.candidateCount - (a.existingCount + a.candidateCount)
  )
}

// ---------------------------------------------------------------------------
// Candidate score distribution (3.2)
// ---------------------------------------------------------------------------

export interface ScoreHistogramBucket {
  label: string
  min: number
  max: number
  count: number
}

/** Buckets ranked candidates' overallScore into fixed-width bands for a
 *  histogram — richer than the Dashboard's by-status doughnut, which
 *  shows pipeline stage but not score quality. */
export function candidateScoreHistogram(
  ranked: ScoredCandidate[],
  bucketSize = 0.1
): ScoreHistogramBucket[] {
  const bucketCount = Math.round(1 / bucketSize)
  const buckets: ScoreHistogramBucket[] = Array.from({ length: bucketCount }, (_, index) => {
    const min = index * bucketSize
    const max = index === bucketCount - 1 ? 1 : min + bucketSize
    return { label: `${Math.round(min * 100)}–${Math.round(max * 100)}`, min, max, count: 0 }
  })

  for (const entry of ranked) {
    const index = Math.min(bucketCount - 1, Math.floor(entry.metrics.overallScore / bucketSize))
    buckets[index]!.count += 1
  }

  return buckets
}

// ---------------------------------------------------------------------------
// Flood-risk vs accessibility correlation (3.2)
// ---------------------------------------------------------------------------

export interface FloodAccessibilityPoint {
  id: string
  name: string
  floodSafety: number // 0–1, higher = safer (from calculateFloodRiskScore)
  accessibility: number // 0–1
}

/** Pairs each candidate's flood-safety score against its accessibility
 *  score — answers "are the safest locations also the most accessible,
 *  or is there a trade-off?" which neither score alone can show. */
export function floodAccessibilityCorrelation(
  candidates: MockCandidateNode[]
): FloodAccessibilityPoint[] {
  return candidates.map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
    floodSafety: calculateFloodRiskScore(candidate.riskLevel),
    accessibility: candidate.accessibilityScore,
  }))
}

// ---------------------------------------------------------------------------
// Node density vs population density (3.2)
// ---------------------------------------------------------------------------

export interface DensityPoint {
  neighbourhood: string
  nodeCount: number
  averagePopulationDensity: number
}

/** Pairs, per neighbourhood, how many existing nodes sit there against
 *  the average population density of the population cells nearest that
 *  neighbourhood's nodes — a rough "are nodes where the people are?"
 *  scatter. Neighbourhoods with zero nodes are omitted (nothing to plot
 *  a node-density point for). */
export function nodeDensityVsPopulation(
  nodes: MockNode[],
  populationCells: PopulationCell[]
): DensityPoint[] {
  const byNeighbourhood = new Map<string, MockNode[]>()
  for (const node of nodes) {
    const list = byNeighbourhood.get(node.neighbourhood) ?? []
    list.push(node)
    byNeighbourhood.set(node.neighbourhood, list)
  }

  return Array.from(byNeighbourhood.entries()).map(([neighbourhood, neighbourhoodNodes]) => {
    // Nearest population cell to each node in this neighbourhood, then
    // average their density — a coarse proxy since the mock population
    // grid isn't neighbourhood-tagged directly.
    const densities = neighbourhoodNodes.map((node) => {
      let nearest: PopulationCell | undefined
      let nearestDistanceSq = Infinity
      const [lat, lng] = Array.isArray(node.position)
        ? node.position
        : [node.position.lat, node.position.lng]
      for (const cell of populationCells) {
        const [cellLat, cellLng] = Array.isArray(cell.position)
          ? cell.position
          : [cell.position.lat, cell.position.lng]
        const distanceSq = (lat - cellLat) ** 2 + (lng - cellLng) ** 2
        if (distanceSq < nearestDistanceSq) {
          nearestDistanceSq = distanceSq
          nearest = cell
        }
      }
      return nearest?.densityPerKm2 ?? 0
    })

    const averagePopulationDensity =
      densities.length > 0 ? densities.reduce((sum, d) => sum + d, 0) / densities.length : 0

    return { neighbourhood, nodeCount: neighbourhoodNodes.length, averagePopulationDensity }
  })
}

// ---------------------------------------------------------------------------
// Isochrone coverage by walk-time band (3.2)
// ---------------------------------------------------------------------------

export interface IsochroneBandCoverage {
  minutes: IsochroneBandMinutes
  coveragePercent: number
}

/** Coverage % across the population grid at each of the four standard
 *  walk-time bands (5/10/15/20 min) — shows how much coverage grows as
 *  the acceptable walk time relaxes, using the same circular-approximation
 *  radii as features/map/analysis/isochroneEngine.ts so this stays
 *  consistent with what IsochroneLayer draws on the map. */
export function isochroneCoverageByBand(
  nodePositions: MockNode['position'][],
  populationCells: PopulationCell[],
  bands: IsochroneBandMinutes[] = ISOCHRONE_BANDS
): IsochroneBandCoverage[] {
  return bands
    .slice()
    .sort((a, b) => a - b)
    .map((minutes) => {
      const radiusMeters = minutesToRadiusMeters(minutes)
      const { coveragePercent } = calculateCoverage(nodePositions, populationCells, radiusMeters)
      return { minutes, coveragePercent }
    })
}
