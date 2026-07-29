import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  // Where the app will be served from. Root by default (Vercel/Netlify, local
  // dev); GitHub Pages serves a project repo from /<repo-name>/, so the deploy
  // workflow sets VITE_BASE=/pudo-accra/. Asset URLs and the router basename
  // both derive from this, so it must be set at build time, not run time.
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/layouts': path.resolve(__dirname, './src/layouts'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/routes': path.resolve(__dirname, './src/routes'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/constants': path.resolve(__dirname, './src/constants'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/config': path.resolve(__dirname, './src/config'),
    },
  },
  server: {
    port: 5173,
  },
})
