import type { ReactNode } from 'react'
import { ScaleIndicator } from './ScaleIndicator'
import { CoordinateDisplay } from './CoordinateDisplay'
import { Divider } from '@/components/ui/Divider'
import { cn } from '@/utils/cn'

/**
 * Purpose
 * -------
 * Thin status strip anchored to the bottom of the map, composing
 * ScaleIndicator + CoordinateDisplay + arbitrary summary content (e.g.
 * "128 nodes visible"). Keeps these small, frequently-changing readouts
 * out of the main map toolbar.
 *
 * Props
 * -----
 * - metersPerPixel: number — passed to ScaleIndicator
 * - cursor?: { lat: number; lng: number } — passed to CoordinateDisplay
 *   when available (omitted until the cursor is over the map)
 * - summary?: ReactNode — e.g. a visible-node count
 * - className?: string
 *
 * Example usage
 * -------------
 * <MapStatusBar metersPerPixel={4.77} cursor={cursorPos} summary="128 nodes visible" />
 *
 * Accessibility
 * -------------
 * Presentational strip; individual pieces (ScaleIndicator,
 * CoordinateDisplay) already carry their own accessible semantics.
 *
 * Future extension
 * -----------------
 * Add a connectivity/sync status indicator once real-time data sync
 * (Phase 10) is introduced.
 */
export interface MapStatusBarProps {
  metersPerPixel: number
  cursor?: { lat: number; lng: number }
  summary?: ReactNode
  className?: string
}

export function MapStatusBar({ metersPerPixel, cursor, summary, className }: MapStatusBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-1.5 shadow-floating',
        className
      )}
    >
      <ScaleIndicator metersPerPixel={metersPerPixel} />
      {cursor && (
        <>
          <Divider orientation="vertical" className="h-4" />
          <CoordinateDisplay lat={cursor.lat} lng={cursor.lng} label="Cursor" />
        </>
      )}
      {summary && (
        <>
          <Divider orientation="vertical" className="h-4" />
          <span className="text-caption text-text-secondary">{summary}</span>
        </>
      )}
    </div>
  )
}
