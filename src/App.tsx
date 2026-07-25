import { lazy, Suspense } from 'react'
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
 * currently previews DashboardLayout + the Map Workspace end-to-end so
 * the GIS foundation can be smoke-tested visually. MapWorkspace is
 * lazy-loaded (see above) as the first step of eventual route-level
 * code-splitting once real routing exists.
 */
function App() {
  return (
    <DashboardLayout
      notifications={PREVIEW_NOTIFICATIONS}
      breadcrumbItems={[{ label: 'Dashboard', href: '/' }, { label: 'Map' }]}
    >
      <Suspense fallback={<LoadingState message="Loading map workspace…" fullHeight />}>
        <MapWorkspace />
      </Suspense>
    </DashboardLayout>
  )
}

export default App
