import { useTheme } from '@/contexts/ThemeContext'
import { Switch } from '@/components/forms/Switch'
import { Icon, Sun, Moon } from '@/components/icons'

/**
 * Purpose
 * -------
 * Light/dark mode toggle switch. A thin, ready-to-drop-in composition of
 * Switch + useTheme — intended for the top nav (Phase 3), not a
 * standalone page.
 *
 * Props
 * -----
 * None — reads/writes global theme state via useTheme().
 *
 * Example usage
 * -------------
 * <ThemeToggle />
 *
 * Accessibility
 * -------------
 * Delegates to Switch's Radix-backed `role="switch"`; includes a visible
 * aria-label describing the current action.
 *
 * Future extension
 * -----------------
 * Expand to a three-way Sun/Moon/Monitor segmented control if "system"
 * mode needs to be explicitly selectable from the UI (currently only
 * reachable by clearing localStorage).
 */
export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="inline-flex items-center gap-2">
      <Icon icon={Sun} size={15} className={isDark ? 'text-text-tertiary' : 'text-warning-500'} />
      <Switch
        checked={isDark}
        onCheckedChange={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      />
      <Icon icon={Moon} size={15} className={isDark ? 'text-primary-400' : 'text-text-tertiary'} />
    </div>
  )
}
