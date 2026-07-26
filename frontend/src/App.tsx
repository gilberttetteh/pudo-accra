import { lazy, Suspense, useState } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { LoadingState } from '@/components/feedback/LoadingState'
import type { NotificationItem } from '@/components/navigation/NotificationCenter'

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

/**
 * Root application component.
 *
 * Still a placeholder — real routing arrives in a future phase. This
 * currently previews DashboardLayout + the Dashboard/Map Workspace
 * end-to-end so both can be smoke-tested visually. A local `view` toggle
 * stands in for real routing until that exists — MapWorkspace and
 * DashboardPage are both lazy-loaded as the first step of eventual
 * route-level code-splitting.
 */
function App() {
  const [view, setView] = useState<'dashboard' | 'map'>('dashboard')

  return (
    <DashboardLayout
      notifications={PREVIEW_NOTIFICATIONS}
      breadcrumbItems={[{ label: 'Dashboard', href: '/' }, { label: 'Map' }]}
    >
      <Suspense fallback={<LoadingState message="Loading…" fullHeight />}>
        {view === 'dashboard' ? (
          <DashboardPage onOpenMapWorkspace={() => setView('map')} />
        ) : (
          <MapWorkspace />
        )}
      </Suspense>
    </DashboardLayout>
  )
}

export default App