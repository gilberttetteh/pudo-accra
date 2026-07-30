import { createSeededRandom, randomInRange } from './random'
import type { TrendPoint } from './dashboardTrends'

/**
 * Purpose
 * -------
 * A richer, daily-granularity illustrative history for Analytics (Phase
 * 8), separate from mock/dashboardTrends.ts's thin 6-point monthly
 * series (which stays exactly as-is for the Dashboard's sparklines/
 * Coverage Trend chart — untouched, per Phase 8 scope).
 *
 * Kept in its own file rather than extending dashboardTrends.ts because
 * the two series solve different problems: the Dashboard wants "does
 * this look like it's trending up," Analytics wants enough points for a
 * date-range filter to have something to actually filter. Mixing them
 * would make dashboardTrends.ts serve two different granularities from
 * one seed, which the Phase 8 plan explicitly flags as not worth the
 * complexity ("keep mock history shallow and explicit rather than
 * over-investing in realism here").
 *
 * Future backend integration
 * ---------------------------
 * Deleted entirely once a backend persists real daily/periodic snapshots
 * (e.g. `GET /analytics/coverage-history?range=90d`) — the consumer
 * shape (an ordered array of { label, value } points, same as
 * dashboardTrends.ts's TrendPoint) is designed to stay identical so
 * AnalyticsChartsGrid doesn't need to change when that swap happens.
 */

export type AnalyticsDateRangePreset = '7d' | '30d' | '90d'

export const DATE_RANGE_PRESET_DAYS: Record<AnalyticsDateRangePreset, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

export const DATE_RANGE_PRESET_OPTIONS: { value: AnalyticsDateRangePreset; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

function dayLabel(daysAgo: number): string {
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
  return new Intl.DateTimeFormat('en-GH', { day: 'numeric', month: 'short' }).format(date)
}

/** A daily series ending near `currentValue`, trending gently with
 *  per-point noise — same shape/spirit as dashboardTrends.ts's
 *  generateTrendSeries, just at daily rather than monthly granularity. */
export function generateDailyTrendSeries(
  seed: number,
  currentValue: number,
  days: number,
  volatility = 0.03
): TrendPoint[] {
  const random = createSeededRandom(seed)
  const series: number[] = [currentValue]
  for (let i = 1; i < days; i += 1) {
    const previous = series[series.length - 1]!
    const drift = randomInRange(random, -volatility, volatility * 1.2)
    series.push(Math.max(0, previous / (1 + drift)))
  }
  series.reverse()

  return series.map((value, index) => ({
    label: dayLabel(days - 1 - index),
    value: Math.round(value * 100) / 100,
  }))
}

// Fixed seeds per metric, isolated from dashboardTrends.ts's
// KPI_TREND_SEEDS so regenerating one doesn't shift the other.
export const ANALYTICS_TREND_SEEDS = {
  coveragePercent: 601,
  candidateScoreAverage: 602,
  gapsResolved: 603,
} as const
