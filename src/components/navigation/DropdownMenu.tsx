import type { ReactNode } from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/utils/cn'
import { Icon, Check } from '@/components/icons'
import type { LucideIcon } from 'lucide-react'

/**
 * Purpose
 * -------
 * Action menu triggered from a button — user menu (profile/settings/
 * logout), table row "..." actions, map layer options.
 *
 * Props
 * -----
 * - trigger: ReactNode
 * - items: DropdownMenuItemConfig[] (supports icon, destructive, divider)
 * - align: 'start' | 'center' | 'end'
 *
 * Example usage
 * -------------
 * <DropdownMenu
 *   trigger={<IconButton icon={MoreVertical} label="Row actions" variant="ghost" />}
 *   items={[
 *     { label: 'Edit', icon: Pencil, onSelect: () => {} },
 *     { label: 'Delete', icon: Trash2, onSelect: () => {}, destructive: true },
 *   ]}
 * />
 *
 * Accessibility
 * -------------
 * Built on @radix-ui/react-dropdown-menu — full keyboard navigation,
 * typeahead, and `role="menu"`/`menuitem` semantics automatically.
 *
 * Future extension
 * -----------------
 * Add checkbox/radio menu items (Radix supports them) if a future menu
 * needs inline toggles.
 */
export interface DropdownMenuItemConfig {
  label: string
  icon?: LucideIcon
  onSelect?: () => void
  destructive?: boolean
  disabled?: boolean
  divider?: boolean
}

export interface DropdownMenuProps {
  trigger: ReactNode
  items: DropdownMenuItemConfig[]
  align?: 'start' | 'center' | 'end'
}

export function DropdownMenu({ trigger, items, align = 'end' }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={6}
          className="z-50 min-w-44 rounded-md border border-border bg-surface p-1 shadow-lg"
        >
          {items.map((item, index) =>
            item.divider ? (
              <DropdownMenuPrimitive.Separator
                key={`divider-${index}`}
                className="my-1 h-px bg-border"
              />
            ) : (
              <DropdownMenuPrimitive.Item
                key={item.label}
                disabled={item.disabled}
                onSelect={item.onSelect}
                className={cn(
                  'flex cursor-pointer select-none items-center gap-2 rounded-sm px-2.5 py-2 text-small outline-none',
                  'data-[highlighted]:bg-surface-secondary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
                  item.destructive ? 'text-error-600' : 'text-text-primary'
                )}
              >
                {item.icon && <Icon icon={item.icon} size={15} />}
                {item.label}
              </DropdownMenuPrimitive.Item>
            )
          )}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}

// Re-exported for the rare case a consumer needs a checked/indicator item.
export const DropdownMenuCheckIndicator = () => <Icon icon={Check} size={14} />
