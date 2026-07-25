/**
 * Real Accra neighbourhood centroids, used as seed points for jittered
 * mock node/label generation so coordinates land in geographically
 * plausible locations rather than a uniform random spread over the
 * ocean or open bush.
 */
export interface NeighbourhoodSeed {
  name: string
  lat: number
  lng: number
}

export const ACCRA_NEIGHBOURHOODS: NeighbourhoodSeed[] = [
  { name: 'Osu', lat: 5.5558, lng: -0.1809 },
  { name: 'Labone', lat: 5.5648, lng: -0.1699 },
  { name: 'East Legon', lat: 5.6494, lng: -0.1519 },
  { name: 'Airport Residential', lat: 5.6052, lng: -0.1746 },
  { name: 'Cantonments', lat: 5.5779, lng: -0.1793 },
  { name: 'Dansoman', lat: 5.5411, lng: -0.2661 },
  { name: 'Kaneshie', lat: 5.5586, lng: -0.2312 },
  { name: 'Achimota', lat: 5.618, lng: -0.2266 },
  { name: 'Spintex', lat: 5.6298, lng: -0.1187 },
  { name: 'Adenta', lat: 5.7084, lng: -0.1653 },
  { name: 'Madina', lat: 5.6837, lng: -0.167 },
  { name: 'Tema', lat: 5.6698, lng: -0.0166 },
  { name: 'Ashaiman', lat: 5.6947, lng: -0.0334 },
  { name: 'Teshie', lat: 5.5836, lng: -0.1044 },
  { name: 'Nungua', lat: 5.5972, lng: -0.0703 },
  { name: 'Circle', lat: 5.5651, lng: -0.2107 },
  { name: 'Abeka', lat: 5.5877, lng: -0.2295 },
  { name: 'North Kaneshie', lat: 5.5699, lng: -0.2287 },
  { name: 'Dzorwulu', lat: 5.6017, lng: -0.1913 },
  { name: 'Ridge', lat: 5.5622, lng: -0.1969 },
  { name: 'Adabraka', lat: 5.558, lng: -0.2065 },
  { name: 'Sowutuom', lat: 5.6112, lng: -0.2731 },
  { name: 'Lapaz', lat: 5.6053, lng: -0.2465 },
  { name: 'Haatso', lat: 5.6577, lng: -0.1918 },
]
