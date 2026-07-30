import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  BarController,
  LineController,
  DoughnutController,
  ScatterController,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  type ChartOptions,
} from 'chart.js'
import { readCssVar } from '@/utils/color'

/**
 * Purpose
 * -------
 * One-time Chart.js component registration + a shared color palette and
 * base options for every Chart.js consumer in the app (Dashboard's
 * charts, Step 10, and Analytics' charts, Phase 8). Originally lived at
 * features/dashboard/charts/chartTheme.ts; moved here per the Phase 8
 * plan ("move it to a shared location... rather than copy-pasting it
 * into a new features/analytics/charts/ folder") since Analytics needs
 * the exact same registration/palette/base-options and duplicating it
 * would mean two places to keep in sync. features/dashboard/charts/chartTheme.ts
 * now just re-exports from here, so Phase 7's five chart components are
 * untouched — same imports, same behavior.
 *
 * Registration note
 * ------------------
 * Also explicitly registers BarController, LineController,
 * DoughnutController, and ScatterController alongside the element/scale
 * types — react-chartjs-2's <Bar>/<Doughnut>/<Scatter> components need
 * their matching *Controller* registered (not just the element/scale
 * classes) or Chart.js throws at render time. Registration is additive
 * and idempotent, so this only fills in what was missing; it doesn't
 * change any existing chart's rendered output.
 *
 * Colors are read live from the design-token CSS variables (see
 * utils/color.ts's readCssVar) rather than hardcoded, so charts stay in
 * sync with src/styles/index.css and pick up light/dark theme changes
 * on next render.
 */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  BarController,
  LineController,
  DoughnutController,
  ScatterController,
  ChartTooltip,
  ChartLegend
)

export function getChartPalette() {
  return [
    readCssVar('--color-chart-1') || '#3b82f6',
    readCssVar('--color-chart-2') || '#14b8a6',
    readCssVar('--color-chart-3') || '#f59e0b',
    readCssVar('--color-chart-4') || '#6366f1',
    readCssVar('--color-chart-5') || '#f87171',
    readCssVar('--color-chart-6') || '#0ea5e9',
  ]
}

export function getChartTextColor() {
  return readCssVar('--color-text-secondary') || '#475569'
}

export function getChartGridColor() {
  return readCssVar('--color-border') || '#e2e8f0'
}

/** Base options shared by every chart — transparent background (cards
 *  already provide the surface), responsive sizing, and a consistent
 *  legend/tooltip/font treatment pulled from design tokens. Typed against
 *  'bar' (the option shape with x/y scales); doughnut/scatter charts,
 *  which have a different scale shape, cast this with
 *  `as ChartOptions<'doughnut'>` / `as ChartOptions<'scatter'>` at the
 *  call site. */
export function getBaseChartOptions(): ChartOptions<'bar'> {
  const textColor = getChartTextColor()
  const gridColor = getChartGridColor()

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: textColor, font: { family: 'Inter, sans-serif', size: 12 }, boxWidth: 10 },
      },
      tooltip: {
        backgroundColor: readCssVar('--color-neutral-900') || '#0f172a',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        ticks: { color: textColor, font: { size: 11 } },
        grid: { color: gridColor, display: false },
      },
      y: {
        ticks: { color: textColor, font: { size: 11 } },
        grid: { color: gridColor },
      },
    },
  }
}
