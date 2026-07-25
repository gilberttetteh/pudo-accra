import type { LatLngExpression } from 'leaflet'
import { ACCRA_NEIGHBOURHOODS } from './geo'

/** A handful of major named road corridors, represented as simple
 *  polylines connecting real neighbourhood centroids. Illustrative only
 *  — not sourced from actual OSM road geometry (that's Phase 10, via
 *  the real OSM import pipeline in ARCHITECTURE.md's GIS Architecture). */
export interface RoadSegment {
  id: string
  name: string
  roadClass: 'primary' | 'secondary'
  positions: LatLngExpression[]
}

function findNeighbourhood(name: string) {
  const match = ACCRA_NEIGHBOURHOODS.find((n) => n.name === name)
  if (!match) throw new Error(`Unknown neighbourhood: ${name}`)
  return [match.lat, match.lng] as LatLngExpression
}

export const MOCK_ROAD_SEGMENTS: RoadSegment[] = [
  {
    id: 'road-1',
    name: 'Ring Road',
    roadClass: 'primary',
    positions: [findNeighbourhood('Circle'), findNeighbourhood('Ridge'), findNeighbourhood('Osu')],
  },
  {
    id: 'road-2',
    name: 'Spintex Road',
    roadClass: 'primary',
    positions: [
      findNeighbourhood('Tema'),
      findNeighbourhood('Spintex'),
      findNeighbourhood('Teshie'),
    ],
  },
  {
    id: 'road-3',
    name: 'Tetteh Quarshie – East Legon Corridor',
    roadClass: 'primary',
    positions: [
      findNeighbourhood('Cantonments'),
      findNeighbourhood('East Legon'),
      findNeighbourhood('Madina'),
    ],
  },
  {
    id: 'road-4',
    name: 'Winneba Road',
    roadClass: 'secondary',
    positions: [
      findNeighbourhood('Kaneshie'),
      findNeighbourhood('Abeka'),
      findNeighbourhood('Lapaz'),
    ],
  },
  {
    id: 'road-5',
    name: 'Achimota – Adenta Corridor',
    roadClass: 'secondary',
    positions: [
      findNeighbourhood('Achimota'),
      findNeighbourhood('Haatso'),
      findNeighbourhood('Adenta'),
    ],
  },
  {
    id: 'road-6',
    name: 'Dansoman Highway',
    roadClass: 'secondary',
    positions: [findNeighbourhood('Kaneshie'), findNeighbourhood('Dansoman')],
  },
]
