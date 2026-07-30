/**
 * Phase 8 note
 * ------------
 * The real implementation moved to `@/components/charts/chartTheme`
 * (shared location, so Analytics' charts can use the exact same
 * registration/palette/base-options instead of a copy-pasted second
 * version — see the Phase 8 plan §4).
 *
 * This file is now just a re-export so none of Phase 7's five Dashboard
 * chart components (CoverageByDistrictChart, CandidateDistributionChart,
 * NodeStatusBreakdownChart, CoverageTrendChart,
 * AccessibilityDistributionChart) need to change their
 * `from './chartTheme'` import — same names, same behavior, zero edits
 * to those files.
 */
export * from '@/components/charts/chartTheme'
