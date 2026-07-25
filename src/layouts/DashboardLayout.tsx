import { useState } from 'react'
import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { TopNav } from '@/components/navigation/TopNav'
import { CommandPalette } from '@/components/navigation/CommandPalette'
import { Breadcrumb, type BreadcrumbItem } from '@/components/navigation/Breadcrumb'
import type { UserMenuUser } from '@/components/navigation/UserMenu'
import type { NotificationItem } from '@/components/navigation/NotificationCenter'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The authenticated application shell: collapsible Sidebar (desktop) /
 * MobileNav (small viewports), TopNav, a globally-mounted CommandPalette,
 * and a content area. Every dashboard page (Map, Coverage, Nodes,
 * Analytics, Reports, Settings) renders inside this layout once routing
 * exists (Phase 4) — until then, `children` lets it be previewed
 * standalone.
 *
 * Props
 * -----
 * - breadcrumbItems?: BreadcrumbItem[] — supplied by the active page;
 *   defaults to a single "Dashboard" crumb
 * - user?: UserMenuUser — defaults to a placeholder planner account
 * - notifications?: NotificationItem[] — defaults to an empty inbox
 * - children?: ReactNode — falls back to <Outlet /> for Router usage
 *
 * Example usage
 * -------------
 * <DashboardLayout breadcrumbItems={[{ label: 'Dashboard' }]}>
 *   <YourPageContent />
 * </DashboardLayout>
 *
 * Accessibility
 * -------------
 * Composes already-accessible pieces (Sidebar's `nav`, TopNav's
 * `header`, Drawer/Dialog-based MobileNav/CommandPalette); main content
 * is wrapped in a `<main>` landmark.
 *
 * Future extension
 * -----------------
 * Persist sidebar collapse preference server-side per user once auth
 * exists (currently localStorage-only, see the lazy useState initializer
 * below). Replace default `user`/`notifications` with real data once
 * AuthService/NotificationService are implemented.
 */
export interface DashboardLayoutProps {
  breadcrumbItems?: BreadcrumbItem[]
  user?: UserMenuUser
  notifications?: NotificationItem[]
  children?: ReactNode
}

const SIDEBAR_STORAGE_KEY = 'accra-pudo-sidebar-collapsed'

const DEFAULT_USER: UserMenuUser = { name: 'Ama Owusu', role: 'GIS Analyst' }
const DEFAULT_BREADCRUMB: BreadcrumbItem[] = [{ label: 'Dashboard' }]

export function DashboardLayout({
  breadcrumbItems = DEFAULT_BREADCRUMB,
  user = DEFAULT_USER,
  notifications = [],
  children,
}: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  )
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarCollapsed((current) => {
      const next = !current
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggleCollapsed={toggleSidebar}
        className="hidden lg:flex"
      />
      <MobileNav open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen} />

      <div className={cn('flex min-w-0 flex-1 flex-col')}>
        <TopNav
          left={<Breadcrumb items={breadcrumbItems} />}
          user={user}
          notifications={notifications}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onOpenSearch={() => setIsPaletteOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">{children ?? <Outlet />}</main>
      </div>

      <CommandPalette open={isPaletteOpen} onOpenChange={setIsPaletteOpen} />
    </div>
  )
}
