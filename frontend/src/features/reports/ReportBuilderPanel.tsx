import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { RadioGroup, RadioItem } from '@/components/forms/Radio'
import { Label } from '@/components/forms/Label'
import { Checkbox } from '@/components/forms/Checkbox'
import { Select } from '@/components/forms/Select'
import { Button } from '@/components/ui/Button'
import { Icon, Check, X } from '@/components/icons'
import { ACCRA_NEIGHBOURHOODS } from '@/mock/geo'
import {
  REPORT_TYPE_DEFAULT_SECTIONS,
  REPORT_TYPE_DESCRIPTIONS,
  REPORT_TYPE_LABELS,
  REPORT_SECTION_LABELS,
  hasActiveReportFilters,
  type ReportFilters,
  type ReportSectionId,
  type ReportType,
} from './types'

/**
 * Purpose
 * -------
 * The left-hand configuration panel for the Reports workspace: pick a
 * report type (starts sections at that type's sensible preset), toggle
 * individual sections on/off (every report is really "custom"
 * underneath), and apply the same district/status filters
 * Analytics/Nodes use, scoped to this workspace's own
 * reportBuilderStore.
 *
 * Props
 * -----
 * All state is passed in / read back out via callbacks (component itself
 * holds no state) so ReportsPage can wire it straight to
 * useReportBuilderStore without this component needing to know the
 * store exists.
 */
const NODE_STATUS_OPTIONS = ['active', 'maintenance', 'offline', 'archived'] as const
const CANDIDATE_STATUS_OPTIONS = ['proposed', 'under-review', 'approved', 'rejected'] as const
const REPORT_TYPES: ReportType[] = [
  'network-summary',
  'district-breakdown',
  'candidate-recommendations',
  'custom',
]
const ALL_SECTIONS: ReportSectionId[] = [
  'network-summary',
  'district-breakdown',
  'candidate-recommendations',
  'coverage-by-district-chart',
  'candidate-score-chart',
]

const NEIGHBOURHOOD_OPTIONS = [
  { value: '__all__', label: 'All districts' },
  ...ACCRA_NEIGHBOURHOODS.map((area) => ({ value: area.name, label: area.name })),
]

function StatusChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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

export interface ReportBuilderPanelProps {
  reportType: ReportType
  onReportTypeChange: (type: ReportType) => void

  sections: Set<ReportSectionId>
  onToggleSection: (id: ReportSectionId) => void

  filters: ReportFilters
  onSetNeighbourhood: (neighbourhood: string | null) => void
  onToggleNodeStatus: (status: (typeof NODE_STATUS_OPTIONS)[number]) => void
  onToggleCandidateStatus: (status: (typeof CANDIDATE_STATUS_OPTIONS)[number]) => void
  onResetFilters: () => void
}

export function ReportBuilderPanel({
  reportType,
  onReportTypeChange,
  sections,
  onToggleSection,
  filters,
  onSetNeighbourhood,
  onToggleNodeStatus,
  onToggleCandidateStatus,
  onResetFilters,
}: ReportBuilderPanelProps) {
  const selectedNeighbourhood =
    filters.neighbourhoods.size === 1 ? Array.from(filters.neighbourhoods)[0]! : '__all__'

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 lg:w-auto lg:max-w-[24rem] lg:shrink-0">
      <Card>
        <CardHeader>
          <CardTitle>Report Type</CardTitle>
          <CardDescription>{REPORT_TYPE_DESCRIPTIONS[reportType]}</CardDescription>
        </CardHeader>
        <RadioGroup
          value={reportType}
          onValueChange={(value) => onReportTypeChange(value as ReportType)}
          className="flex flex-col gap-2.5"
        >
          {REPORT_TYPES.map((type) => (
            <div key={type} className="flex items-center gap-2">
              <RadioItem value={type} id={`report-type-${type}`} />
              <Label htmlFor={`report-type-${type}`} className="cursor-pointer font-normal">
                {REPORT_TYPE_LABELS[type]}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sections</CardTitle>
          <CardDescription>
            Starts from {REPORT_TYPE_LABELS[reportType]}'s defaults — adjust freely.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-2.5">
          {ALL_SECTIONS.map((id) => (
            <div key={id} className="flex items-center gap-2">
              <Checkbox
                id={`section-${id}`}
                checked={sections.has(id)}
                onCheckedChange={() => onToggleSection(id)}
              />
              <Label htmlFor={`section-${id}`} className="cursor-pointer font-normal">
                {REPORT_SECTION_LABELS[id]}
              </Label>
              {REPORT_TYPE_DEFAULT_SECTIONS[reportType].includes(id) && (
                <Icon icon={Check} size={12} className="text-text-tertiary" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {hasActiveReportFilters(filters) && (
            <Button variant="ghost" size="sm" leftIcon={X} onClick={onResetFilters}>
              Clear
            </Button>
          )}
        </CardHeader>

        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1.5 text-caption font-semibold text-text-secondary">District</p>
            <Select
              value={selectedNeighbourhood}
              onValueChange={(value) => onSetNeighbourhood(value === '__all__' ? null : value)}
              options={NEIGHBOURHOOD_OPTIONS}
              size="sm"
              aria-label="Filter report by district"
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-caption font-semibold text-text-secondary">Node status</p>
            <div className="flex flex-wrap gap-2">
              {NODE_STATUS_OPTIONS.map((status) => (
                <StatusChip
                  key={status}
                  label={status}
                  active={filters.nodeStatuses.has(status)}
                  onClick={() => onToggleNodeStatus(status)}
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
                  onClick={() => onToggleCandidateStatus(status)}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
