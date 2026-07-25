import type { LatLngExpression } from 'leaflet'
import { createSeededRandom, randomInRange } from './random'
import { haversineDistanceMeters } from '@/utils/geo'

/**
 * Mock population density grid — a coarse lat/lng grid covering the
 * Accra metro bounding box, each cell holding a plausible population
 * estimate. Density decays from a central "downtown" point with random
 * jitter, giving a realistic-looking hot spot rather than uniform noise.
 * Not derived from real census data — a stand-in for what a real
 * population-raster join (WorldPop/GHSL data via PostGIS) would provide.
 */
export interface PopulationCell {
  id: string
  position: LatLngExpression
  populationEstimate: number
  densityPerKm2: number
}

const GRID_STEP_DEG = 0.025 // ~2.7km per cell
const BOUNDS = { south: 5.47, north: 5.75, west: -0.32, east: 0.02 }
const CENTER: LatLngExpression = [5.56, -0.205] // roughly central Accra
const CELL_AREA_KM2 = 2.7 * 2.7

export function generatePopulationCells(): PopulationCell[] {
  const random = createSeededRandom(70701)
  const cells: PopulationCell[] = []
  let id = 0

  for (let lat = BOUNDS.south; lat < BOUNDS.north; lat += GRID_STEP_DEG) {
    for (let lng = BOUNDS.west; lng < BOUNDS.east; lng += GRID_STEP_DEG) {
      const center: LatLngExpression = [lat + GRID_STEP_DEG / 2, lng + GRID_STEP_DEG / 2]
      const distanceFromCoreKm = haversineDistanceMeters(center, CENTER) / 1000
      const decay = Math.exp(-distanceFromCoreKm / 6.5)
      const base = 22000 * decay
      const populationEstimate = Math.max(200, Math.round(base * randomInRange(random, 0.5, 1.4)))

      cells.push({
        id: `pop-cell-${id}`,
        position: center,
        populationEstimate,
        densityPerKm2: Math.round(populationEstimate / CELL_AREA_KM2),
      })
      id += 1
    }
  }
  return cells
}

export const MOCK_POPULATION_CELLS = generatePopulationCells()
export const POPULATION_CELL_AREA_KM2 = CELL_AREA_KM2
