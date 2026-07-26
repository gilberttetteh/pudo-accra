import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { EmptyState } from '@/components/feedback/EmptyState'
import {
  Icon,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Pencil,
  AlertCircle,
  BarChart3,
  Layers,
} from '@/components/icons'
import type { ActivityEvent, ActivityEventType } from '@/mock/activity'

const EVENT_ICON: Record<ActivityEventType, typeof Sparkles> = {
  'candidate-created': Sparkles,
  'candidate-approved': CheckCircle2,
  'candidate-rejected': XCircle,
  'node-updated': Pencil,
  'gap-identified': AlertCircle,
  'coverage-analysis-generated': BarChart3,
  'layer-changed': Layers,
}

const EVENT_TONE: Record<ActivityEventType, string> = {
  'candidate-created': 'text-info-600 bg-info-50 dark:bg-info-950',
  'candidate-approved': 'text-success-600 bg-success-50 dark:bg-success-950',
  'candidate-rejected': 'text-error-600 bg-error-50 dark:bg-error-950',
  'node-updated': 'text-text-secondary bg-surface-tertiary',
  'gap-identified': 'text-warning-600 bg-warning-50 dark:bg-warning-950',
  'coverage-analysis-generated': 'text-primary-600 bg-primary-50 dark:bg-primary-950',
  'layer-changed': 'text-text-secondary bg-surface-tertiary',
}

function formatRelativeTime(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime()
  const hours = Math.round(diffMs / (60 * 60 * 1000))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

/**
 * Purpose
 * -------
 * Mock operational-activity timeline (Step 7). Every event comes from
 * mock/activity.ts, which is explicitly illustrative history (see that
 * file's doc comment) — there is no real audit-log endpoint yet, though
 * the ActivityEvent shape is designed to match the one Phase 10 would
 * introduce.
 *
 * Props
 * -----
 * - events: ActivityEvent[]
 */
export interface DashboardActivityFeedCardProps {
  events: ActivityEvent[]
}

export function DashboardActivityFeedCard({ events }: DashboardActivityFeedCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest changes across the network</CardDescription>
      </CardHeader>

      {events.length === 0 ? (
        <EmptyState icon={Clock} title="No recent activity" />
      ) : (
        <ol className="flex flex-col gap-4">
          {events.slice(0, 10).map((event) => (
            <li key={event.id} className="flex items-start gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${EVENT_TONE[event.type]}`}
              >
                <Icon icon={EVENT_ICON[event.type]} size={14} />
              </span>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-small font-medium text-text-primary">{event.title}</span>
                {event.description && (
                  <span className="text-caption text-text-secondary">{event.description}</span>
                )}
                <span className="text-caption text-text-tertiary">
                  {event.actor} · {formatRelativeTime(event.timestamp)}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}
