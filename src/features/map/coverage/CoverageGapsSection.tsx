import { Badge } from '@/components/ui/Badge'
import { formatNumber } from '@/utils/formatters'
import { useMapStore } from '@/store/mapStore'
import { MOCK_COVERAGE_GAPS } from '@/mock/coverageGaps'
import {
  calculateGapScore,
  classifyGapPriority,
  summarizeGaps,
} from '@/features/map/analysis/gapDetection'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The Coverage Analysis panel's Coverage Gaps section — lists every
 * underserved area (mock/coverageGaps.ts), classified by priority via
 * analysis/gapDetection.ts. Clicking a row selects the gap (mapStore.
 * selectGap) and flies the map there — the same selection CoverageGapLayer
 * reacts to on the map side, so list and map are always in sync.
 *
 * Props
 * -----
 * None — self-contained.
 *
 * Example usage
 * -------------
 * <CoverageGapsSection />
 *
 * Accessibility
 * -------------
 * Each row is a real button with aria-pressed reflecting selection.
 *
 * Future extension
 * -----------------
 * Add search/filter-by-priority once gap count grows large enough to
 * need it (currently ~10 gaps, comfortably scannable as-is).
 */
export function CoverageGapsSection() {
  const selectedGapId = useMapStore((state) => state.selectedGapId)
  const selectGap = useMapStore((state) => state.selectGap)

  const summary = summarizeGaps(MOCK_COVERAGE_GAPS)
  const gapsWithScore = MOCK_COVERAGE_GAPS.map((gap) => ({
    gap,
    score: calculateGapScore(gap),
    priority: classifyGapPriority(calculateGapScore(gap)),
  })).sort((a, b) => b.score - a.score)

  const priorityTone = { high: 'error', medium: 'warning', low: 'info' } as const

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-error-50 p-2 dark:bg-error-950">
          <p className="text-h4 text-error-700 dark:text-error-300">{summary.highPriority}</p>
          <p className="text-caption text-text-tertiary">High</p>
        </div>
        <div className="rounded-md bg-warning-50 p-2 dark:bg-warning-950">
          <p className="text-h4 text-warning-700 dark:text-warning-300">{summary.mediumPriority}</p>
          <p className="text-caption text-text-tertiary">Medium</p>
        </div>
        <div className="rounded-md bg-info-50 p-2 dark:bg-info-950">
          <p className="text-h4 text-info-700 dark:text-info-300">{summary.lowPriority}</p>
          <p className="text-caption text-text-tertiary">Low</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {gapsWithScore.map(({ gap, priority }) => {
          const isSelected = gap.id === selectedGapId
          return (
            <button
              key={gap.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => selectGap(gap.id)}
              className={cn(
                'flex flex-col gap-1 rounded-md border px-3 py-2 text-left transition-colors duration-(--duration-fast)',
                isSelected
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                  : 'border-border hover:bg-surface-secondary'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-small font-medium text-text-primary">
                  {gap.neighbourhood}
                </span>
                <Badge tone={priorityTone[priority]} size="sm">
                  {priority}
                </Badge>
              </div>
              <span className="text-caption text-text-tertiary">
                {formatNumber(gap.populationAffected)} affected · {gap.areaKm2} km² · nearest node{' '}
                {(gap.nearestNodeDistanceMeters / 1000).toFixed(1)}km away
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
