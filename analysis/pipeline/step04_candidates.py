"""Step 4 — generate candidate PUDO sites.

Candidates are walking-network nodes that:
* lie inside the study area,
* are NOT inside any exclusion polygon (buffered),
* are spaced at least CANDIDATE_SPACING_M apart (grid thinning),
* prefer junctions (higher street connectivity) within each grid cell.

Output: candidates.parquet — node_idx, lon, lat
"""
import sys
from pathlib import Path

import geopandas as gpd
import numpy as np
import pandas as pd
from pyproj import Transformer
from scipy.spatial import cKDTree

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import config as C


def main():
    nodes = pd.read_parquet(C.PROCESSED / "nodes.parquet")
    edges = pd.read_parquet(C.PROCESSED / "edges.parquet")
    boundary = gpd.read_file(C.PROCESSED / "study_area.gpkg")
    study_poly = boundary.geometry.iloc[0]

    n = len(nodes)
    degree = np.bincount(edges["u"], minlength=n) + np.bincount(edges["v"], minlength=n)

    print("filtering to study area ...")
    pts = gpd.GeoDataFrame(
        {"node_idx": np.arange(n), "degree": degree},
        geometry=gpd.points_from_xy(nodes["lon"], nodes["lat"]),
        crs=C.CRS_WGS84,
    )
    pts = pts[pts.within(study_poly)]
    print(f"nodes inside study area: {len(pts):,}")

    # remove nodes inside buffered exclusion zones
    exc_path = C.PROCESSED / "exclusions.gpkg"
    if exc_path.exists():
        exc = gpd.read_file(exc_path).to_crs(C.CRS_METRIC)
        exc["geometry"] = exc.geometry.buffer(C.EXCLUSION_BUFFER_M)
        pts_m = pts.to_crs(C.CRS_METRIC)
        hit = gpd.sjoin(pts_m, exc[["geometry"]], predicate="within", how="inner")
        bad = set(hit.index)
        print(f"nodes inside exclusion zones: {len(bad):,} — removed")
        pts = pts[~pts.index.isin(bad)]

    # grid thinning: one candidate per CANDIDATE_SPACING_M cell, prefer junctions
    to_m = Transformer.from_crs(C.CRS_WGS84, C.CRS_METRIC, always_xy=True)
    mx, my = to_m.transform(pts.geometry.x.values, pts.geometry.y.values)
    cell = (
        (mx // C.CANDIDATE_SPACING_M).astype(np.int64) * 10_000_000
        + (my // C.CANDIDATE_SPACING_M).astype(np.int64)
    )
    df = pd.DataFrame(
        {
            "node_idx": pts["node_idx"].values,
            "degree": pts["degree"].values,
            "cell": cell,
            "lon": pts.geometry.x.values,
            "lat": pts.geometry.y.values,
        }
    )
    best = df.sort_values("degree", ascending=False).drop_duplicates("cell")
    cand = best[["node_idx", "lon", "lat"]].copy()

    # force-include gated-community gate nodes (bypass thinning/exclusion so
    # every detected gate always gets a candidate PUDO right at the entrance)
    gates_path = C.PROCESSED / "gates.parquet"
    if gates_path.exists():
        gates = pd.read_parquet(gates_path)
        if len(gates):
            nx_all, ny_all = to_m.transform(nodes["lon"].values, nodes["lat"].values)
            gx, gy = to_m.transform(gates["lon"].values, gates["lat"].values)
            tree = cKDTree(np.column_stack([nx_all, ny_all]))
            dist, idx = tree.query(np.column_stack([gx, gy]))
            gate_idx = np.unique(idx[dist <= 10.0])  # within 10 m of a real node
            new_idx = np.setdiff1d(gate_idx, cand["node_idx"].values)
            if len(new_idx):
                add = pd.DataFrame(
                    {
                        "node_idx": new_idx,
                        "lon": nodes["lon"].values[new_idx],
                        "lat": nodes["lat"].values[new_idx],
                    }
                )
                cand = pd.concat([cand, add], ignore_index=True)
            print(f"gate candidates forced in: {len(new_idx):,} (of {len(gates):,} gates)")

    cand.reset_index(drop=True).to_parquet(C.PROCESSED / "candidates.parquet")
    print(f"candidate sites: {len(cand):,} (spacing {C.CANDIDATE_SPACING_M:.0f} m + gates)")
    print("STEP 4 COMPLETE")


if __name__ == "__main__":
    main()
