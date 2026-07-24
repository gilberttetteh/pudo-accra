"""Central configuration for the PUDO coverage analysis.

Study area: Greater Accra Region + Kasoa (Awutu Senya East, Central Region).
"""
from pathlib import Path

# ---------------------------------------------------------------- paths
ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
RAW = DATA / "raw"
PROCESSED = DATA / "processed"
OUTPUTS = ROOT / "outputs"

for _d in (RAW, PROCESSED, OUTPUTS):
    _d.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------- study area
# Nominatim queries used to assemble the study area polygon.
GREATER_ACCRA_QUERY = "Greater Accra Region, Ghana"
# Kasoa itself is usually a point in OSM; we fall back to its municipal district.
KASOA_QUERIES = ["Awutu Senya East Municipal District, Ghana", "Kasoa, Ghana"]
KASOA_POINT_BUFFER_M = 6000  # buffer if only a point is returned

# ---------------------------------------------------------------- data sources
GEOFABRIK_PBF_URL = "https://download.geofabrik.de/africa/ghana-latest.osm.pbf"
PBF_PATH = RAW / "ghana-latest.osm.pbf"

# WorldPop 2020 UN-adjusted constrained 100 m population count (Ghana).
WORLDPOP_URLS = [
    "https://data.worldpop.org/GIS/Population/Global_2000_2020_Constrained/2020/maxar_v1/GHA/gha_ppp_2020_UNadj_constrained.tif",
    "https://data.worldpop.org/GIS/Population/Global_2000_2020_Constrained/2020/BSGM/GHA/gha_ppp_2020_UNadj_constrained.tif",
    "https://data.worldpop.org/GIS/Population/Global_2000_2020/2020/GHA/gha_ppp_2020_UNadj.tif",
]
WORLDPOP_PATH = RAW / "gha_pop_2020.tif"

# ---------------------------------------------------------------- CRS
CRS_WGS84 = "EPSG:4326"
CRS_METRIC = "EPSG:32630"  # UTM 30N — covers Accra (~0.2 W)

# ---------------------------------------------------------------- network
# OSM highway values a pedestrian can realistically use.
WALKABLE_HIGHWAYS = {
    "primary", "primary_link", "secondary", "secondary_link",
    "tertiary", "tertiary_link", "unclassified", "residential",
    "living_street", "service", "pedestrian", "track", "footway",
    "path", "steps", "road",
}
WALK_SPEED_M_MIN = 80.0  # ~4.8 km/h

# ---------------------------------------------------------------- exclusions
# Candidate PUDO sites may not fall inside these OSM feature classes
# (buffered by EXCLUSION_BUFFER_M).
EXCLUSION_BUFFER_M = 25.0
# Rivers/canals are mapped as centre-lines; buffer them into thin exclusion strips.
RIVER_BUFFER_M = 15.0

# ---------------------------------------------------------------- demand
MIN_CELL_POP = 1.0          # ignore WorldPop cells below this population
DEMAND_SNAP_MAX_M = 500.0   # demand further than this from any road is flagged

# ---------------------------------------------------------------- candidates
CANDIDATE_SPACING_M = 250.0  # min spacing between candidate sites

# ---------------------------------------------------------------- solver
WALK_MINUTES = [5, 7, 10, 12, 15, 20]  # thresholds solved for the slider
MAX_WALK_MINUTES = max(WALK_MINUTES)
