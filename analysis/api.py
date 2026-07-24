"""PUDO Network Planner — JSON/GeoJSON API for the React frontend.

Serves the precomputed pipeline outputs (analysis/outputs, analysis/data/processed)
so the frontend never re-runs the heavy analysis. All the real work already happened
in run_pipeline.py; this is a thin read-only layer on top of it.

Run with:
    .\.venv\Scripts\python.exe -m uvicorn analysis.api:app --reload --port 8000
"""
import json
import sys
from functools import lru_cache
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import geopandas as gpd
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import config as C

app = FastAPI(title="Accra PUDO Planner API", version="1.0")

# The Vite dev server runs on 5173 (and 4173 for `vite preview`).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:4173", "http://127.0.0.1:4173",
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------- data loaders
@lru_cache(maxsize=1)
def _solutions() -> pd.DataFrame:
    return pd.read_parquet(C.OUTPUTS / "solutions.parquet")


@lru_cache(maxsize=1)
def _summary() -> dict:
    return json.loads((C.OUTPUTS / "summary.json").read_text())


@lru_cache(maxsize=1)
def _boundary_geojson() -> dict:
    b = gpd.read_file(C.PROCESSED / "study_area.gpkg")
    return json.loads(b.to_json())


@lru_cache(maxsize=1)
def _exclusions_geojson() -> dict:
    exc = gpd.read_file(C.PROCESSED / "exclusions.gpkg")
    # Simplify a touch to keep the payload light for the browser (~1k polygons).
    exc["geometry"] = exc.geometry.simplify(0.0005, preserve_topology=True)
    return json.loads(exc[["category", "geometry"]].to_json())


# ---------------------------------------------------------------- endpoints
@app.get("/api/summary")
def summary():
    """Study-area totals + the walking-time thresholds the pipeline solved for."""
    s = _summary()
    thresholds = sorted(int(t) for t in s["thresholds"])
    return {
        "total_pop": round(s["total_pop"]),
        "walk_speed_m_min": C.WALK_SPEED_M_MIN,
        "minutes": thresholds,
        "thresholds": {
            str(m): {
                "coverable_pct": round(s["thresholds"][str(m)]["coverable_pct"], 1),
                "nodes_total": s["thresholds"][str(m)]["nodes_total"],
            }
            for m in thresholds
        },
    }


@app.get("/api/nodes")
def nodes(
    minutes: int = Query(10, description="Max walking time to a node (min)"),
    coverage: float = Query(95, ge=1, le=100, description="Population coverage target (%)"),
):
    """Greedy-optimal PUDO node set for a walking-time + coverage target.

    The pipeline stored a greedy ranking over the whole study area (Greater
    Accra + Kasoa as one), so the solution for *any* coverage target is just
    the first k nodes.
    """
    s = _summary()
    if str(minutes) not in s["thresholds"]:
        raise HTTPException(400, f"minutes must be one of {sorted(int(t) for t in s['thresholds'])}")

    total_pop = s["total_pop"]
    coverable_pct = s["thresholds"][str(minutes)]["coverable_pct"]

    sol = _solutions()
    sol = sol[sol["minutes"] == minutes].sort_values("rank")

    target_pop = coverage / 100 * total_pop
    cum = sol["cum_pop"].values
    if cum[-1] >= target_pop:
        k = int(np.searchsorted(cum, target_pop - 1e-6) + 1)
        feasible = True
    else:
        k = len(sol)
        feasible = False
    chosen = sol.head(k)
    achieved_pct = float(chosen["cum_pct"].iloc[-1])

    node_list = [
        {
            "rank": int(r.rank),
            "lat": float(r.lat),
            "lon": float(r.lon),
            "people_served": round(float(r.pop_gain)),
            "cum_pct": round(float(r.cum_pct), 2),
        }
        for r in chosen.itertuples()
    ]

    return {
        "minutes": minutes,
        "coverage_target": coverage,
        "achieved_pct": round(achieved_pct, 1),
        "coverable_pct": round(coverable_pct, 1),
        "feasible": feasible,
        "nodes_needed": k,
        "walk_meters": round(minutes * C.WALK_SPEED_M_MIN),
        "nodes": node_list,
    }


@app.get("/api/boundary")
def boundary():
    """Study-area outline as GeoJSON."""
    return _boundary_geojson()


@app.get("/api/exclusions")
def exclusions():
    """Exclusion zones (water, wetland, industrial, …) as GeoJSON."""
    return _exclusions_geojson()


@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs",
            "endpoints": ["/api/summary", "/api/nodes", "/api/boundary", "/api/exclusions"]}
