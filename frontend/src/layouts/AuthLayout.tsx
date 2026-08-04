import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Card } from '@/components/ui/Card'

/**
 * Purpose
 * -------
 * Minimal, centered layout for authentication flows (login, register,
 * forgot password). No sidebar, no top nav — just a centered card so
 * the form is the sole focus, with the theme toggle available for
 * users arriving in dark environments before they've even logged in.
 *
 * Props
 * -----
 * - children?: ReactNode — falls back to <Outlet /> for Router usage
 *
 * Example usage
 * -------------
 * <AuthLayout><LoginForm /></AuthLayout>
 *
 * Accessibility
 * -------------
 * Content wrapped in `<main>`; the Card itself provides sufficient
 * contrast/structure for form content supplied by the page.
 *
 * Future extension
 * -----------------
 * Add a background illustration/map-pattern once brand design supplies one.
 */
export interface AuthLayoutProps {
  children?: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 bg-surface-secondary px-4 py-12">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <Logo size="md" />

      <main className="w-full max-w-[24rem]">
        <Card className="shadow-lg">{children ?? <Outlet />}</Card>
      </main>
    </div>
  )
}


