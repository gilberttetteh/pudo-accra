import { Badge } from '@/components/ui/Badge'
import { formatPercent } from '@/utils/formatters'
import { MOCK_COVERAGE_POLYGONS } from '@/mock/coverage'
import { MOCK_ACCESSIBILITY_ZONES } from '@/mock/accessibility'

/**
 * Purpose
 * -------
 * The Coverage Analysis panel's Coverage Statistics section — a
 * per-neighbourhood breakdown of coverage vs. accessibility, letting a
 * planner spot neighbourhoods that are covered but hard to reach (or
 * vice versa) at a glance. Distinct from Overview (citywide totals):
 * this is the disaggregated view.
 *
 * Props
 * -----
 * None — reads the static mock coverage/accessibility datasets
 * directly, since this section shows every neighbourhood regardless of
 * current map filters (a deliberate choice — see CoverageAnalysisPanel's
 * doc comment).
 *
 * Example usage
 * -------------
 * <CoverageStatisticsSection />
 *
 * Accessibility
 * -------------
 * Plain semantic list; Badge tones give redundant (non-color-only)
 * status via text.
 *
 * Future extension
 * -----------------
 * Add a sortable table (reusing the Table primitive) once neighbourhood
 * count grows past what a scannable list comfortably shows.
 */
function toneForScore(score: number): 'success' | 'warning' | 'error' {
  if (score >= 0.7) return 'success'
  if (score >= 0.45) return 'warning'
  return 'error'
}

export function CoverageStatisticsSection() {
  const rows = MOCK_COVERAGE_POLYGONS.map((polygon) => {
    const accessibility = MOCK_ACCESSIBILITY_ZONES.find(
      (zone) => zone.neighbourhood === polygon.neighbourhood
    )
    return {
      neighbourhood: polygon.neighbourhood,
      coverageScore: polygon.coverageScore,
      accessibilityScore: accessibility?.accessibilityScore ?? 0,
    }
  })

  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-[1fr,auto,auto] gap-2 px-1 pb-1.5 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
        <span>Neighbourhood</span>
        <span>Coverage</span>
        <span>Access.</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.neighbourhood}
          className="grid grid-cols-[1fr,auto,auto] items-center gap-2 rounded-md px-1 py-1.5 text-small hover:bg-surface-secondary"
        >
          <span className="truncate text-text-primary">{row.neighbourhood}</span>
          <Badge tone={toneForScore(row.coverageScore)} size="sm">
            {formatPercent(row.coverageScore)}
          </Badge>
          <Badge tone={toneForScore(row.accessibilityScore)} size="sm">
            {formatPercent(row.accessibilityScore)}
          </Badge>
        </div>
      ))}
    </div>
  )
}
