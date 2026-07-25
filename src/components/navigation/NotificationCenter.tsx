import { useState } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { IconButton } from '@/components/ui/IconButton'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Bell, Icon, CheckCircle2, AlertTriangle, Info } from '@/components/icons'
import { formatRelativeTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The notification bell in TopNav — opens a panel of recent system
 * notifications (e.g. "Isochrone generation complete", "3 candidate
 * nodes need review"). Uses local component state for read/unread so
 * the panel feels alive; there is no backend/notification service wired
 * up yet (that's Phase 10 — this component's props are already shaped
 * for a real `NotificationService` to slot in later).
 *
 * Props
 * -----
 * - notifications: NotificationItem[] (display-only shape, not the
 *   shared domain `Notification` type from a future domain layer)
 *
 * Example usage
 * -------------
 * <NotificationCenter notifications={mockNotifications} />
 *
 * Accessibility
 * -------------
 * Built on @radix-ui/react-popover; the trigger's unread count is
 * conveyed both visually (Badge) and via `aria-label`.
 *
 * Future extension
 * -----------------
 * Replace local `useState` read-tracking with server state once a real
 * NotificationService/websocket feed exists.
 */
export interface NotificationItem {
  id: string
  title: string
  description?: string
  tone?: 'info' | 'success' | 'warning'
  createdAt: string
  read?: boolean
}

export interface NotificationCenterProps {
  notifications: NotificationItem[]
  className?: string
}

const toneIcon = { info: Info, success: CheckCircle2, warning: AlertTriangle }

export function NotificationCenter({ notifications, className }: NotificationCenterProps) {
  const [readIds, setReadIds] = useState<Set<string>>(
    () => new Set(notifications.filter((item) => item.read).map((item) => item.id))
  )

  const unreadCount = notifications.filter((item) => !readIds.has(item.id)).length

  const markAllRead = () => setReadIds(new Set(notifications.map((item) => item.id)))
  const markRead = (id: string) => setReadIds((current) => new Set(current).add(id))

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <span className={cn('relative inline-flex', className)}>
          <IconButton
            icon={Bell}
            label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            variant="ghost"
          />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-semibold leading-none text-white">
              {unreadCount}
            </span>
          )}
        </span>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 rounded-lg border border-border bg-surface shadow-lg outline-none"
        >
          <div className="flex items-center justify-between border-b border-border p-3">
            <p className="text-small font-semibold text-text-primary">Notifications</p>
            {unreadCount > 0 && (
              <Button variant="link" size="sm" onClick={markAllRead}>
                Mark all read
              </Button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <EmptyState title="No notifications" description="You're all caught up." />
            ) : (
              <ul>
                {notifications.map((item) => {
                  const isRead = readIds.has(item.id)
                  const tone = item.tone ?? 'info'
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => markRead(item.id)}
                        className={cn(
                          'flex w-full items-start gap-2.5 border-b border-border px-3 py-3 text-left last:border-0 hover:bg-surface-secondary',
                          !isRead && 'bg-primary-50/50 dark:bg-primary-950/30'
                        )}
                      >
                        <Icon
                          icon={toneIcon[tone]}
                          size={16}
                          className={cn(
                            'mt-0.5 shrink-0',
                            tone === 'success' && 'text-success-600',
                            tone === 'warning' && 'text-warning-600',
                            tone === 'info' && 'text-info-600'
                          )}
                        />
                        <span className="flex-1 space-y-0.5">
                          <span className="block text-small font-medium text-text-primary">
                            {item.title}
                          </span>
                          {item.description && (
                            <span className="block text-caption text-text-secondary">
                              {item.description}
                            </span>
                          )}
                          <span className="block text-caption text-text-tertiary">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </span>
                        {!isRead && (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
