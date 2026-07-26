/**
 * Purely illustrative platform/system alerts for the Dashboard's Alerts
 * panel (Phase 7, Step 9) — things like a layer sync hiccup that have no
 * corresponding real signal anywhere in nodeStore/mapStore/analysis yet.
 *
 * This is deliberately separate from the data-driven alerts that
 * `buildDashboardAlerts` (features/dashboard/selectors.ts) derives from
 * real coverage-gap and candidate-approval data — mixing the two here
 * would make it look like every alert is backed by live state when only
 * some are.
 *
 * Future backend integration
 * ---------------------------
 * Real system/ops alerts (sync failures, job errors) would come from a
 * backend job-monitoring endpoint once one exists; this file goes away
 * entirely at that point rather than being "replaced."
 */
export type SystemAlertSeverity = 'critical' | 'warning' | 'info'

export interface SystemAlert {
  id: string
  severity: SystemAlertSeverity
  title: string
  description: string
  timestamp: string
}

export const MOCK_SYSTEM_ALERTS: SystemAlert[] = [
  {
    id: 'system-alert-1',
    severity: 'warning',
    title: 'Layer synchronization issue',
    description: 'Population Density layer took longer than expected to refresh on last load.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
]
