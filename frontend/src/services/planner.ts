/**
 * Access to the real PUDO siting analysis.
 *
 * The numbers here come from the Python pipeline in `analysis/` — OSM road
 * network, WorldPop 2020 population raster, exclusion zones, and a greedy
 * max-coverage solve. `analysis/export_static.py` writes its results to
 * `public/data/`, so this reads flat files rather than calling a server.
 *
 * This is deliberately separate from `@/mock`. Everything in this module is
 * measured; everything in `@/mock` is invented for UI development. Keeping
 * the boundary sharp means nobody has to guess which numbers on screen are
 * real — see `plannerAdapters.ts` for the one place they meet.
 */

/** Where `export_static.py` writes. Relative so it survives sub-path hosting
 *  (e.g. GitHub Pages serving from /repo-name/). */
const DATA_BASE = `${import.meta.env.BASE_URL}data`

async function getJson<T>(file: string): Promise<T> {
  const response = await fetch(`${DATA_BASE}/${file}`)
  if (!response.ok) {
    throw new Error(
      `Could not load analysis data (${file}: ${response.status}). ` +
        `Run \`python analysis/export_static.py\` to regenerate public/data/.`
    )
  }
  return response.json() as Promise<T>
}

// ---------------------------------------------------------------- summary

export interface ThresholdSummary {
  /** Share of the study-area population that has *any* candidate site within
   *  this walking time. The hard ceiling on coverage — no number of nodes
   *  can beat it, because the rest of the population is simply too far from
   *  anywhere a node is allowed to go. */
  coverable_pct: number
  /** Total candidate sites in the greedy ranking for this threshold. */
  nodes_total: number
  /** Straight-line equivalent of the walking time, at the pipeline's speed. */
  walk_meters: number
}

export interface PlannerSummary {
  /** Total population of Greater Accra + Kasoa, per WorldPop 2020. */
  total_pop: number
  walk_speed_m_min: number
  /** Walking-time thresholds the pipeline solved for, ascending. */
  minutes: number[]
  thresholds: Record<string, ThresholdSummary>
}

export function fetchSummary(): Promise<PlannerSummary> {
  return getJson<PlannerSummary>('summary.json')
}

// ---------------------------------------------------------------- nodes

export interface PudoNode {
  /** 1-based position in the greedy ranking. Rank 1 serves the most people. */
  rank: number
  lat: number
  lon: number
  /** People this node is the *first* to bring into coverage. Because the
   *  ranking is greedy, this is marginal gain, not catchment size — later
   *  nodes score lower partly because earlier ones already took their people. */
  peopleServed: number
  /** Cumulative share of total population covered by ranks 1..rank. */
  cumPct: number
}

/** On-disk shape: rows are arrays, not objects, to keep the 10 500-node file
 *  small. Field order is declared in the file itself rather than assumed. */
interface NodesFile {
  minutes: number
  walk_meters: number
  fields: ['rank', 'lat', 'lon', 'people_served', 'cum_pct']
  rows: [number, number, number, number, number][]
}

export interface NodeRanking {
  minutes: number
  walkMeters: number
  /** The complete greedy ranking, ascending by rank. */
  nodes: PudoNode[]
}

export async function fetchNodeRanking(minutes: number): Promise<NodeRanking> {
  const file = await getJson<NodesFile>(`nodes-${minutes}.json`)
  return {
    minutes: file.minutes,
    walkMeters: file.walk_meters,
    nodes: file.rows.map(([rank, lat, lon, peopleServed, cumPct]) => ({
      rank,
      lat,
      lon,
      peopleServed,
      cumPct,
    })),
  }
}

// ---------------------------------------------------------------- geometry

/** Study-area outline: Greater Accra Region + Kasoa, as one polygon set. */
export function fetchBoundary(): Promise<GeoJSON.FeatureCollection> {
  return getJson<GeoJSON.FeatureCollection>('boundary.geojson')
}

/** Zones a PUDO node may not be sited in — water, wetland, industrial,
 *  military, airport, cemetery, landfill — buffered by 25 m. */
export function fetchExclusions(): Promise<GeoJSON.FeatureCollection> {
  return getJson<GeoJSON.FeatureCollection>('exclusions.geojson')
}

// ---------------------------------------------------------------- selection

export interface CoverageSelection {
  /** The chosen nodes: ranks 1..nodesNeeded. */
  nodes: PudoNode[]
  /** How many nodes it takes to hit the target. */
  nodesNeeded: number
  /** Coverage actually reached — at or just above the target when feasible. */
  achievedPct: number
  /** False when the target exceeds what this walking time can ever reach;
   *  the full node set is returned instead. */
  feasible: boolean
}

/**
 * Pick the smallest node set meeting a population-coverage target.
 *
 * The pipeline's ranking is greedy, so the optimal set for *any* target is
 * a prefix of it — selecting is a search for the first rank whose cumulative
 * coverage clears the target, which is why the whole slider runs client-side
 * with no request per move. Mirrors `/api/nodes` in `analysis/api.py`.
 */
export function selectNodesForCoverage(
  ranking: NodeRanking,
  targetPct: number
): CoverageSelection {
  const { nodes } = ranking
  if (nodes.length === 0) {
    return { nodes: [], nodesNeeded: 0, achievedPct: 0, feasible: false }
  }

  const ceiling = nodes[nodes.length - 1].cumPct
  if (ceiling < targetPct) {
    // Target is above this walking time's coverable ceiling — the caller gets
    // everything available plus `feasible: false` to explain the shortfall.
    return {
      nodes,
      nodesNeeded: nodes.length,
      achievedPct: ceiling,
      feasible: false,
    }
  }

  let low = 0
  let high = nodes.length - 1
  while (low < high) {
    const mid = (low + high) >> 1
    if (nodes[mid].cumPct >= targetPct) high = mid
    else low = mid + 1
  }

  return {
    nodes: nodes.slice(0, low + 1),
    nodesNeeded: low + 1,
    achievedPct: nodes[low].cumPct,
    feasible: true,
  }
}
