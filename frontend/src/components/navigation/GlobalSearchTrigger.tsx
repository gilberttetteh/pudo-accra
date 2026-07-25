import { Icon, Search } from '@/components/icons'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * The visible "Search…" affordance in TopNav. Looks like a search input
 * but is actually a button that opens CommandPalette — this is the
 * "Global Search UI (no functionality yet)" piece: no querying happens
 * here directly, it just launches the palette where filtering occurs.
 *
 * Props
 * -----
 * - onClick: () => void — should open CommandPalette
 *
 * Example usage
 * -------------
 * <GlobalSearchTrigger onClick={() => setPaletteOpen(true)} />
 *
 * Accessibility
 * -------------
 * Real <button>, not a disabled-looking <input>, so it's keyboard and
 * screen-reader operable; label makes the Cmd/Ctrl+K shortcut discoverable.
 *
 * Future extension
 * -----------------
 * Once Phase 10 wires real search, this can become an actual
 * type-ahead input instead of a palette launcher, or keep launching the
 * palette with results shown there — TBD by product design.
 */
export interface GlobalSearchTriggerProps {
  onClick: () => void
  className?: string
}

export function GlobalSearchTrigger({ onClick, className }: GlobalSearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full max-w-sm items-center gap-2.5 rounded-md border border-border-strong bg-surface-secondary px-3 py-2 text-small text-text-tertiary',
        'transition-colors duration-(--duration-fast) hover:border-border-strong hover:bg-surface-tertiary',
        className
      )}
    >
      <Icon icon={Search} size={15} />
      <span className="flex-1 text-left">Search nodes, coverage, reports…</span>
      <kbd className="hidden items-center gap-0.5 rounded border border-border-strong bg-surface px-1.5 py-0.5 text-caption sm:flex">
        ⌘K
      </kbd>
    </button>
  )
}
