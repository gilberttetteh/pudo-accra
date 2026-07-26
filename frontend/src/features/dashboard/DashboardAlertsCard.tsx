import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Alert } from '@/components/feedback/Alert'
import { EmptyState } from '@/components/feedback/EmptyState'
import { CheckCircle2 } from '@/components/icons'
import type { DashboardAlert } from './selectors'

const SEVERITY_TONE = { critical: 'error', warning: 'warning', info: 'info' } as const

/**
 * Purpose
 * -------
 * Alerts panel (Step 9). Most alerts are derived from live coverage-gap
 * and candidate data by `buildDashboardAlerts`
 * (dashboard/selectors.ts) — a couple are illustrative system alerts
 * from mock/systemAlerts.ts (see that file's doc comment on why the two
 * are kept separate). Dismissal is component-local UI state only; it
 * does not mutate the underlying gap/candidate record, so a dismissed
 * alert can reappear on next load if the condition still holds — that's
 * intentional for real, data-derived alerts.
 *
 * Props
 * -----
 * - alerts: DashboardAlert[]
 * - onViewDetails?: (alert: DashboardAlert) => void
 */
export interface DashboardAlertsCardProps {
  alerts: DashboardAlert[]
  onViewDetails?: (alert: DashboardAlert) => void
}

export function DashboardAlertsCard({ alerts, onViewDetails }: DashboardAlertsCardProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const visibleAlerts = alerts.filter((alert) => !dismissedIds.has(alert.id))

  return (
    <Card className="flex flex-col gap-4">
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
        <CardDescription>Items that may need planner attention</CardDescription>
      </CardHeader>

      {visibleAlerts.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="No active alerts" description="Everything looks normal." />
      ) : (
        <div className="flex flex-col gap-3">
          {visibleAlerts.map((alert) => (
            <Alert
              key={alert.id}
              tone={SEVERITY_TONE[alert.severity]}
              title={alert.title}
              onDismiss={() => setDismissedIds((current) => new Set(current).add(alert.id))}
            >
              <div className="flex flex-col gap-2">
                <span>{alert.description}</span>
                {onViewDetails && (
                  <button
                    type="button"
                    onClick={() => onViewDetails(alert)}
                    className="w-fit text-caption font-medium underline decoration-dotted underline-offset-2"
                  >
                    View details
                  </button>
                )}
              </div>
            </Alert>
          ))}
        </div>
      )}
    </Card>
  )
}
