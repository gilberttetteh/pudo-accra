import type { LatLngExpression } from 'leaflet'
import { ACCRA_NEIGHBOURHOODS } from './geo'

/** Neighbourhood name labels for the "Labels" map layer. */
export interface NeighbourhoodLabel {
  id: string
  name: string
  position: LatLngExpression
}

export const MOCK_NEIGHBOURHOOD_LABELS: NeighbourhoodLabel[] = ACCRA_NEIGHBOURHOODS.map(
  (seed, index) => ({
    id: `label-${index + 1}`,
    name: seed.name,
    position: [seed.lat, seed.lng],
  })
)
