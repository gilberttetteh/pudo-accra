import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { Footer } from '@/components/layout/Footer'

/**
 * Purpose
 * -------
 * Layout for unauthenticated, marketing-style pages (landing page).
 * Simple top bar (logo + theme toggle + sign-in CTA) and a Footer —
 * distinct from AuthLayout (centered card, no marketing chrome) and
 * DashboardLayout (dense, app-focused, no footer).
 *
 * Props
 * -----
 * - children?: ReactNode — falls back to <Outlet /> for Router usage
 *
 * Example usage
 * -------------
 * <PublicLayout><LandingPageContent /></PublicLayout>
 *
 * Accessibility
 * -------------
 * `<header>` and `<footer>` landmarks; content wrapped in `<main>`.
 *
 * Future extension
 * -----------------
 * Wire the "Sign in" button to the real login route once routing
 * (Phase 4) and auth exist.
 */
export interface PublicLayoutProps {
  children?: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="outline" size="sm">
            Sign in
          </Button>
        </div>
      </header>

      <main className="flex-1">{children ?? <Outlet />}</main>

      <Footer />
    </div>
  )
}
