import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/navigation/Tooltip'
import {
  Map,
  Plus,
  RefreshCw,
  AlertCircle,
  ClipboardList,
  SlidersHorizontal,
  FileText,
  BarChart3,
} from '@/components/icons'

/**
 * Purpose
 * -------
 * Shortcut grid (Step 8). Each action either dispatches a real handler
 * the parent wires up (most of them just call into existing store
 * actions/callbacks — nothing new is invented) or, for "Generate
 * Report," navigates to the real Reports workspace now that Phase 9 is
 * built (this was a disabled "Coming in Phase 9" placeholder before).
 * There is no Settings action — the app has no Settings page.
 *
 * Props
 * -----
 * All handlers are optional so this card can render standalone before
 * DashboardPage wires real navigation/store actions in (isolation
 * build) — each falls back to doing nothing rather than throwing.
 */
export interface DashboardQuickActionsCardProps {
  onOpenMapWorkspace?: () => void
  onCreateCandidate?: () => void
  onRunCoverageAnalysis?: () => void
  onViewCoverageGaps?: () => void
  onInspectNodes?: () => void
  onManageLayers?: () => void
  onOpenReports?: () => void
  onViewAnalytics?: () => void
}

interface QuickAction {
  key: string
  label: string
  icon: typeof Map
  onClick?: () => void
  disabled?: boolean
  tooltip?: string
}

export function DashboardQuickActionsCard({
  onOpenMapWorkspace,
  onCreateCandidate,
  onRunCoverageAnalysis,
  onViewCoverageGaps,
  onInspectNodes,
  onManageLayers,
  onOpenReports,
  onViewAnalytics,
}: DashboardQuickActionsCardProps) {
  const actions: QuickAction[] = [
    { key: 'open-map', label: 'Open Map Workspace', icon: Map, onClick: onOpenMapWorkspace },
    { key: 'create-candidate', label: 'Create Candidate', icon: Plus, onClick: onCreateCandidate },
    {
      key: 'run-coverage',
      label: 'Run Coverage Analysis',
      icon: RefreshCw,
      onClick: onRunCoverageAnalysis,
    },
    { key: 'view-analytics', label: 'View Analytics', icon: BarChart3, onClick: onViewAnalytics },
    {
      key: 'view-gaps',
      label: 'View Coverage Gaps',
      icon: AlertCircle,
      onClick: onViewCoverageGaps,
    },
    { key: 'inspect-nodes', label: 'Inspect Nodes', icon: ClipboardList, onClick: onInspectNodes },
    {
      key: 'manage-layers',
      label: 'Manage Layers',
      icon: SlidersHorizontal,
      onClick: onManageLayers,
    },
    {
      key: 'generate-report',
      label: 'Generate Report',
      icon: FileText,
      onClick: onOpenReports,
    },
  ]

  return (
    <Card className="flex flex-col gap-4">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common planner tasks</CardDescription>
      </CardHeader>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {actions.map((action) => {
          const button = (
            <Button
              key={action.key}
              variant="outline"
              size="sm"
              leftIcon={action.icon}
              disabled={action.disabled}
              onClick={action.onClick}
              className="w-full justify-start"
            >
              {action.label}
            </Button>
          )
          return action.tooltip ? (
            <Tooltip key={action.key} content={action.tooltip}>
              <span>{button}</span>
            </Tooltip>
          ) : (
            button
          )
        })}
      </div>
    </Card>
  )
}


