import axios from 'axios'
import { env } from '@/config/env'

/**
 * Shared Axios instance for all API calls.
 *
 * No endpoints or business logic live here — this is transport-layer
 * configuration only. Feature-specific request functions belong in
 * `src/services/` (Phase 10).
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor placeholder — auth token attachment will be added
// once authentication is implemented (Phase 10).
apiClient.interceptors.request.use((config) => config)

// Response interceptor placeholder — consistent error normalization
// (matching the { success, message, errors } contract from
// ARCHITECTURE.md) will be added once the backend is connected.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)
