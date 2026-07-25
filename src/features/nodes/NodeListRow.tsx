import type { CSSProperties } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/forms/Checkbox'
import { Icon, MapPin, Route, Building2 } from '@/components/icons'
import { formatPercent, formatDistance, formatRelativeTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { NODE_STATUS_TONE, type CombinedNode } from './types'

/**
 * Purpose
 * -------
 * A single row in NodeList. Deliberately a compact two-line card rather
 * than a rigid 8-column table — at the sidebar's ~320px width, a literal
 * table with Name/Type/Status/Coverage/Accessibility/Distance/
 * Updated/Provider columns would be unreadably cramped. All eight data
 * points are still present, just arranged for scannability.
 *
 * Props
 * -----
 * - node: CombinedNode
 * - isSelected / isHovered / isFocused / isMultiSelected: visual states
 * - onSelect / onHover / onDoubleClick / onContextMenu / onToggleMultiSelect
 * - style: React.CSSProperties — required by @tanstack/react-virtual for
 *   absolute positioning
 *
 * Example usage
 * -------------
 * Rendered by NodeList for each virtualized row; not typically used
 * standalone.
 *
 * Accessibility
 * -------------
 * `role="option"` with `aria-selected`; the checkbox has its own
 * accessible label derived from the node name.
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
export interface NodeListRowProps {
  node: CombinedNode
  isSelected: boolean
  isHovered: boolean
  isFocused: boolean
  isMultiSelected: boolean
  style: CSSProperties
  onSelect: () => void
  onHover: (hovered: boolean) => void
  onDoubleClick: () => void
  onContextMenu: (event: { clientX: number; clientY: number }) => void
  onToggleMultiSelect: () => void
}

const statusTone = NODE_STATUS_TONE

export function NodeListRow({
  node,
  isSelected,
  isHovered,
  isFocused,
  isMultiSelected,
  style,
  onSelect,
  onHover,
  onDoubleClick,
  onContextMenu,
  onToggleMultiSelect,
}: NodeListRowProps) {
  return (
    <div
      style={style}
      role="option"
      aria-selected={isSelected}
      tabIndex={isFocused ? 0 : -1}
      data-node-row-id={node.id}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onContextMenu={(event) => {
        event.preventDefault()
        onContextMenu({ clientX: event.clientX, clientY: event.clientY })
      }}
      className={cn(
        'absolute left-0 top-0 flex w-full cursor-pointer gap-2.5 border-b border-border px-3 py-2.5 outline-none',
        isSelected && 'bg-primary-50 dark:bg-primary-950/40',
        !isSelected && isHovered && 'bg-surface-secondary',
        isFocused && 'ring-1 ring-inset ring-primary-400'
      )}
    >
      <div className="pt-0.5" onClick={(event) => event.stopPropagation()}>
        <Checkbox
          checked={isMultiSelected}
          onCheckedChange={onToggleMultiSelect}
          aria-label={`Select ${node.name}`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-small font-medium text-text-primary">{node.name}</span>
          <Badge
            tone={node.kind === 'existing' ? 'primary' : 'info'}
            size="sm"
            className="shrink-0"
          >
            {node.kind === 'existing' ? 'Existing' : 'Candidate'}
          </Badge>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-caption text-text-tertiary">
          <Badge tone={statusTone[node.status as keyof typeof statusTone] ?? 'neutral'} size="sm">
            {node.status.replace('-', ' ')}
          </Badge>
          <span>
            {node.primaryScoreLabel} {formatPercent(node.primaryScore)}
          </span>
          <span>Access. {formatPercent(node.accessibilityScore)}</span>
          <span className="inline-flex items-center gap-1">
            <Icon icon={Route} size={11} />
            {formatDistance(node.nearestRoadDistanceMeters)}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-2.5 text-caption text-text-tertiary">
          <span className="inline-flex items-center gap-1 truncate">
            <Icon icon={Building2} size={11} />
            {node.provider}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon icon={MapPin} size={11} />
            {formatRelativeTime(node.lastUpdated)}
          </span>
        </div>
      </div>
    </div>
  )
}
