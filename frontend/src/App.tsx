import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { LoadingState } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Compass } from '@/components/icons'
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

/** Sections the sidebar links to that have no page behind them yet. Listed
 *  explicitly rather than caught by a wildcard so a genuinely bad URL still
 *  redirects home, instead of silently claiming to be an unbuilt feature. */
const UNBUILT_SECTIONS = ['/coverage', '/nodes', '/analytics', '/reports', '/settings']

function UnbuiltSection({ label }: { label: string }) {
  return (
    <EmptyState
      icon={Compass}
      title={`${label} isn't built yet`}
      description="The Dashboard and Map Workspace are the two working sections. This one is scaffolded in the navigation but has no page behind it."
    />
  )
}

/**
 * Root application component.
 *
 * Routes are deliberately minimal: `/` and `/map` are the two sections that
 * actually exist, and the remaining sidebar links resolve to an explicit
 * "not built yet" state. Before this, BrowserRouter was mounted with no
 * <Routes> at all, so every nav link changed the URL and rendered nothing
 * new — which reads as a broken app rather than an unfinished one.
 *
 * Note for static hosting: these are real browser paths, so the host must
 * serve index.html for unknown paths or a refresh on /map will 404. See the
 * SPA fallback config in the deployment setup.
 */
function App() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const current = NAV_ITEMS.find((item) => item.href === pathname)
  const breadcrumbItems: BreadcrumbItem[] =
    pathname === '/'
      ? [{ label: 'Dashboard' }]
      : [{ label: 'Dashboard', href: '/' }, { label: current?.label ?? 'Not found' }]

  return (
    <DashboardLayout notifications={PREVIEW_NOTIFICATIONS} breadcrumbItems={breadcrumbItems}>
      <Suspense fallback={<LoadingState message="Loading…" fullHeight />}>
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                onOpenMapWorkspace={() => navigate('/map')}
                onInspectNodes={() => navigate('/map')}
              />
            }
          />
          <Route path="/map" element={<MapWorkspace />} />
          {UNBUILT_SECTIONS.map((href) => (
            <Route
              key={href}
              path={href}
              element={
                <UnbuiltSection
                  label={NAV_ITEMS.find((item) => item.href === href)?.label ?? 'This section'}
                />
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </DashboardLayout>
  )
}

export default App
