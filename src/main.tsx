import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/config/queryClient'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/components/feedback/Toast'
import App from './App'
import '@/styles/index.css'

/**
 * Application entry point.
 *
 * Provider order (outside-in):
 *   BrowserRouter       -> routing context (Phase 4 will populate routes)
 *   QueryClientProvider -> server-state cache (Phase 10 will add queries)
 *   ThemeProvider        -> light/dark/system theme, applied as html.dark
 *   ToastProvider         -> transient notification system
 *
 * Auth and Settings contexts are added in Phase 3 (Application Shell)
 * once there's a layout to consume them.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)
