import { createStore } from '@/store/createStore'

/**
 * Purpose
 * -------
 * The two knobs that drive the real siting analysis: how far people should
 * have to walk, and how much of the population must be covered. Everything
 * else the planner shows — node count, achieved coverage, which sites appear
 * on the map — is derived from these two numbers plus the exported data.
 *
 * Kept separate from mapStore because these are *analysis* parameters, not
 * view state: they change what is being shown, not how it is being looked at.
 * Panning the map doesn't change the answer; moving these does.
 *
 * Usage
 * -----
 * const minutes = usePlannerStore((state) => state.minutes)
 * const setMinutes = usePlannerStore((state) => state.setMinutes)
 */
export interface PlannerState {
  /** Max walking time to a node. Must be one of the thresholds the pipeline
   *  solved for (5/7/10/12/15/20) — arbitrary values have no data behind
   *  them, so this is a select, not a free slider. */
  minutes: number
  /** Population coverage target, as a percentage. */
  targetPct: number
  setMinutes: (minutes: number) => void
  setTargetPct: (targetPct: number) => void
}

/** Matches `WALK_MINUTES` in analysis/config.py. The UI must not offer a
 *  threshold the pipeline never solved — there'd be no file to load. */
export const WALK_MINUTE_OPTIONS = [5, 7, 10, 12, 15, 20] as const

export const DEFAULT_MINUTES = 10
export const DEFAULT_TARGET_PCT = 95

export const usePlannerStore = createStore<PlannerState>((set) => ({
  minutes: DEFAULT_MINUTES,
  targetPct: DEFAULT_TARGET_PCT,
  setMinutes: (minutes) => set({ minutes }),
  setTargetPct: (targetPct) => set({ targetPct }),
}))
