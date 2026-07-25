import type { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { Icon, CheckCircle2, AlertTriangle, XCircle, Info } from '@/components/icons'

/**
 * Purpose
 * -------
 * Inline, persistent (non-dismissing-by-default) status message for
 * form validation summaries, page-level warnings ("Backend unreachable"),
 * and confirmations. For transient notifications, use Toast instead.
 *
 * Props
 * -----
 * - tone: 'info' | 'success' | 'warning' | 'error'
 * - title?: string
 * - children: ReactNode — description/body
 * - onDismiss?: () => void — renders a close button when provided
 *
 * Example usage
 * -------------
 * <Alert tone="error" title="Failed to load coverage data">
 *   Check your connection and try again.
 * </Alert>
 *
 * Accessibility
 * -------------
 * `role="alert"` for error/warning tones (assertive live region);
 * `role="status"` for info/success (polite).
 *
 * Future extension
 * -----------------
 * None anticipated.
 */
const alertVariants = cva('flex gap-3 rounded-lg border p-4', {
  variants: {
    tone: {
      info: 'border-info-200 bg-info-50 text-info-800 dark:border-info-900 dark:bg-info-950 dark:text-info-200',
      success:
        'border-success-200 bg-success-50 text-success-800 dark:border-success-900 dark:bg-success-950 dark:text-success-200',
      warning:
        'border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-900 dark:bg-warning-950 dark:text-warning-200',
      error:
        'border-error-200 bg-error-50 text-error-800 dark:border-error-900 dark:bg-error-950 dark:text-error-200',
    },
  },
  defaultVariants: { tone: 'info' },
})

const toneIcon = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle }

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>, VariantProps<typeof alertVariants> {
  title?: string
  children?: ReactNode
  onDismiss?: () => void
}

export function Alert({
  className,
  tone = 'info',
  title,
  children,
  onDismiss,
  ...props
}: AlertProps) {
  const resolvedTone = tone ?? 'info'
  return (
    <div
      role={resolvedTone === 'error' || resolvedTone === 'warning' ? 'alert' : 'status'}
      className={cn(alertVariants({ tone }), className)}
      {...props}
    >
      <Icon icon={toneIcon[resolvedTone]} size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1 space-y-1">
        {title && <p className="text-body font-semibold">{title}</p>}
        {children && <div className="text-small">{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="text-current opacity-60 hover:opacity-100"
        >
          <Icon icon={XCircle} size={16} />
        </button>
      )}
    </div>
  )
}
