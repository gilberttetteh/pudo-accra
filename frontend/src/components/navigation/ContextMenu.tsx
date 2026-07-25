import { useEffect, useRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from '@/components/icons'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * A floating menu anchored to arbitrary screen coordinates (clientX/
 * clientY) rather than a DOM trigger element — built for right-click
 * interactions on canvas-like surfaces (Leaflet markers, empty map
 * space) where the "trigger" isn't a normal React-rendered element that
 * a trigger-based menu (like DropdownMenu) could wrap. Not built on
 * Radix's context-menu primitive for that reason; this is a small,
 * self-contained implementation of the same "floating menu, dismiss on
 * outside click/Escape" pattern.
 *
 * Props
 * -----
 * - open: boolean
 * - position: { x: number; y: number } — clientX/clientY of the
 *   triggering event; automatically clamped so the menu stays on-screen
 * - items: ContextMenuItemConfig[]
 * - onClose: () => void
 *
 * Example usage
 * -------------
 * <ContextMenu
 *   open={!!contextMenu}
 *   position={contextMenu?.screenPosition ?? { x: 0, y: 0 }}
 *   items={items}
 *   onClose={closeContextMenu}
 * />
 *
 * Accessibility
 * -------------
 * `role="menu"`/`menuitem` semantics; closes on Escape; a full-screen
 * transparent backdrop captures outside clicks. Not a full
 * arrow-key-navigable menu (Radix's DropdownMenu is used for that
 * elsewhere) — acceptable for an occasional right-click action list.
 *
 * Future extension
 * -----------------
 * Add arrow-key navigation if usage testing shows people expect it here
 * too.
 */
export interface ContextMenuItemConfig {
  label: string
  icon?: LucideIcon
  onSelect?: () => void
  destructive?: boolean
  disabled?: boolean
  divider?: boolean
}

export interface ContextMenuProps {
  open: boolean
  position: { x: number; y: number }
  items: ContextMenuItemConfig[]
  onClose: () => void
}

const MENU_WIDTH = 220

export function ContextMenu({ open, position, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Pure derivation from props — no need for state/effect at all, this
  // just clamps the requested position to stay on-screen.
  const clampedPosition = (() => {
    if (typeof window === 'undefined') return position
    const maxX = window.innerWidth - MENU_WIDTH - 8
    const maxY = window.innerHeight - items.length * 36 - 16
    return {
      x: Math.min(position.x, Math.max(8, maxX)),
      y: Math.min(position.y, Math.max(8, maxY)),
    }
  })()

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        onContextMenu={(event) => {
          event.preventDefault()
          onClose()
        }}
        className="fixed inset-0 z-[900] cursor-default"
      />
      <div
        ref={menuRef}
        role="menu"
        style={{ left: clampedPosition.x, top: clampedPosition.y, width: MENU_WIDTH }}
        className="fixed z-[901] rounded-md border border-border bg-surface p-1 shadow-lg"
      >
        {items.map((item, index) =>
          item.divider ? (
            <div key={`divider-${index}`} className="my-1 h-px bg-border" />
          ) : (
            <button
              key={item.label}
              role="menuitem"
              type="button"
              disabled={item.disabled}
              onClick={() => {
                item.onSelect?.()
                onClose()
              }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-small outline-none',
                'hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50',
                item.destructive ? 'text-error-600' : 'text-text-primary'
              )}
            >
              {item.icon && <Icon icon={item.icon} size={15} />}
              {item.label}
            </button>
          )
        )}
      </div>
    </>
  )
}
