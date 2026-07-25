import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Minimal footer for PublicLayout (and optionally AuthLayout) — copyright
 * and a couple of placeholder links. Not shown in DashboardLayout, which
 * is a dense, map-first working surface where footer chrome would just
 * eat vertical space.
 *
 * Props
 * -----
 * None currently — static content. Accepts `className` for spacing overrides.
 *
 * Example usage
 * -------------
 * <Footer />
 *
 * Accessibility
 * -------------
 * Wrapped in `<footer>` landmark; links are real <a> tags (placeholder
 * hrefs until legal/help pages exist).
 *
 * Future extension
 * -----------------
 * Wire real links once Privacy/Terms/Help pages exist; add a language
 * selector if multi-city/multi-locale support (per ARCHITECTURE.md's
 * long-term vision) is prioritized.
 */
export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn('border-t border-border bg-surface px-6 py-6', className)}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-caption text-text-tertiary sm:flex-row">
        <span>© {new Date().getFullYear()} Accra PUDO Network Planning System.</span>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-text-secondary">
            Privacy
          </a>
          <a href="#" className="hover:text-text-secondary">
            Terms
          </a>
          <a href="#" className="hover:text-text-secondary">
            Help
          </a>
        </div>
      </div>
    </footer>
  )
}
