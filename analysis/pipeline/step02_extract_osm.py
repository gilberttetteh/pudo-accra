"""Step 2 — extract the walking network and exclusion zones from the Ghana PBF.

Outputs (in data/processed/):
* nodes.parquet   — node_idx, osm_id, lon, lat (walkable graph vertices)
* edges.parquet   — u, v, length_m (undirected walking edges)
* exclusions.gpkg — polygons where a PUDO node may NOT be placed, by category
"""
import sys
from pathlib import Path

import geopandas as gpd
import numpy as np
import osmium
import pandas as pd
import shapely.wkb as swkb
from shapely.geometry import LineString, Point, box
from shapely.prepared import prep

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import config as C

WKB_FACTORY = osmium.geom.WKBFactory()

# category rules applied to closed ways / multipolygon relations
def classify_area(tags) -> str | None:
    natural = tags.get("natural")
    landuse = tags.get("landuse")
    if natural == "water" or landuse in ("reservoir", "basin") or tags.get("waterway") == "riverbank":
        return "water"
    if natural == "wetland":
        return "wetland"
    if natural == "wood" or landuse == "forest":
        return "forest"
    if landuse == "industrial":
        return "industrial"
    if landuse == "military" or "military" in tags:
        return "military"
    if tags.get("aeroway") == "aerodrome":
        return "airport"
    if landuse == "cemetery" or tags.get("amenity") == "grave_yard":
        return "cemetery"
    if landuse in ("landfill", "quarry"):
        return "landfill"
    return None


class ExtractHandler(osmium.SimpleHandler):
    def __init__(self, bbox):
        super().__init__()
        self.minx, self.miny, self.maxx, self.maxy = bbox
        self.way_nodes: list[list[tuple[int, float, float]]] = []
        self.areas: list[tuple[str, bytes]] = []
        self.rivers: list[LineString] = []           # waterway centre-lines
        self.public_refs: set[int] = set()           # node refs on public walk network
        self.private_coord: dict[int, tuple] = {}    # node ref -> (lon, lat) on gated roads
        self.n_ways_seen = 0

    def _in_bbox(self, lon, lat) -> bool:
        return self.minx <= lon <= self.maxx and self.miny <= lat <= self.maxy

    def way(self, w):
        # --- waterway centre-lines (rivers/canals) become exclusion strips ---
        ww = w.tags.get("waterway")
        if ww in ("river", "canal"):
            pts = [(n.location.lon, n.location.lat) for n in w.nodes if n.location.valid()]
            if len(pts) >= 2 and any(self._in_bbox(x, y) for x, y in pts):
                self.rivers.append(LineString(pts))
            return

        hw = w.tags.get("highway")
        if hw not in C.WALKABLE_HIGHWAYS:
            return
        if w.tags.get("foot") == "no":
            return
        pts = [
            (n.ref, n.location.lon, n.location.lat)
            for n in w.nodes
            if n.location.valid()
        ]
        if len(pts) < 2:
            return
        # cheap prefilter: keep the way if any vertex is inside the study bbox
        if not any(self._in_bbox(lon, lat) for _, lon, lat in pts):
            return

        access = w.tags.get("access")
        gated = access in ("private", "no") and w.tags.get("foot") not in (
            "yes", "designated", "permissive"
        )
        if gated:
            # A customer can't walk the internal roads, but the PUDO goes at the
            # GATE — the node where this private road meets the public network.
            # Record its nodes; the intersection with public_refs is the gate.
            for ref, lon, lat in pts:
                self.private_coord[ref] = (lon, lat)
            return

        for ref, lon, lat in pts:
            self.public_refs.add(ref)
        self.way_nodes.append(pts)
        self.n_ways_seen += 1

    def area(self, a):
        cat = classify_area(a.tags)
        if cat is None:
            return
        try:
            wkb_hex = WKB_FACTORY.create_multipolygon(a)
        except RuntimeError:
            return
        geom = swkb.loads(bytes.fromhex(wkb_hex))
        gminx, gminy, gmaxx, gmaxy = geom.bounds
        if gmaxx < self.minx or gminx > self.maxx or gmaxy < self.miny or gminy > self.maxy:
            return
        self.areas.append((cat, geom))


def haversine_m(lon1, lat1, lon2, lat2):
    R = 6371008.8
    lon1, lat1, lon2, lat2 = map(np.radians, (lon1, lat1, lon2, lat2))
    dlon, dlat = lon2 - lon1, lat2 - lat1
    a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
    return 2 * R * np.arcsin(np.sqrt(a))


