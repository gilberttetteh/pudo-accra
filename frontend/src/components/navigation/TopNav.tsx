import type { ReactNode } from 'react'
import { IconButton } from '@/components/ui/IconButton'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { UserMenu, type UserMenuUser } from '@/components/navigation/UserMenu'
import {
  NotificationCenter,
  type NotificationItem,
} from '@/components/navigation/NotificationCenter'
import { GlobalSearchTrigger } from '@/components/navigation/GlobalSearchTrigger'
import { Menu, Search } from '@/components/icons'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The dashboard's top bar: mobile menu trigger, a breadcrumb/title slot
 * (content supplied by the page via `left`), global search launcher,
 * notifications, theme toggle, and user menu. DashboardLayout is the
 * only consumer — kept as its own component so the shell composition
 * stays readable.
 *
 * Props
 * -----
 * - left: ReactNode — typically a Breadcrumb, rendered next to the
 *   mobile menu button
 * - user: UserMenuUser
 * - notifications: NotificationItem[]
 * - onOpenMobileNav: () => void
 * - onOpenSearch: () => void — opens CommandPalette
 *
 * Example usage
 * -------------
 * <TopNav
 *   left={<Breadcrumb items={[{ label: 'Dashboard' }]} />}
 *   user={currentUser}
 *   notifications={mockNotifications}
 *   onOpenMobileNav={() => setMobileNavOpen(true)}
 *   onOpenSearch={() => setPaletteOpen(true)}
 * />
 *
 * Accessibility
 * -------------
 * Landmark `<header>`; mobile menu button has an explicit label via
 * IconButton. Search trigger is a real button (see GlobalSearchTrigger).
 *
 * Future extension
 * -----------------
 * None anticipated beyond what sub-components already note.
 */
export interface TopNavProps {
  left?: ReactNode
  user: UserMenuUser
  notifications: NotificationItem[]
  onOpenMobileNav: () => void
  onOpenSearch: () => void
  className?: string
}

export function TopNav({
  left,
  user,
  notifications,
  onOpenMobileNav,
  onOpenSearch,
  className,
}: TopNavProps) {
  return (
    <header
      className={cn(
        'flex h-14 items-center gap-3 border-b border-border bg-surface px-4',
        className
      )}
    >
      <IconButton
        icon={Menu}
        label="Open menu"
        variant="ghost"
        size="sm"
        onClick={onOpenMobileNav}
        className="lg:hidden"
      />

      {left && <div className="hidden lg:block">{left}</div>}

      <div className="ml-auto flex flex-1 items-center justify-end gap-2 sm:flex-initial">
        <div className="hidden min-w-0 flex-1 sm:block">
          <GlobalSearchTrigger onClick={onOpenSearch} />
        </div>
        <IconButton
          icon={Search}
          label="Search"
          variant="ghost"
          size="sm"
          onClick={onOpenSearch}
          className="sm:hidden"
        />

        <NotificationCenter notifications={notifications} />
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  )
}


