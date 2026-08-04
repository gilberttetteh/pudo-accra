import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { NAV_ITEMS } from '@/constants/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { Icon, Search, Sun, Command as CommandIcon } from '@/components/icons'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Global command palette — opens on Ctrl/Cmd+K (registered once here via
 * a document-level keydown listener) or via GlobalSearchTrigger. Lists
 * navigation shortcuts and a couple of app actions (theme toggle),
 * filtered client-side as the user types. This is UI/UX scaffolding: no
 * fuzzy-search library, no backend search — real cross-entity search
 * (nodes, addresses) is Phase 10 territory once services exist.
 *
 * Props
 * -----
 * - open / onOpenChange: controlled visibility
 *
 * Example usage
 * -------------
 * // Mounted once in DashboardLayout:
 * <CommandPalette open={isPaletteOpen} onOpenChange={setIsPaletteOpen} />
 *
 * Accessibility
 * -------------
 * Built on @radix-ui/react-dialog for focus trap/Escape-to-close. Uses
 * `role="listbox"`/`option` for the results list and VisuallyHidden for
 * the dialog's required (but visually redundant) title.
 *
 * Future extension
 * -----------------
 * Phase 10: replace the static command list with results from
 * NodeService/SearchService, add recent-searches, and add arrow-key
 * selection (currently mouse/Enter-on-first-match only).
 */
export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CommandEntry {
  id: string
  label: string
  group: 'Navigate' | 'Actions'
  icon: typeof Search
  onRun: () => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { toggleTheme } = useTheme()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        const next = !open
        if (!next) setQuery('')
        onOpenChange(next)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  // Reset the query as part of the open/close transition itself (driven
  // by Radix's onOpenChange, fired from real user events — Escape,
  // overlay click, etc.) rather than a separate effect reacting to
  // `open`, which would be a setState-in-effect cascade.
  const handleOpenChange = (next: boolean) => {
    if (!next) setQuery('')
    onOpenChange(next)
  }

  const commands: CommandEntry[] = useMemo(
    () => [
      ...NAV_ITEMS.map((item) => ({
        id: `nav-${item.href}`,
        label: `Go to ${item.label}`,
        group: 'Navigate' as const,
        icon: item.icon,
        onRun: () => navigate(item.href),
      })),
      {
        id: 'action-theme',
        label: 'Toggle light / dark theme',
        group: 'Actions' as const,
        icon: Sun,
        onRun: toggleTheme,
      },
    ],
    [navigate, toggleTheme]
  )

  const filtered = commands.filter((command) =>
    command.label.toLowerCase().includes(query.toLowerCase())
  )
  const groups = ['Navigate', 'Actions'] as const

  const runCommand = (command: CommandEntry) => {
    command.onRun()
    handleOpenChange(false)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-[1px]" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-24 z-50 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
          style={{ width: 'min(92vw, 32rem)' }}
        >
          <VisuallyHidden asChild>
            <DialogPrimitive.Title>Command palette</DialogPrimitive.Title>
          </VisuallyHidden>

          <div className="flex w-full items-center gap-2.5 border-b border-border px-4 py-3">
            <Icon icon={Search} size={16} className="shrink-0 text-text-tertiary" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search commands…"
              className="w-full min-w-0 flex-1 bg-transparent text-body text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            <kbd className="hidden shrink-0 items-center gap-0.5 rounded border border-border-strong px-1.5 py-0.5 text-caption text-text-tertiary sm:flex">
              Esc
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2" role="listbox" aria-label="Commands">
            {filtered.length === 0 && (
              <p className="px-2 py-6 text-center text-small text-text-tertiary">
                No matching commands.
              </p>
            )}

            {groups.map((group) => {
              const groupCommands = filtered.filter((command) => command.group === group)
              if (groupCommands.length === 0) return null
              return (
                <div key={group} className="mb-2 last:mb-0">
                  <p className="px-2 py-1 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
                    {group}
                  </p>
                  {groupCommands.map((command) => (
                    <button
                      key={command.id}
                      role="option"
                      aria-selected={false}
                      type="button"
                      onClick={() => runCommand(command)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-small text-text-primary',
                        'hover:bg-surface-secondary'
                      )}
                    >
                      <Icon icon={command.icon} size={15} className="text-text-tertiary" />
                      {command.label}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-1.5 border-t border-border px-4 py-2 text-caption text-text-tertiary">
            <Icon icon={CommandIcon} size={12} />
            <span>K to toggle this palette anywhere</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}


