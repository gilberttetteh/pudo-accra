import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Where the app will be served from. Root by default (local dev, Netlify,
  // Vercel); GitHub Pages serves a project repo from /<repo-name>/, so the
  // deploy workflow sets VITE_BASE. Asset URLs and the data fetches in
  // planner.js both derive from this, so it must be set at build time.
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
