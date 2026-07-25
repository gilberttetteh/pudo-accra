import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/constants/navigation'
import { Logo } from '@/components/ui/Logo'
import { IconButton } from '@/components/ui/IconButton'
import { Tooltip } from '@/components/navigation/Tooltip'
import { Icon, PanelLeft, PanelLeftClose } from '@/components/icons'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The primary desktop navigation rail for the Dashboard shell. Supports
 * a collapsed (icon-only) state to maximize map/content real estate —
 * important for a map-first GIS product. Hidden below the `lg` breakpoint
 * in favor of MobileNav (a Drawer), which DashboardLayout renders instead.
 *
 * Props
 * -----
 * - collapsed: boolean (controlled — DashboardLayout owns/persists this)
 * - onToggleCollapsed: () => void
 *
 * Example usage
 * -------------
 * <Sidebar collapsed={isCollapsed} onToggleCollapsed={toggleCollapsed} />
 *
 * Accessibility
 * -------------
 * Wrapped in `<nav aria-label="Primary">`; active route uses NavLink's
 * built-in `aria-current="page"`. Collapsed-state icons are wrapped in
 * Tooltip so their meaning isn't lost visually, while the underlying
 * link still carries a real text label for screen readers.
 *
 * Future extension
 * -----------------
 * Add role-based item filtering once auth/permissions (Phase 2.5 domain
 * layer, when built) determine which nav items a given user can see.
 */
export interface SidebarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
  className?: string
}

export function Sidebar({ collapsed, onToggleCollapsed, className }: SidebarProps) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        'flex h-full flex-col border-r border-border bg-surface transition-[width] duration-(--duration-base) ease-(--ease-standard)',
        collapsed ? 'w-16' : 'w-60',
        className
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center border-b border-border',
          collapsed ? 'justify-center px-0' : 'px-4'
        )}
      >
        <Logo collapsed={collapsed} />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const linkContent = (
              <NavLink
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-2.5 py-2 text-small font-medium transition-colors duration-(--duration-fast)',
                    collapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                      : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                  )
                }
              >
                <Icon icon={item.icon} size={17} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            )

            return (
              <li key={item.href}>
                {collapsed ? (
                  <Tooltip content={item.label} side="right">
                    {linkContent}
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <div
        className={cn(
          'border-t border-border p-2',
          collapsed ? 'flex justify-center' : 'flex justify-end'
        )}
      >
        <IconButton
          icon={collapsed ? PanelLeft : PanelLeftClose}
          label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          variant="ghost"
          size="sm"
          onClick={onToggleCollapsed}
        />
      </div>
    </nav>
  )
}
