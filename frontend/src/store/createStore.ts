import { useSyncExternalStore } from 'react'

/**
 * Purpose
 * -------
 * Minimal external-store factory (Zustand-style API) built entirely on
 * React 18's useSyncExternalStore — no new dependency. Exists because
 * high-frequency state (map zoom/pan fires many times per second) would
 * cause a re-render storm through React Context; an external store with
 * per-selector subscriptions avoids that while staying "no unnecessary
 * complexity" per ARCHITECTURE.md.
 *
 * Usage
 * -----
 * const useMapStore = createStore<MapState>((set, get) => ({
 *   zoom: 12,
 *   setZoom: (zoom) => set({ zoom }),
 * }))
 *
 * // In a component — only re-renders when the selected slice changes:
 * const zoom = useMapStore((state) => state.zoom)
 *
 * Future extension
 * -----------------
 * If a future feature needs middleware (persistence, devtools), swap
 * the implementation for Zustand without changing any consumer code —
 * the `useStore((state) => slice)` call signature is intentionally
 * Zustand-compatible.
 */
type Listener = () => void
type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void
type GetState<T> = () => T

export function createStore<T extends object>(
  initializer: (set: SetState<T>, get: GetState<T>) => T
) {
  let state: T
  const listeners = new Set<Listener>()

  const setState: SetState<T> = (partial) => {
    const partialState = typeof partial === 'function' ? partial(state) : partial
    state = { ...state, ...partialState }
    listeners.forEach((listener) => listener())
  }

  const getState: GetState<T> = () => state

  const subscribe = (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  state = initializer(setState, getState)

  function useStore<U>(selector: (state: T) => U): U {
    return useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(state)
    )
  }

  useStore.getState = getState
  useStore.setState = setState
  useStore.subscribe = subscribe

  return useStore
}
