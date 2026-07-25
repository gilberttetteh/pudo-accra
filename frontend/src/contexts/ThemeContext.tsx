import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import type { ReactNode } from 'react'
import { applyThemeClass, getStoredTheme, storeTheme, type ThemeMode } from '@/utils/theme'

/**
 * Purpose
 * -------
 * App-wide light/dark/system theme state, persisted to localStorage and
 * applied as a `.dark` class on `<html>` so every Tailwind `dark:` variant
 * and semantic color token in src/styles/index.css responds automatically.
 *
 * Usage
 * -----
 * Wrap the app once near the root (already done in src/main.tsx):
 *   <ThemeProvider><App /></ThemeProvider>
 *
 * Then anywhere in the tree:
 *   const { mode, resolvedTheme, setMode, toggleTheme } = useTheme()
 *
 * Accessibility
 * -------------
 * Respects `prefers-color-scheme` when mode is 'system' (the default),
 * and keeps `color-scheme` in sync via CSS so native form controls and
 * scrollbars render correctly in both themes.
 *
 * Future extension
 * -----------------
 * Additional themes (e.g. high-contrast) can be added by extending
 * `ThemeMode` and the token overrides in src/styles/index.css.
 */

interface ThemeContextValue {
  mode: ThemeMode
  resolvedTheme: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/** Subscribes to OS-level color-scheme changes via useSyncExternalStore. */
function useSystemTheme(): 'light' | 'dark' {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQueryList.addEventListener('change', onStoreChange)
      return () => mediaQueryList.removeEventListener('change', onStoreChange)
    },
    () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    () => 'light'
  )
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => getStoredTheme())
  const systemTheme = useSystemTheme()
  const resolvedTheme = mode === 'system' ? systemTheme : mode

  // Applying the resolved theme to the DOM is a synchronization side
  // effect (React state -> external `.dark` class), which is exactly
  // what useEffect is for — distinct from deriving state, which is
  // handled above via plain computation + useSyncExternalStore.
  useEffect(() => {
    applyThemeClass(resolvedTheme)
  }, [resolvedTheme])

  const setMode = useCallback((next: ThemeMode) => {
    storeTheme(next)
    setModeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setMode(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setMode])

  const value = useMemo(
    () => ({ mode, resolvedTheme, setMode, toggleTheme }),
    [mode, resolvedTheme, setMode, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
