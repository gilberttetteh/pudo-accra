/**
 * Theme (light/dark) persistence + application helpers.
 * Consumed by src/contexts/ThemeContext.tsx — kept separate so the
 * logic is unit-testable without rendering React.
 */

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'accra-pudo-theme'

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
}

export function storeTheme(mode: ThemeMode): void {
  window.localStorage.setItem(STORAGE_KEY, mode)
}

export function resolveSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? resolveSystemTheme() : mode
}

/** Apply the resolved theme to the document root (`<html class="dark">`). */
export function applyThemeClass(resolved: 'light' | 'dark'): void {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}
