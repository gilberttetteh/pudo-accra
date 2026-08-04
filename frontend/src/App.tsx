
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { LoadingState } from '@/components/feedback/LoadingState'
import { NAV_ITEMS } from '@/constants/navigation'
import type { NotificationItem } from '@/components/navigation/NotificationCenter'
import type { BreadcrumbItem } from '@/components/navigation/Breadcrumb'

// The Map Workspace pulls in Leaflet + react-leaflet, which is the
// single largest dependency in the bundle. Lazy-loading it means the
// shell (Sidebar/TopNav/CommandPalette) paints immediately and the map
// chunk streams in behind a loading state, rather than blocking on it.
const MapWorkspace = lazy(() =>
  import('@/features/map').then((mod) => ({ default: mod.MapWorkspace }))
)

const DashboardPage = lazy(() =>
  import('@/features/dashboard').then((mod) => ({ default: mod.DashboardPage }))
)

const AnalyticsPage = lazy(() =>
  import('@/features/analytics').then((mod) => ({ default: mod.AnalyticsPage }))
)

const ReportsPage = lazy(() =>
  import('@/features/reports').then((mod) => ({ default: mod.ReportsPage }))
)

// Static preview data for the shell smoke-test below. Computed once at
// module load (not during render) to keep App a pure function of props.
const PREVIEW_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Isochrone generation complete',
    description: '12 candidate nodes scored in Osu district',
    tone: 'success',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: '3 candidate nodes need review',
    tone: 'warning',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
]

/**
 * Root application component.
 *
 * Real routing (react-router-dom), replacing the earlier local `view`
 * toggle now that every page it stood in for (Dashboard, Map, Analytics)
 * exists. `main.tsx` already mounts <BrowserRouter> and Sidebar/MobileNav
 * already use real <NavLink to={href}> from constants/navigation.ts's
 * NAV_ITEMS — this file is what was missing to make those links actually
 * navigate. Breadcrumbs are derived from the matched NAV_ITEMS entry so
 * each route doesn't have to hand-write its own crumb trail.
 *
 * /coverage and /nodes both render MapWorkspace (Coverage and Nodes are
 * tabs inside its shared sidebar panel, not separate pages) with a
 * different `initialSidebarTab` so each nav link opens the tab it's
 * named for. /reports is the real Phase 9 Reports workspace. There is
 * no Settings entry — it was removed from NAV_ITEMS entirely rather
 * than left as a placeholder; any stray /settings link now falls
 * through to the catch-all redirect below.
 */
function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const activeNavItem = NAV_ITEMS.find((item) => item.href === location.pathname)
  const breadcrumbItems: BreadcrumbItem[] =
    activeNavItem && activeNavItem.href !== '/'
      ? [{ label: 'Dashboard', href: '/' }, { label: activeNavItem.label }]
      : [{ label: 'Dashboard' }]

  return (
    <DashboardLayout notifications={PREVIEW_NOTIFICATIONS} breadcrumbItems={breadcrumbItems}>
      <Suspense fallback={<LoadingState message="Loading…" fullHeight />}>
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                onOpenMapWorkspace={() => navigate('/map')}
                onInspectNodes={() => navigate('/nodes')}
                onViewAnalytics={() => navigate('/analytics')}
                onOpenReports={() => navigate('/reports')}
              />
            }
          />
          <Route path="/map" element={<MapWorkspace key={location.pathname} />} />
          <Route
            path="/coverage"
            element={<MapWorkspace key={location.pathname} initialSidebarTab="coverage" />}
          />
          <Route
            path="/nodes"
            element={<MapWorkspace key={location.pathname} initialSidebarTab="nodes" />}
          />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </DashboardLayout>
  )
}

export default App


