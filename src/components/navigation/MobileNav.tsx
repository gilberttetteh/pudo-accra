import { NavLink } from 'react-router-dom'
import { Drawer } from '@/components/layout/Drawer'
import { NAV_ITEMS } from '@/constants/navigation'
import { Icon } from '@/components/icons'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The mobile/tablet equivalent of Sidebar — the same nav items rendered
 * inside a Drawer, triggered from TopNav's hamburger button below the
 * `lg` breakpoint. Kept as a separate component (rather than making
 * Sidebar itself responsive) because the two have fundamentally
 * different interaction models: persistent rail vs. dismissible overlay.
 *
 * Props
 * -----
 * - open / onOpenChange: controlled visibility (Drawer semantics)
 *
 * Example usage
 * -------------
 * <MobileNav open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen} />
 *
 * Accessibility
 * -------------
 * Inherits Drawer's focus-trap and Escape-to-close behavior; nav items
 * close the drawer on selection so focus doesn't get stranded off-screen.
 *
 * Future extension
 * -----------------
 * None anticipated — should stay in sync with Sidebar's NAV_ITEMS source.
 */
export interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Menu" side="left" width="sm">
      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <NavLink
              to={item.href}
              end={item.href === '/'}
              onClick={() => onOpenChange(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-2.5 py-2.5 text-body font-medium transition-colors duration-(--duration-fast)',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                    : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                )
              }
            >
              <Icon icon={item.icon} size={18} />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </Drawer>
  )
}
