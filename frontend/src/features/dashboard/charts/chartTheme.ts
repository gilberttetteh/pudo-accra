import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  type ChartOptions,
} from 'chart.js'
import { readCssVar } from '@/utils/color'

/**
 * One-time Chart.js component registration + a shared color palette and
 * base options for every Dashboard chart (Step 10). Centralized here so
 * every chart component imports the same registration (Chart.js
 * registration is idempotent, but doing it in six places would be
 * redundant) and the same visual language, rather than each chart
 * hand-rolling its own colors/fonts.
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
 *  'bar' (the option shape with x/y scales); doughnut charts, which have
 *  no scales, cast this with `as ChartOptions<'doughnut'>` at the call
 *  site and simply ignore the `scales` key. */
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
