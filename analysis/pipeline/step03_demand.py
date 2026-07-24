"""Step 3 — build demand points from the WorldPop raster.

Every populated 100 m cell inside the study area becomes a demand point,
snapped to its nearest walking-network node. Output:

* demand.parquet — node_idx, pop  (population aggregated per network node)
* demand_cells.parquet — lon, lat, pop (raw cells, for map display)
"""
import sys
from pathlib import Path

import geopandas as gpd
import numpy as np
import pandas as pd
import rasterio
import rasterio.mask
from pyproj import Transformer
from scipy.spatial import cKDTree

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import config as C


def main():
    boundary = gpd.read_file(C.PROCESSED / "study_area.gpkg")
    study_poly = boundary.geometry.iloc[0]

    print("masking WorldPop raster to study area ...")
    with rasterio.open(C.WORLDPOP_PATH) as src:
        arr, transform = rasterio.mask.mask(src, [study_poly], crop=True, nodata=src.nodata)
    band = arr[0]
    nodata = band.min() if band.min() < 0 else None
    valid = (band > 0) & np.isfinite(band)
    if nodata is not None:
        valid &= band != nodata
    valid &= band >= C.MIN_CELL_POP

    rows, cols = np.where(valid)
    pops = band[rows, cols].astype(np.float64)
    xs, ys = rasterio.transform.xy(transform, rows, cols)
    xs, ys = np.array(xs), np.array(ys)
    total_pop = float(pops.sum())
    print(f"populated cells: {len(pops):,}, total population: {total_pop:,.0f}")

    # snap to nearest network node in metric CRS
    nodes = pd.read_parquet(C.PROCESSED / "nodes.parquet")
    to_m = Transformer.from_crs(C.CRS_WGS84, C.CRS_METRIC, always_xy=True)
    nx, ny = to_m.transform(nodes["lon"].values, nodes["lat"].values)
    cx, cy = to_m.transform(xs, ys)

    tree = cKDTree(np.column_stack([nx, ny]))
    dist, nearest = tree.query(np.column_stack([cx, cy]))

    ok = dist <= C.DEMAND_SNAP_MAX_M
    dropped_pop = float(pops[~ok].sum())
    print(
        f"cells >{C.DEMAND_SNAP_MAX_M:.0f} m from any road: {(~ok).sum():,} "
        f"({dropped_pop:,.0f} people, {100*dropped_pop/total_pop:.2f}% — dropped)"
    )

    demand = (
        pd.DataFrame({"node_idx": nearest[ok], "pop": pops[ok]})
        .groupby("node_idx", as_index=False)["pop"]
        .sum()
    )
    demand.to_parquet(C.PROCESSED / "demand.parquet")
    pd.DataFrame({"lon": xs[ok], "lat": ys[ok], "pop": pops[ok]}).to_parquet(
        C.PROCESSED / "demand_cells.parquet"
    )
    print(
        f"demand nodes: {len(demand):,}, population kept: {demand['pop'].sum():,.0f}"
    )
    print("STEP 3 COMPLETE")


if __name__ == "__main__":
    main()
