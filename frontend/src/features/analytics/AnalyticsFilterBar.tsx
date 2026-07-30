import { Select } from '@/components/forms/Select'
import { Button } from '@/components/ui/Button'
import { Icon, SlidersHorizontal, X } from '@/components/icons'
import { ACCRA_NEIGHBOURHOODS } from '@/mock/geo'
import { DATE_RANGE_PRESET_OPTIONS } from '@/mock/analyticsTrends'
import { hasActiveFilters, type AnalyticsFilters } from './types'

/**
 * Purpose
 * -------
 * The core new capability Phase 8 adds over the Dashboard (Phase 8 plan
 * §3.1) — district, node-status, candidate-status, and date-range
 * filters that compose (e.g. "Osu district, active nodes only"). Reads
 * from and writes to useAnalyticsFilterStore, so every widget in
 * AnalyticsPage sees the same selection without prop-drilling.
 *
 * Props
 * -----
 * - filters: AnalyticsFilters
 * - onFiltersChange: (filters: AnalyticsFilters) => void
 * - onReset: () => void
 *
 * Design note
 * -----------
 * Status filters use toggle chips (not checkboxes-in-a-panel like
 * features/nodes/NodeFiltersPanel) since a filter *bar* reads
 * horizontally and needs to stay compact — full checkbox lists belong
 * in a sidebar panel, which this workspace doesn't have.
 *
 * Accessibility
 * -------------
 * Every control is a real Select or Button (aria-pressed on toggle
 * chips), fully keyboard operable.
 */
const NODE_STATUS_OPTIONS = ['active', 'maintenance', 'offline', 'archived'] as const
const CANDIDATE_STATUS_OPTIONS = ['proposed', 'under-review', 'approved', 'rejected'] as const

const NEIGHBOURHOOD_OPTIONS = [
  { value: '__all__', label: 'All districts' },
  ...ACCRA_NEIGHBOURHOODS.map((area) => ({ value: area.name, label: area.name })),
]

export interface AnalyticsFilterBarProps {
  filters: AnalyticsFilters
  onFiltersChange: (filters: AnalyticsFilters) => void
  onReset: () => void
}

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

function StatusChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        active
          ? 'rounded-full border border-primary-500 bg-primary-100 px-3 py-1 text-caption font-medium capitalize text-primary-700 dark:bg-primary-950 dark:text-primary-300'
          : 'rounded-full border border-border bg-surface px-3 py-1 text-caption font-medium capitalize text-text-secondary hover:bg-surface-secondary'
      }
    >
      {label.replace('-', ' ')}
    </button>
  )
}

export function AnalyticsFilterBar({ filters, onFiltersChange, onReset }: AnalyticsFilterBarProps) {
  // A single "primary" neighbourhood selection drives the Select control
  // (compact, one line) while still storing into the composable Set the
  // rest of the app's filter predicates expect — selecting a new district
  // replaces rather than adds, since a dropdown can only express one
  // choice at a time; use the chip row below it for multi-status filters.
  const selectedNeighbourhood = filters.neighbourhoods.size === 1
    ? Array.from(filters.neighbourhoods)[0]!
    : '__all__'

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-text-secondary">
          <Icon icon={SlidersHorizontal} size={16} />
          <p className="text-caption font-semibold uppercase tracking-wide">Filters</p>
        </div>
        {hasActiveFilters(filters) && (
          <Button variant="ghost" size="sm" leftIcon={X} onClick={onReset}>
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="mb-1.5 text-caption font-semibold text-text-secondary">District</p>
          <Select
            value={selectedNeighbourhood}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                neighbourhoods: value === '__all__' ? new Set() : new Set([value]),
              })
            }
            options={NEIGHBOURHOOD_OPTIONS}
            size="sm"
            aria-label="Filter by district"
          />
        </div>

        <div>
          <p className="mb-1.5 text-caption font-semibold text-text-secondary">Date range</p>
          <Select
            value={filters.dateRange}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, dateRange: value as AnalyticsFilters['dateRange'] })
            }
            options={DATE_RANGE_PRESET_OPTIONS}
            size="sm"
            aria-label="Filter by date range"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-caption font-semibold text-text-secondary">Node status</p>
        <div className="flex flex-wrap gap-2">
          {NODE_STATUS_OPTIONS.map((status) => (
            <StatusChip
              key={status}
              label={status}
              active={filters.nodeStatuses.has(status)}
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  nodeStatuses: toggleInSet(filters.nodeStatuses, status),
                })
              }
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-caption font-semibold text-text-secondary">Candidate status</p>
        <div className="flex flex-wrap gap-2">
          {CANDIDATE_STATUS_OPTIONS.map((status) => (
            <StatusChip
              key={status}
              label={status}
              active={filters.candidateStatuses.has(status)}
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  candidateStatuses: toggleInSet(filters.candidateStatuses, status),
                })
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
