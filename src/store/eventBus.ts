import { useEffect } from 'react'
import type { LatLngExpression } from 'leaflet'
import type { LayerId } from '@/constants/map'

/**
 * Purpose
 * -------
 * A small typed pub/sub layer for cross-feature notifications (Sidebar →
 * Map → Inspector → Analytics → Toolbar). This is deliberately separate
 * from mapStore: **mapStore is the source of truth for state** (what is
 * currently selected, which layers are on); **the event bus is for
 * moment-in-time notifications** that other features can react to
 * without prop-drilling or importing mapStore directly (useful once
 * Analytics/Reports, built in later phases, want to react to map
 * activity — e.g. logging "NodeSelected" for a usage-analytics feed —
 * without becoming coupled to the map feature's internal store shape).
 *
 * Rule of thumb: if a value needs to be *read* later (e.g. "what's
 * selected right now"), it belongs in mapStore. If a component just
 * needs to *react in the moment* an event happens, use the bus.
 * mapStore's actions emit bus events as a side effect (see
 * store/mapStore.ts) — the bus is never the only place a value lives.
 *
 * Usage
 * -----
 * // Emitting (typically only mapStore actions do this):
 * emitMapEvent('NodeSelected', { nodeId: '123' })
 *
 * // Subscribing, with automatic cleanup:
 * useMapEvent('NodeSelected', (payload) => console.log(payload.nodeId))
 *
 * Future extension
 * -----------------
 * Add a debug/devtools listener that logs every event in development —
 * useful once the event surface grows beyond what's defined here.
 */
export interface MapEventPayloads {
  NodeSelected: { nodeId: string | null }
  CandidateCreated: { candidateId: string; position: LatLngExpression }
  CandidateDeleted: { candidateId: string }
  LayerEnabled: { layerId: LayerId }
  LayerDisabled: { layerId: LayerId }
  MapMoved: { center: LatLngExpression }
  MapZoomed: { zoom: number }
  FeatureHovered: { featureId: string | null }
}

export type MapEventType = keyof MapEventPayloads
type Listener<T extends MapEventType> = (payload: MapEventPayloads[T]) => void

// The listener registry necessarily erases each event's specific payload
// type internally (a single Map can't hold Set<Listener<A>> and
// Set<Listener<B>> under one value type) — emitMapEvent/subscribeMapEvent
// re-establish full type safety at the public API boundary above, so
// this `any` never leaks to a caller.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listeners = new Map<MapEventType, Set<Listener<any>>>()

export function emitMapEvent<T extends MapEventType>(type: T, payload: MapEventPayloads[T]): void {
  listeners.get(type)?.forEach((listener) => listener(payload))
}

export function subscribeMapEvent<T extends MapEventType>(
  type: T,
  listener: Listener<T>
): () => void {
  if (!listeners.has(type)) listeners.set(type, new Set())
  listeners.get(type)!.add(listener)
  return () => listeners.get(type)?.delete(listener)
}

/** React hook wrapper — subscribes on mount, cleans up on unmount. */
export function useMapEvent<T extends MapEventType>(type: T, listener: Listener<T>): void {
  useEffect(() => subscribeMapEvent(type, listener), [type, listener])
}
