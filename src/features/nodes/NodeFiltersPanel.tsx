import { Checkbox } from '@/components/forms/Checkbox'
import { Label } from '@/components/forms/Label'
import { Select } from '@/components/forms/Select'
import { Button } from '@/components/ui/Button'
import { useMapStore } from '@/store/mapStore'
import { ACCRA_NEIGHBOURHOODS } from '@/mock/geo'
import { PROVIDERS, type Provider, type RiskLevel } from '@/mock/nodes'
import type { NodeFilters } from './filtering'
import { DEFAULT_NODE_FILTERS } from './filtering'

/**
 * Purpose
 * -------
 * The full filter set from Phase 5's spec: Status, Type, Coverage,
 * Accessibility, Provider, Neighbourhood, Risk Level, and Layer. Lives
 * in MapSidebarPanel's existing "Filters" tab (Phase 4) — this replaces
 * that tab's simpler status/coverage-only content. The "Layer" filter
 * is literally the existing-nodes/candidate-nodes layer toggles from
 * mapStore, so toggling it here and toggling it in the Layers tab are
 * the same action (this is the "filters synchronize with the map layer
 * system" requirement — there's only one source of truth, not two
 * kept in sync).
 *
 * Props
 * -----
 * - filters: NodeFilters / onFiltersChange: (filters) => void
 *
 * Example usage
 * -------------
 * <NodeFiltersPanel filters={filters} onFiltersChange={setFilters} />
 *
 * Accessibility
 * -------------
 * Every control is a real Checkbox+Label or Select, fully keyboard
 * operable.
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
const ALL_STATUSES = [
  'active',
  'maintenance',
  'offline',
  'archived',
  'proposed',
  'under-review',
  'approved',
  'rejected',
]
const RISK_OPTIONS: RiskLevel[] = ['low', 'moderate', 'high']
const COVERAGE_BUCKETS = [
  { value: '0', label: 'Any' },
  { value: '0.5', label: '50%+' },
  { value: '0.8', label: '80%+' },
]

export interface NodeFiltersPanelProps {
  filters: NodeFilters
  onFiltersChange: (filters: NodeFilters) => void
}

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

export function NodeFiltersPanel({ filters, onFiltersChange }: NodeFiltersPanelProps) {
  const activeLayers = useMapStore((state) => state.activeLayers)
  const setLayerVisibility = useMapStore((state) => state.setLayerVisibility)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-caption font-semibold uppercase tracking-wide text-text-tertiary">
          Filters
        </p>
        <Button variant="link" size="sm" onClick={() => onFiltersChange(DEFAULT_NODE_FILTERS)}>
          Reset
        </Button>
      </div>

      <div>
        <p className="mb-2 text-caption font-semibold text-text-secondary">Type</p>
        <div className="flex flex-col gap-2">
          {(['existing', 'candidate'] as const).map((type) => (
            <div key={type} className="flex items-center gap-2.5">
              <Checkbox
                id={`filter-type-${type}`}
                checked={filters.types.has(type)}
                onCheckedChange={() =>
                  onFiltersChange({ ...filters, types: toggleInSet(filters.types, type) })
                }
              />
              <Label
                htmlFor={`filter-type-${type}`}
                className="cursor-pointer font-normal capitalize"
              >
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-caption font-semibold text-text-secondary">Status</p>
        <div className="grid grid-cols-2 gap-2">
          {ALL_STATUSES.map((status) => (
            <div key={status} className="flex items-center gap-2">
              <Checkbox
                id={`filter-status-${status}`}
                checked={filters.statuses.has(status)}
                onCheckedChange={() =>
                  onFiltersChange({ ...filters, statuses: toggleInSet(filters.statuses, status) })
                }
              />
              <Label
                htmlFor={`filter-status-${status}`}
                className="cursor-pointer text-caption font-normal capitalize"
              >
                {status.replace('-', ' ')}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-2 text-caption font-semibold text-text-secondary">Coverage</p>
          <Select
            value={String(filters.minCoverage)}
            onValueChange={(value) => onFiltersChange({ ...filters, minCoverage: Number(value) })}
            options={COVERAGE_BUCKETS}
            size="sm"
            aria-label="Minimum coverage"
          />
        </div>
        <div>
          <p className="mb-2 text-caption font-semibold text-text-secondary">Accessibility</p>
          <Select
            value={String(filters.minAccessibility)}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, minAccessibility: Number(value) })
            }
            options={COVERAGE_BUCKETS}
            size="sm"
            aria-label="Minimum accessibility"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-caption font-semibold text-text-secondary">Risk Level</p>
        <div className="flex gap-2">
          {RISK_OPTIONS.map((risk) => (
            <div key={risk} className="flex items-center gap-1.5">
              <Checkbox
                id={`filter-risk-${risk}`}
                checked={filters.riskLevels.has(risk)}
                onCheckedChange={() =>
                  onFiltersChange({ ...filters, riskLevels: toggleInSet(filters.riskLevels, risk) })
                }
              />
              <Label
                htmlFor={`filter-risk-${risk}`}
                className="cursor-pointer text-caption font-normal capitalize"
              >
                {risk}
              </Label>
            </div>
          ))}
        </div>
        <p className="mt-1 text-caption text-text-tertiary">Empty = all risk levels shown.</p>
      </div>

      <div>
        <p className="mb-2 text-caption font-semibold text-text-secondary">Provider</p>
        <div className="flex flex-col gap-2">
          {PROVIDERS.map((provider: Provider) => (
            <div key={provider} className="flex items-center gap-2.5">
              <Checkbox
                id={`filter-provider-${provider}`}
                checked={filters.providers.has(provider)}
                onCheckedChange={() =>
                  onFiltersChange({
                    ...filters,
                    providers: toggleInSet(filters.providers, provider),
                  })
                }
              />
              <Label
                htmlFor={`filter-provider-${provider}`}
                className="cursor-pointer text-caption font-normal"
              >
                {provider}
              </Label>
            </div>
          ))}
        </div>
        <p className="mt-1 text-caption text-text-tertiary">Empty = all providers shown.</p>
      </div>

      <div>
        <p className="mb-2 text-caption font-semibold text-text-secondary">Neighbourhood</p>
        <div className="flex max-h-40 flex-col gap-2 overflow-y-auto pr-1">
          {ACCRA_NEIGHBOURHOODS.map((area) => (
            <div key={area.name} className="flex items-center gap-2.5">
              <Checkbox
                id={`filter-area-${area.name}`}
                checked={filters.neighbourhoods.has(area.name)}
                onCheckedChange={() =>
                  onFiltersChange({
                    ...filters,
                    neighbourhoods: toggleInSet(filters.neighbourhoods, area.name),
                  })
                }
              />
              <Label
                htmlFor={`filter-area-${area.name}`}
                className="cursor-pointer text-caption font-normal"
              >
                {area.name}
              </Label>
            </div>
          ))}
        </div>
        <p className="mt-1 text-caption text-text-tertiary">Empty = all neighbourhoods shown.</p>
      </div>

      <div>
        <p className="mb-2 text-caption font-semibold text-text-secondary">Layer</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="filter-layer-existing"
              checked={activeLayers['existing-nodes']}
              onCheckedChange={() =>
                setLayerVisibility('existing-nodes', !activeLayers['existing-nodes'])
              }
            />
            <Label htmlFor="filter-layer-existing" className="cursor-pointer font-normal">
              Show existing nodes on map
            </Label>
          </div>
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="filter-layer-candidate"
              checked={activeLayers['candidate-nodes']}
              onCheckedChange={() =>
                setLayerVisibility('candidate-nodes', !activeLayers['candidate-nodes'])
              }
            />
            <Label htmlFor="filter-layer-candidate" className="cursor-pointer font-normal">
              Show candidate nodes on map
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}
