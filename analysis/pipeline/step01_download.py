"""Step 1 — download raw data.

* Study-area boundary (Greater Accra Region + Kasoa) from Nominatim.
* Ghana OSM extract (.pbf) from Geofabrik.
* WorldPop 2020 population raster for Ghana.
"""
import sys
import time
from pathlib import Path

import geopandas as gpd
import pandas as pd
import requests
from shapely.geometry import shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import config as C

NOMINATIM = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "accra-pudo-planning/0.1 (research; pinglist.co@gmail.com)"}


def geocode_polygon(query: str):
    """Return (geometry, class) for the top Nominatim hit with polygon output."""
    params = {"q": query, "format": "jsonv2", "polygon_geojson": 1, "limit": 1}
    r = requests.get(NOMINATIM, params=params, headers=HEADERS, timeout=60)
    r.raise_for_status()
    hits = r.json()
    if not hits:
        return None, None
    hit = hits[0]
    return shape(hit["geojson"]), hit["geojson"]["type"]


def build_boundary() -> gpd.GeoDataFrame:
    out = C.PROCESSED / "study_area.gpkg"
    if out.exists():
        print(f"boundary: {out} exists, skipping")
        return gpd.read_file(out)

    print("geocoding Greater Accra Region ...")
    ga_geom, ga_type = geocode_polygon(C.GREATER_ACCRA_QUERY)
    if ga_geom is None or "Polygon" not in ga_type:
        raise RuntimeError("Could not geocode Greater Accra Region as a polygon")
    time.sleep(1.5)  # Nominatim rate limit

    kasoa_geom = None
    for q in C.KASOA_QUERIES:
        print(f"geocoding {q!r} ...")
        geom, gtype = geocode_polygon(q)
        time.sleep(1.5)
        if geom is None:
            continue
        if "Polygon" in gtype:
            kasoa_geom = geom
            break
        # point fallback: buffer in metric CRS
        pt = gpd.GeoSeries([geom], crs=C.CRS_WGS84).to_crs(C.CRS_METRIC)
        kasoa_geom = pt.buffer(C.KASOA_POINT_BUFFER_M).to_crs(C.CRS_WGS84).iloc[0]
        break
    if kasoa_geom is None:
        raise RuntimeError("Could not geocode Kasoa at all")

    union = unary_union([ga_geom, kasoa_geom])
    gdf = gpd.GeoDataFrame(
        {"name": ["Greater Accra + Kasoa"]}, geometry=[union], crs=C.CRS_WGS84
    )
    gdf.to_file(out, driver="GPKG")
    parts = gpd.GeoDataFrame(
        {"name": ["Greater Accra Region", "Kasoa"]},
        geometry=[ga_geom, kasoa_geom],
        crs=C.CRS_WGS84,
    )
    parts.to_file(C.PROCESSED / "study_area_parts.gpkg", driver="GPKG")
    print(f"boundary written: {out}")
    return gdf


def download(url: str, dest: Path, label: str) -> bool:
    if dest.exists() and dest.stat().st_size > 0:
        print(f"{label}: {dest.name} exists ({dest.stat().st_size/1e6:.1f} MB), skipping")
        return True
    tmp = dest.with_suffix(dest.suffix + ".part")
    print(f"{label}: downloading {url}")
    try:
        with requests.get(url, stream=True, timeout=120, headers=HEADERS) as r:
            r.raise_for_status()
            total = int(r.headers.get("content-length", 0))
            done = 0
            with open(tmp, "wb") as f:
                for chunk in r.iter_content(chunk_size=1 << 20):
                    f.write(chunk)
                    done += len(chunk)
                    if total:
                        pct = 100 * done / total
                        if done % (50 << 20) < (1 << 20):
                            print(f"  {label}: {pct:5.1f}% ({done/1e6:.0f} MB)")
        tmp.rename(dest)
        print(f"{label}: done ({dest.stat().st_size/1e6:.1f} MB)")
        return True
    except Exception as e:  # noqa: BLE001
        print(f"{label}: FAILED — {e}")
        tmp.unlink(missing_ok=True)
        return False


def main():
    build_boundary()
    ok_pbf = download(C.GEOFABRIK_PBF_URL, C.PBF_PATH, "osm-pbf")
    ok_pop = False
    for url in C.WORLDPOP_URLS:
        if download(url, C.WORLDPOP_PATH, "worldpop"):
            ok_pop = True
            break
    if not (ok_pbf and ok_pop):
        raise SystemExit("download step incomplete — see messages above")
    print("STEP 1 COMPLETE")


if __name__ == "__main__":
    main()
