# PUDO Coverage Analysis — Greater Accra + Kasoa

Answers one question: **how many PUDO nodes do we need so that everyone is within
X minutes' walk of one — and where do they go?** X is adjustable (5–20 min), and
nodes are never placed in water bodies, wetlands, industrial/military zones,
airports, cemeteries or landfills.

## How it works

1. **step01_download** — study-area boundary (Nominatim), Ghana OSM extract
   (Geofabrik), WorldPop 2020 population raster.
2. **step02_extract_osm** — parses the PBF into a pedestrian road graph
   (walkable highway types, private/gated roads removed) and exclusion polygons.
3. **step03_demand** — every populated 100 m WorldPop cell becomes a demand
   point snapped to the nearest road node.
4. **step04_candidates** — candidate PUDO sites = road nodes inside the study
   area, outside exclusion zones, thinned to 250 m spacing (junctions preferred).
5. **step05_solve** — network walking times (80 m/min) from every candidate,
   then lazy-greedy weighted set cover per threshold (5/7/10/12/15/20 min).
   The greedy order gives the solution for *any* coverage target instantly.

## Run it

```powershell
# from the repo root
.\.venv\Scripts\python.exe analysis\run_pipeline.py   # ~15-30 min first run
.\.venv\Scripts\python.exe -m streamlit run analysis\app.py
```

The app has two sliders — walking minutes and coverage % — a map with the
selected nodes, the exclusion zones, and the nodes-vs-minutes curve. Node
lists export as CSV.

## Knobs (analysis/config.py)

- `WALK_MINUTES` — thresholds solved
- `WALK_SPEED_M_MIN` — walking speed (default 4.8 km/h)
- `CANDIDATE_SPACING_M` — candidate density (default 250 m)
- `EXCLUSION_BUFFER_M` — safety margin around exclusion zones

## Known limitations (deliberate, for this phase)

- Flood-prone areas are proxied by OSM wetlands + water buffers — a proper
  flood layer (Sentinel-1 / Ghana Hydrological Authority) comes later.
- Gated communities are only excluded where OSM marks roads private.
- Greedy set cover is near-optimal (typically within a few % of the ILP
  optimum) — an exact solver can be added for the final numbers.
