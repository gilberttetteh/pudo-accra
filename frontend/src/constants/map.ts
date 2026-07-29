import type { LatLngExpression } from 'leaflet'
import type { LucideIcon } from 'lucide-react'
import {
  MapPin,
  Layers as LayersIcon,
  Route,
  Waves,
  Circle,
  Hexagon,
  Flame,
  Landmark,
  Tag,
  Users,
  Footprints,
  Accessibility,
  AlertTriangle,
  Target,
  Ban,
  Compass,
} from '@/components/icons'

/**
 * Centralized map configuration: basemaps, layer registry (with full
 * metadata, not bare strings), default viewport, and CRS. Nothing in
 * components/map or features/map should hardcode a tile URL, layer id,
 * or default coordinate — it all flows from here, per ARCHITECTURE.md's
 * "no hardcoded values" rule.
 */

export type BasemapId = 'osm' | 'light' | 'dark' | 'satellite' | 'terrain'

export interface BasemapConfig {
  id: BasemapId
  label: string
  url: string
  attribution: string
  /** Basemaps without a real free tile source yet — rendered with a
   *  placeholder pattern until a provider (e.g. Mapbox/Maptiler API key)
   *  is configured in Phase 10. */
  isPlaceholder?: boolean
}

export const BASEMAPS: Record<BasemapId, BasemapConfig> = {
  osm: {
    id: 'osm',
    label: 'Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  light: {
    id: 'light',
    label: 'Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
  dark: {
    id: 'dark',
    label: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
  satellite: {
    id: 'satellite',
    label: 'Satellite',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors (satellite placeholder)',
    isPlaceholder: true,
  },
  terrain: {
    id: 'terrain',
    label: 'Terrain',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors (terrain placeholder)',
    isPlaceholder: true,
  },
}

export type LayerId =
  | 'pudo-nodes'
  | 'study-area'
  | 'exclusion-zones'
  | 'existing-nodes'
  | 'candidate-nodes'
  | 'road-network'
  | 'flood-zones'
  | 'isochrones'
  | 'coverage-areas'
  | 'heatmap'
  | 'admin-boundaries'
  | 'labels'
  | 'coverage-gaps'
  | 'population-density'
  | 'accessibility-zones'
  | 'walking-radius'

/**
 * Full layer metadata, replacing bare string identifiers. LayerControl
 * (and MapSidebarPanel, which wires it up) is entirely data-driven off
 * this array — adding a new layer means adding one entry here, not
 * touching rendering logic.
 */
export interface LayerDefinition {
  id: LayerId
  name: string
  icon: LucideIcon
  defaultVisible: boolean
  defaultOpacity: number
  minZoom: number
  maxZoom: number
  /** Render/list order — lower renders first (bottom of the stack). */
  order: number
}

/**
 * The three layers below render the real siting analysis (see
 * services/planner.ts); every other layer in this list is mock data. Their
 * `order` values are fractional so they slot between existing layers without
 * renumbering the whole array — the field is a sort key, not an index.
 */
const rawLayerDefinitions: LayerDefinition[] = [
  {
    id: 'study-area',
    name: 'Study Area (Accra + Kasoa)',
    icon: Compass,
    defaultVisible: true,
    defaultOpacity: 1,
    minZoom: 10,
    maxZoom: 18,
    order: 0.5,
  },
  {
    id: 'exclusion-zones',
    name: 'Exclusion Zones',
    icon: Ban,
    defaultVisible: false,
    defaultOpacity: 0.5,
    minZoom: 10,
    maxZoom: 18,
    order: 2.5,
  },
  {
    id: 'pudo-nodes',
    name: 'PUDO Sites (analysis)',
    icon: Target,
    defaultVisible: true,
    defaultOpacity: 1,
    minZoom: 10,
    maxZoom: 18,
    order: 11.5,
  },
  {
    id: 'admin-boundaries',
    name: 'Administrative Boundaries',
    icon: Landmark,
    defaultVisible: false,
    defaultOpacity: 1,
    minZoom: 10,
    maxZoom: 18,
    order: 0,
  },
  {
    id: 'population-density',
    name: 'Population Density',
    icon: Users,
    defaultVisible: false,
    defaultOpacity: 0.5,
    minZoom: 10,
    maxZoom: 16,
    order: 1,
  },
  {
    id: 'flood-zones',
    name: 'Flood Zones',
    icon: Waves,
    defaultVisible: false,
    defaultOpacity: 0.6,
    minZoom: 10,
    maxZoom: 18,
    order: 2,
  },
  {
    id: 'coverage-areas',
    name: 'Coverage Areas (sample)',
    icon: Hexagon,
    defaultVisible: false,
    defaultOpacity: 0.5,
    minZoom: 10,
    maxZoom: 18,
    order: 3,
  },
  {
    id: 'coverage-gaps',
    name: 'Coverage Gaps',
    icon: AlertTriangle,
    defaultVisible: false,
    defaultOpacity: 0.55,
    minZoom: 10,
    maxZoom: 18,
    order: 4,
  },
  {
    id: 'accessibility-zones',
    name: 'Accessibility Zones',
    icon: Accessibility,
    defaultVisible: false,
    defaultOpacity: 0.45,
    minZoom: 10,
    maxZoom: 16,
    order: 5,
  },
  {
    id: 'heatmap',
    name: 'Coverage Heatmap',
    icon: Flame,
    defaultVisible: false,
    defaultOpacity: 0.6,
    minZoom: 10,
    maxZoom: 16,
    order: 6,
  },
  {
    id: 'road-network',
    name: 'Road Network',
    icon: Route,
    defaultVisible: false,
    defaultOpacity: 0.9,
    minZoom: 11,
    maxZoom: 18,
    order: 7,
  },
  {
    id: 'walking-radius',
    name: 'Walking Radius',
    icon: Footprints,
    defaultVisible: false,
    defaultOpacity: 0.35,
    minZoom: 12,
    maxZoom: 18,
    order: 8,
  },
  {
    id: 'isochrones',
    name: 'Isochrones',
    icon: Circle,
    defaultVisible: false,
    defaultOpacity: 0.4,
    minZoom: 12,
    maxZoom: 18,
    order: 9,
  },
  {
    id: 'existing-nodes',
    name: 'Existing Nodes (sample)',
    icon: MapPin,
    // Off by default: this is sample data, and leaving it on top of the real
    // analysis makes the two indistinguishable at a glance.
    defaultVisible: false,
    defaultOpacity: 1,
    minZoom: 10,
    maxZoom: 18,
    order: 10,
  },
  {
    id: 'candidate-nodes',
    name: 'Candidate Nodes (sample)',
    icon: LayersIcon,
    defaultVisible: false,
    defaultOpacity: 1,
    minZoom: 10,
    maxZoom: 18,
    order: 11,
  },
  {
    id: 'labels',
    name: 'Neighbourhood Labels',
    icon: Tag,
    defaultVisible: true,
    defaultOpacity: 1,
    minZoom: 12,
    maxZoom: 18,
    order: 12,
  },
]

export const LAYER_DEFINITIONS: LayerDefinition[] = [...rawLayerDefinitions].sort(
  (a, b) => a.order - b.order
)

export const MAP_CONFIG = {
  defaultCenter: [5.6037, -0.187] as LatLngExpression,
  defaultZoom: 12,
  minZoom: 10,
  maxZoom: 18,
  /** Coordinate reference system label shown in the status bar. Leaflet
   *  itself always renders in EPSG:3857 (Web Mercator); source data is
   *  WGS84 (EPSG:4326) lat/lng, which is what this app stores/displays. */
  crs: 'EPSG:4326 (WGS 84)',
} as const
