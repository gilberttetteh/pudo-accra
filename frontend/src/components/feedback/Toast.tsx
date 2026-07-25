import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { cn } from '@/utils/cn'
import { Icon, CheckCircle2, AlertTriangle, XCircle, Info, X } from '@/components/icons'

/**
 * Purpose
 * -------
 * Transient, auto-dismissing notifications ("Node saved", "Export
 * failed") for async action feedback. For persistent inline messages,
 * use Alert instead.
 *
 * Usage
 * -----
 * Wrap the app once (done in Phase 3's shell) with <ToastProvider>, then
 * anywhere in the tree:
 *
 *   const { showToast } = useToast()
 *   showToast({ tone: 'success', title: 'Node saved' })
 *
 * Variants
 * --------
 * tone: 'info' | 'success' | 'warning' | 'error'
 *
 * Accessibility
 * -------------
 * Built on @radix-ui/react-toast, which manages focus, live-region
 * politeness, and swipe-to-dismiss/keyboard dismissal per the WAI-ARIA
 * pattern out of the box.
 *
 * Future extension
 * -----------------
 * Add an `action` slot (e.g. "Undo") once a flow needs it.
 */
export type ToastTone = 'info' | 'success' | 'warning' | 'error'

interface ToastOptions {
  title: string
  description?: string
  tone?: ToastTone
  durationMs?: number
}

interface ActiveToast extends ToastOptions {
  id: string
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toneIcon = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle }
const toneClass: Record<ToastTone, string> = {
  info: 'border-info-200 text-info-800 dark:border-info-900 dark:text-info-200',
  success: 'border-success-200 text-success-800 dark:border-success-900 dark:text-success-200',
  warning: 'border-warning-200 text-warning-800 dark:border-warning-900 dark:text-warning-200',
  error: 'border-error-200 text-error-800 dark:border-error-900 dark:text-error-200',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ActiveToast[]>([])

  const showToast = useCallback((options: ToastOptions) => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, tone: 'info', durationMs: 5000, ...options }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((toast) => {
          const tone = toast.tone ?? 'info'
          return (
            <ToastPrimitive.Root
              key={toast.id}
              duration={toast.durationMs}
              onOpenChange={(open) => !open && removeToast(toast.id)}
              className={cn(
                'flex items-start gap-3 rounded-lg border bg-surface p-4 shadow-floating',
                'transition-all duration-(--duration-base) ease-(--ease-standard)',
                'data-[state=open]:translate-y-0 data-[state=open]:opacity-100',
                'data-[state=closed]:translate-y-2 data-[state=closed]:opacity-0',
                toneClass[tone]
              )}
            >
              <Icon icon={toneIcon[tone]} size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <ToastPrimitive.Title className="text-body font-semibold text-text-primary">
                  {toast.title}
                </ToastPrimitive.Title>
                {toast.description && (
                  <ToastPrimitive.Description className="mt-0.5 text-small text-text-secondary">
                    {toast.description}
                  </ToastPrimitive.Description>
                )}
              </div>
              <ToastPrimitive.Close
                aria-label="Dismiss notification"
                className="text-text-tertiary hover:text-text-primary"
              >
                <Icon icon={X} size={14} />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          )
        })}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-50 flex w-96 max-w-[100vw] flex-col gap-2 p-6 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}
