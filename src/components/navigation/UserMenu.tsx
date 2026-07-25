import { Avatar } from '@/components/ui/Avatar'
import { DropdownMenu } from '@/components/navigation/DropdownMenu'
import { User, Settings, LogOut } from '@/components/icons'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The account menu in TopNav — avatar trigger + dropdown with Profile /
 * Settings / Log out. Actions are wired to no-op callbacks for now
 * (auth doesn't exist until the backend integration phase); the shape
 * is ready to receive real handlers without changing the component API.
 *
 * Props
 * -----
 * - user: { name: string; role?: string; avatarUrl?: string } — a
 *   display-only shape local to this component, not a shared domain
 *   model (Phase 2.5's domain layer will supersede this if/when built)
 * - onProfile? / onSettings? / onLogout?: () => void
 *
 * Example usage
 * -------------
 * <UserMenu user={{ name: 'Ama Owusu', role: 'GIS Analyst' }} onLogout={handleLogout} />
 *
 * Accessibility
 * -------------
 * Built on the DropdownMenu component (Radix-backed) — full keyboard
 * navigation and correct `role="menu"` semantics.
 *
 * Future extension
 * -----------------
 * Replace the local `user` shape with the real `User` domain type once
 * the domain/auth layer is built, and wire onLogout to the real AuthService.
 */
export interface UserMenuUser {
  name: string
  role?: string
  avatarUrl?: string
}

export interface UserMenuProps {
  user: UserMenuUser
  onProfile?: () => void
  onSettings?: () => void
  onLogout?: () => void
  className?: string
}

export function UserMenu({ user, onProfile, onSettings, onLogout, className }: UserMenuProps) {
  return (
    <DropdownMenu
      align="end"
      trigger={
        <button
          type="button"
          className={cn(
            'flex items-center gap-2 rounded-md p-1 transition-colors duration-(--duration-fast) hover:bg-surface-secondary',
            className
          )}
        >
          <Avatar name={user.name} src={user.avatarUrl} size="sm" />
          <span className="hidden text-left sm:flex sm:flex-col">
            <span className="text-small font-medium leading-tight text-text-primary">
              {user.name}
            </span>
            {user.role && (
              <span className="text-caption leading-tight text-text-tertiary">{user.role}</span>
            )}
          </span>
        </button>
      }
      items={[
        { label: 'Profile', icon: User, onSelect: onProfile },
        { label: 'Settings', icon: Settings, onSelect: onSettings },
        { label: '', divider: true },
        { label: 'Log out', icon: LogOut, onSelect: onLogout, destructive: true },
      ]}
    />
  )
}
