import { createSeededRandom, randomInRange } from './random'

/**
 * Mock historical time series backing the Dashboard's KPI trend
 * indicators/sparklines (Step 3) and the Coverage Trend chart (Step 10).
 * There is no real historical snapshot store yet — every other Phase 6
 * number is computed live from current mock data, which has no notion
 * of "last month." This file is the explicit, isolated stand-in for
 * that missing history so the rest of the dashboard doesn't have to
 * fake trends inline.
 *
 * Future backend integration
 * ---------------------------
 * Once a backend persists periodic coverage/candidate snapshots (e.g. a
 * nightly `coverage_snapshots` table), this becomes a
 * `GET /analytics/coverage-history?months=6` response and every function
 * below is deleted rather than reimplemented — the *shape* consumers
 * expect (an ordered array of { label, value } points) stays the same.
 */
export interface TrendPoint {
  label: string
  value: number
}

const MONTH_LABELS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

/** A short deterministic series ending near `currentValue`, trending
 *  gently upward with per-point noise — used for sparklines where only
 *  the general shape matters, not exact historical accuracy. */
export function generateTrendSeries(
  seed: number,
  currentValue: number,
  points = 6,
  volatility = 0.08
): TrendPoint[] {
  const random = createSeededRandom(seed)
  const series: number[] = [currentValue]
  for (let i = 1; i < points; i += 1) {
    const previous = series[series.length - 1]!
    const drift = randomInRange(random, -volatility, volatility * 1.4) // slight upward bias
    series.push(Math.max(0, previous / (1 + drift)))
  }
  series.reverse()

  return series.map((value, index) => ({
    label: MONTH_LABELS[MONTH_LABELS.length - points + index] ?? `M${index + 1}`,
    value: Math.round(value * 100) / 100,
  }))
}

/** Percent change from the first to the last point in a trend series —
 *  what StatCard's trend indicator displays. */
export function trendDelta(series: TrendPoint[]): { direction: 'up' | 'down'; percent: number } {
  if (series.length < 2) return { direction: 'up', percent: 0 }
  const first = series[0]!.value
  const last = series[series.length - 1]!.value
  const percent = first !== 0 ? ((last - first) / first) * 100 : 0
  return { direction: percent >= 0 ? 'up' : 'down', percent: Math.abs(Math.round(percent * 10) / 10) }
}

// Fixed seeds per KPI so the same metric always produces the same
// illustrative sparkline/trend across reloads.
export const KPI_TREND_SEEDS = {
  existingNodes: 501,
  candidateNodes: 502,
  coveragePercent: 503,
  populationServed: 504,
  coverageGaps: 505,
  highPriorityGaps: 506,
  accessibilityScore: 507,
  candidateScore: 508,
} as const
