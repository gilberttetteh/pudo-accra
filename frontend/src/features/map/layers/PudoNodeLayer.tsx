import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMapStore } from '@/store/mapStore'
import { LAYER_DEFINITIONS } from '@/constants/map'
import { usePlannerResult } from '@/hooks/usePlannerData'
import type { PudoNode } from '@/services/planner'

/**
 * Purpose
 * -------
 * Renders the PUDO sites chosen by the real siting analysis — the output of
 * the greedy max-coverage solve in `analysis/`, not mock data.
 *
 * Built on raw Leaflet rather than react-leaflet's <CircleMarker>, which is
 * a deliberate exception to how every other layer here works. The selection
 * can reach ~10 500 sites (5-minute walk, 100% coverage); one React element
 * and one SVG path each is enough to stall the map on a slider move. A
 * single canvas renderer draws them all in one surface instead, and the
 * whole layer is rebuilt imperatively when the selection changes.
 *
 * Marker area encodes people served, so the sites doing the heavy lifting
 * read immediately at a glance — the first ~100 ranks typically cover more
 * ground than the next thousand combined.
 *
 * Example usage
 * -------------
 * <PudoNodeLayer />  // inside <MapContainer>; reads its own data
 */
const definition = LAYER_DEFINITIONS.find((layer) => layer.id === 'pudo-nodes')!

/** Marker radius in pixels, by share of the top site's marginal gain. Sized
 *  on a square-root scale so radius tracks *area*, which is what the eye
 *  actually compares. */
function radiusFor(peopleServed: number, maxPeopleServed: number): number {
  if (maxPeopleServed <= 0) return 4
  const share = Math.min(1, Math.max(0, peopleServed / maxPeopleServed))
  return 3 + Math.sqrt(share) * 7
}

/** Warm for the highest-impact sites, cool for the long tail. */
function colorFor(peopleServed: number, maxPeopleServed: number): string {
  if (maxPeopleServed <= 0) return '#38bdf8'
  const share = peopleServed / maxPeopleServed
  if (share > 0.5) return '#f97316'
  if (share > 0.2) return '#fbbf24'
  if (share > 0.05) return '#34d399'
  return '#38bdf8'
}

function popupHtml(node: PudoNode): string {
  return `
    <div style="min-width:170px">
      <div style="font-weight:600;margin-bottom:4px">PUDO site #${node.rank}</div>
      <div style="font-size:12px;line-height:1.6">
        <div><strong>${node.peopleServed.toLocaleString()}</strong> people first reached here</div>
        <div>Cumulative coverage: <strong>${node.cumPct.toFixed(2)}%</strong></div>
        <div style="opacity:.7;margin-top:4px">${node.lat.toFixed(5)}, ${node.lon.toFixed(5)}</div>
      </div>
    </div>
  `
}

export function PudoNodeLayer() {
  const map = useMap()
  const visible = useMapStore((state) => state.activeLayers['pudo-nodes'])
  const zoom = useMapStore((state) => state.zoom)
  const { selection } = usePlannerResult()

  const inZoomRange = zoom >= definition.minZoom && zoom <= definition.maxZoom
  const shouldRender = visible && inZoomRange
  const nodes = selection?.nodes

  useEffect(() => {
    if (!shouldRender || !nodes || nodes.length === 0) return

    // One canvas for the entire layer. Without this each circle would get its
    // own SVG path, which is what makes thousands of markers unusable.
    const renderer = L.canvas({ padding: 0.5 })
    const group = L.layerGroup([], { pane: 'markerPane' })

    // Rank 1 is the greedy maximum, so it bounds every other marginal gain.
    const maxPeopleServed = nodes[0]?.peopleServed ?? 0

    for (const node of nodes) {
      L.circleMarker([node.lat, node.lon], {
        renderer,
        radius: radiusFor(node.peopleServed, maxPeopleServed),
        color: '#0f172a',
        weight: 1,
        opacity: 0.55,
        fillColor: colorFor(node.peopleServed, maxPeopleServed),
        fillOpacity: 0.85,
      })
        .bindPopup(popupHtml(node))
        .addTo(group)
    }

    group.addTo(map)
    return () => {
      group.remove()
    }
  }, [map, nodes, shouldRender])

  return null
}
