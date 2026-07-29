r"""Export the precomputed pipeline outputs as static JSON for the dashboard.

The API in api.py is a thin read-only layer over files that never change
between runs of the pipeline. That means it doesn't need to be a running
server at all — every response it can produce is knowable ahead of time.
This script materializes them as flat files under the frontend's
`public/data/`, so the dashboard can be deployed as a pure static site
with no backend to host, wake up, or pay for.

Re-run this whenever the pipeline is re-run:
    .\.venv\Scripts\python.exe analysis/export_static.py
"""
import json
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import geopandas as gpd
import pandas as pd

import config as C

_FRONTEND = Path(__file__).resolve().parent.parent / "frontend"

# Both frontends in the repo read the same exported data, so write it to each.
# They're separate apps with separate builds; neither can reach into the
# other's public/ directory, and Vite only serves files under it.
OUT_DIRS = [
    _FRONTEND / "pudo-accra" / "public" / "data",
    _FRONTEND / "public" / "data",
]

# Coordinates are exported at 5 decimal places (~1 m at the equator), which is
# far finer than the 250 m candidate spacing and keeps the payload small.
COORD_DP = 5

# Cumulative coverage needs more precision than it appears to. The frontend
# picks the node set by finding the first rank whose cum_pct clears the
# target, so rounding here moves that boundary: at 2 dp, a node truly at
# 94.9951% rounds to 95.00, clears a 95% target early, and the selection comes
# up ~11 nodes short of the pipeline's own answer. 4 dp keeps the error well
# below one node.
PCT_DP = 4


def _write(name: str, payload: dict) -> None:
    """Write `payload` as compact JSON to every output directory."""
    # separators=(",", ":") strips the whitespace json.dump adds by default —
    # on the 10 500-node file that alone is worth several hundred kilobytes.
    text = json.dumps(payload, separators=(",", ":"))
    for out in OUT_DIRS:
        (out / name).write_text(text, encoding="utf-8")
    print(f"  {name:<24} {len(text.encode('utf-8')) / 1024:>8.1f} KB")


def export_summary() -> list[int]:
    """Study-area totals and the walking-time thresholds solved for."""
    s = json.loads((C.OUTPUTS / "summary.json").read_text())
    minutes = sorted(int(t) for t in s["thresholds"])

    _write("summary.json", {
        "total_pop": round(s["total_pop"]),
        "walk_speed_m_min": C.WALK_SPEED_M_MIN,
        "minutes": minutes,
        "thresholds": {
            str(m): {
                "coverable_pct": round(s["thresholds"][str(m)]["coverable_pct"], 1),
                "nodes_total": s["thresholds"][str(m)]["nodes_total"],
                "walk_meters": round(m * C.WALK_SPEED_M_MIN),
            }
            for m in minutes
        },
    })
    return minutes


def export_nodes(minutes: list[int]) -> None:
    """One file per walking-time threshold, holding the full greedy ranking.

    api.py's /api/nodes takes a coverage target and returns the first k
    nodes. Since the ranking is greedy, *every* coverage target is a prefix
    of the same list — so shipping the whole ranked list once lets the client
    answer any coverage question locally, with no request per slider move.

    Rows are arrays rather than objects: at 10 500 nodes, repeating five key
    names per row costs more than the data itself.
    """
    sol = pd.read_parquet(C.OUTPUTS / "solutions.parquet")

    for m in minutes:
        s = sol[sol["minutes"] == m].sort_values("rank")
        _write(f"nodes-{m}.json", {
            "minutes": m,
            "walk_meters": round(m * C.WALK_SPEED_M_MIN),
            "fields": ["rank", "lat", "lon", "people_served", "cum_pct"],
            "rows": [
                [
                    int(r.rank),
                    round(float(r.lat), COORD_DP),
                    round(float(r.lon), COORD_DP),
                    round(float(r.pop_gain)),
                    round(float(r.cum_pct), PCT_DP),
                ]
                for r in s.itertuples()
            ],
        })


def export_boundary() -> None:
    """Study-area outline (Greater Accra + Kasoa) as GeoJSON."""
    b = gpd.read_file(C.PROCESSED / "study_area.gpkg")
    _write("boundary.geojson", json.loads(b.to_json()))


def export_exclusions() -> None:
    """Exclusion zones (water, wetland, industrial, ...) as GeoJSON.

    Simplified with the same tolerance api.py used, to keep the browser from
    having to draw ~1k full-resolution polygons.
    """
    exc = gpd.read_file(C.PROCESSED / "exclusions.gpkg")
    exc["geometry"] = exc.geometry.simplify(0.0005, preserve_topology=True)
    _write("exclusions.geojson", json.loads(exc[["category", "geometry"]].to_json()))


def main() -> None:
    missing = [
        p for p in (
            C.OUTPUTS / "summary.json",
            C.OUTPUTS / "solutions.parquet",
            C.PROCESSED / "study_area.gpkg",
            C.PROCESSED / "exclusions.gpkg",
        ) if not p.exists()
    ]
    if missing:
        raise SystemExit(
            "Missing pipeline output(s):\n"
            + "\n".join(f"  - {p}" for p in missing)
            + "\n\nRun the pipeline first (see analysis/README.md)."
        )

    for out in OUT_DIRS:
        if out.exists():
            shutil.rmtree(out)
        out.mkdir(parents=True)

    print("Exporting static data ->")
    for out in OUT_DIRS:
        print(f"  {out}")
    print()

    minutes = export_summary()
    export_nodes(minutes)
    export_boundary()
    export_exclusions()

    files = list(OUT_DIRS[0].iterdir())
    total = sum(f.stat().st_size for f in files) / 1024 / 1024
    print(f"\nDone. {len(files)} files, {total:.1f} MB, written to {len(OUT_DIRS)} locations.")


if __name__ == "__main__":
    main()
