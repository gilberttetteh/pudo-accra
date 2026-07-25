/**
 * Centralized, typed access to environment variables.
 *
 * Never read `import.meta.env` directly outside this file — all env access
 * flows through here so we get one place to validate, default, and document
 * every variable the app depends on.
 */

interface AppEnv {
  apiBaseUrl: string
  mapDefaultLat: number
  mapDefaultLng: number
  mapDefaultZoom: number
  appName: string
}

function readRequiredString(key: string, fallback: string): string {
  const value = import.meta.env[key]
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

function readNumber(key: string, fallback: number): number {
  const value = import.meta.env[key]
  const parsed = typeof value === 'string' ? Number(value) : NaN
  return Number.isFinite(parsed) ? parsed : fallback
}

export const env: AppEnv = {
  apiBaseUrl: readRequiredString('VITE_API_BASE_URL', 'http://localhost:8000/api'),
  mapDefaultLat: readNumber('VITE_MAP_DEFAULT_LAT', 5.6037),
  mapDefaultLng: readNumber('VITE_MAP_DEFAULT_LNG', -0.187),
  mapDefaultZoom: readNumber('VITE_MAP_DEFAULT_ZOOM', 12),
  appName: readRequiredString('VITE_APP_NAME', 'Accra PUDO Network Planning System'),
}