def main():
    boundary = gpd.read_file(C.PROCESSED / "study_area.gpkg")
    study_poly = boundary.geometry.iloc[0]
    pad = 0.02  # ~2 km of margin so edge roads stay routable
    minx, miny, maxx, maxy = study_poly.bounds
    bbox = (minx - pad, miny - pad, maxx + pad, maxy + pad)

    print(f"parsing {C.PBF_PATH.name} (bbox {bbox}) ...")
    h = ExtractHandler(bbox)
    h.apply_file(str(C.PBF_PATH), locations=True, idx="flex_mem")
    print(f"walkable ways in bbox: {h.n_ways_seen}, exclusion areas: {len(h.areas)}")

    # ---------------------------------------------------------- build graph
    print("building graph ...")
    node_ids: dict[int, int] = {}
    lons: list[float] = []
    lats: list[float] = []
    edges_u: list[int] = []
    edges_v: list[int] = []

    for pts in h.way_nodes:
        prev = None
        for ref, lon, lat in pts:
            idx = node_ids.get(ref)
            if idx is None:
                idx = len(lons)
                node_ids[ref] = idx
                lons.append(lon)
                lats.append(lat)
            if prev is not None and prev != idx:
                edges_u.append(prev)
                edges_v.append(idx)
            prev = idx

    lons_a = np.array(lons)
    lats_a = np.array(lats)
    u = np.array(edges_u, dtype=np.int64)
    v = np.array(edges_v, dtype=np.int64)
    length = haversine_m(lons_a[u], lats_a[u], lons_a[v], lats_a[v])
    print(f"raw graph: {len(lons_a):,} nodes, {len(u):,} edges")

    # keep only nodes inside the padded study area (precise clip)
    clip_poly = prep(box(*bbox).intersection(study_poly.buffer(pad)))
    import shapely.geometry as sg

    keep = np.fromiter(
        (clip_poly.contains(sg.Point(x, y)) for x, y in zip(lons_a, lats_a)),
        dtype=bool,
        count=len(lons_a),
    )
    remap = -np.ones(len(lons_a), dtype=np.int64)
    remap[keep] = np.arange(keep.sum())
    e_keep = keep[u] & keep[v]
    u2, v2, len2 = remap[u[e_keep]], remap[v[e_keep]], length[e_keep]
    lons_a, lats_a = lons_a[keep], lats_a[keep]
    print(f"clipped graph: {len(lons_a):,} nodes, {len(u2):,} edges")

    # giant connected component (drop unreachable fragments)
    from scipy.sparse import coo_matrix
    from scipy.sparse.csgraph import connected_components

    n = len(lons_a)
    g = coo_matrix((np.ones(len(u2)), (u2, v2)), shape=(n, n))
    n_comp, labels = connected_components(g, directed=False)
    sizes = np.bincount(labels)
    giant = sizes.argmax()
    keep2 = labels == giant
    print(
        f"components: {n_comp}; giant holds {keep2.sum():,}/{n:,} nodes "
        f"({100*keep2.mean():.1f}%)"
    )
    remap2 = -np.ones(n, dtype=np.int64)
    remap2[keep2] = np.arange(keep2.sum())
    e_keep2 = keep2[u2] & keep2[v2]
    u3, v3, len3 = remap2[u2[e_keep2]], remap2[v2[e_keep2]], len2[e_keep2]
    lons_a, lats_a = lons_a[keep2], lats_a[keep2]

    pd.DataFrame({"lon": lons_a, "lat": lats_a}).to_parquet(C.PROCESSED / "nodes.parquet")
    pd.DataFrame({"u": u3, "v": v3, "length_m": len3}).to_parquet(C.PROCESSED / "edges.parquet")
    print(f"final graph: {len(lons_a):,} nodes, {len(u3):,} edges — written")

    # ---------------------------------------------------------- gates
    # A gate = a node shared by a gated/private road and the public network.
    # That is exactly where residents of a gated estate exit onto a public
    # street, so it is where their PUDO should sit.
    gate_refs = set(h.private_coord) & h.public_refs
    if gate_refs:
        gate_pts = [h.private_coord[r] for r in gate_refs]
        gates = gpd.GeoDataFrame(
            geometry=[Point(lon, lat) for lon, lat in gate_pts], crs=C.CRS_WGS84
        )
        gates = gates[gates.within(study_poly)]
        pd.DataFrame(
            {"lon": gates.geometry.x.values, "lat": gates.geometry.y.values}
        ).to_parquet(C.PROCESSED / "gates.parquet")
        print(f"gated-community gates found: {len(gates):,} — written")
    else:
        pd.DataFrame({"lon": [], "lat": []}).to_parquet(C.PROCESSED / "gates.parquet")
        print("no gated-community gates detected")

    # ---------------------------------------------------------- exclusions
    print("clipping exclusion areas ...")
    parts = []
    if h.areas:
        cats, geoms = zip(*h.areas)
        parts.append(gpd.GeoDataFrame({"category": list(cats)}, geometry=list(geoms), crs=C.CRS_WGS84))
    if h.rivers:
        riv = gpd.GeoSeries(h.rivers, crs=C.CRS_WGS84).to_crs(C.CRS_METRIC)
        riv = riv.buffer(C.RIVER_BUFFER_M).to_crs(C.CRS_WGS84)
        parts.append(gpd.GeoDataFrame({"category": ["river"] * len(riv)}, geometry=riv.values, crs=C.CRS_WGS84))

    if parts:
        exc = pd.concat(parts, ignore_index=True)
        exc = gpd.GeoDataFrame(exc, geometry="geometry", crs=C.CRS_WGS84)
        exc = exc[exc.intersects(study_poly)].copy()
        exc["geometry"] = exc.geometry.intersection(study_poly)
        exc = exc[~exc.geometry.is_empty]
        exc.to_file(C.PROCESSED / "exclusions.gpkg", driver="GPKG")
        print(exc["category"].value_counts().to_string())
        print(f"exclusions written: {len(exc)} polygons")
    else:
        print("WARNING: no exclusion areas found")
    print("STEP 2 COMPLETE")


if __name__ == "__main__":
    main()
