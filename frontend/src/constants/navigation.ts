import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Map,
  Layers,
  MapPin,
  BarChart3,
  FileText,
  Settings,
} from '@/components/icons'

/**
 * Primary sidebar/mobile-nav item configuration.
 *
 * This is presentation config only (label/href/icon) — not a domain
 * model. `href` values correspond to the routes ARCHITECTURE.md defines
 * for Phase 4; they intentionally don't resolve to anything yet since no
 * <Route> definitions exist. NavLink degrades gracefully (renders, just
 * won't 404 until Router is configured with matching paths).
 */
export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Map', href: '/map', icon: Map },
  { label: 'Coverage', href: '/coverage', icon: Layers },
  { label: 'Nodes', href: '/nodes', icon: MapPin },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
]
