import type { Config } from 'tailwindcss'

// Tailwind v4 auto-detects content by default, but we declare it explicitly
// for clarity and to keep this file the single source of truth for scanning
// scope as the project grows (e.g. Storybook, shared packages).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Design tokens (spacing, radius, color) are defined via the CSS-first
      // `@theme` directive in src/styles/index.css per Tailwind v4 convention.
      // This section is reserved for Phase 2 (Design System) extensions.
    },
  },
  plugins: [],
} satisfies Config
