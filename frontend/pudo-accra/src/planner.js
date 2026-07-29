/**
 * Access to the PUDO siting analysis.
 *
 * These numbers come from the Python pipeline in `analysis/` — OpenStreetMap's
 * walkable road network, the WorldPop 2020 population raster, exclusion zones,
 * and a greedy max-coverage solve. `analysis/export_static.py` writes the
 * results into `public/data/`, so this reads flat files and there is no server
 * to run or host.
 */

// Relative to the app's base path, so this keeps working when the site is
// served from a sub-path (e.g. GitHub Pages' /pudo-accra/).
const DATA_BASE = `${import.meta.env.BASE_URL}data`;

async function getJson(file) {
  const response = await fetch(`${DATA_BASE}/${file}`);
  if (!response.ok) {
    throw new Error(
      `Could not load ${file} (HTTP ${response.status}). ` +
        `Run "python analysis/export_static.py" to regenerate public/data/.`
    );
  }
  return response.json();
}

/** Walking-time thresholds the pipeline solved for. Must match WALK_MINUTES in
 *  analysis/config.py — any other value has no data file behind it. */
export const WALK_MINUTES = [5, 7, 10, 12, 15, 20];

/** Study-area totals and the per-threshold coverage ceilings. */
export function fetchSummary() {
  return getJson('summary.json');
}

/** Study-area outline: Greater Accra Region + Kasoa, as one region. */
export function fetchBoundary() {
  return getJson('boundary.geojson');
}

/** Zones a node may not be sited in — water, wetland, industrial, military,
 *  airport, cemetery, landfill — each buffered by 25 m. */
export function fetchExclusions() {
  return getJson('exclusions.geojson');
}

/**
 * The full greedy ranking for one walking-time threshold.
 *
 * Rows arrive as arrays rather than objects to keep the largest file (10 506
 * sites) small; this unpacks them into something readable.
 */
export async function fetchRanking(minutes) {
  const file = await getJson(`nodes-${minutes}.json`);
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
  };
}

/**
 * Pick the smallest set of sites that meets a population-coverage target.
 *
 * The pipeline ranked sites greedily, so the best set for *any* target is a
 * prefix of that one ranking — finding it is a search for the first rank whose
 * cumulative coverage clears the target. That's why changing the target is
 * instant and never re-fetches anything.
 *
 * Returns `feasible: false` when the target is above what this walking time
 * can ever reach, in which case every available site is returned instead.
 */
export function selectForCoverage(ranking, targetPct) {
  const { nodes } = ranking;
  if (nodes.length === 0) {
    return { nodes: [], nodesNeeded: 0, achievedPct: 0, feasible: false };
  }

  const ceiling = nodes[nodes.length - 1].cumPct;
  if (ceiling < targetPct) {
    return {
      nodes,
      nodesNeeded: nodes.length,
      achievedPct: ceiling,
      feasible: false,
    };
  }

  let low = 0;
  let high = nodes.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (nodes[mid].cumPct >= targetPct) high = mid;
    else low = mid + 1;
  }

  return {
    nodes: nodes.slice(0, low + 1),
    nodesNeeded: low + 1,
    achievedPct: nodes[low].cumPct,
    feasible: true,
  };
}
