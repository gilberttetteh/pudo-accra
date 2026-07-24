"""PUDO Network Planner — interactive coverage explorer.

Run with:  streamlit run analysis/app.py
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import geopandas as gpd
import numpy as np
import pandas as pd
import plotly.graph_objects as go
import pydeck as pdk
import streamlit as st

import config as C

st.set_page_config(page_title="Accra PUDO Planner", page_icon="📍", layout="wide")


# ---------------------------------------------------------------- data
@st.cache_data
def load_data():
    solutions = pd.read_parquet(C.OUTPUTS / "solutions.parquet")
    summary = json.loads((C.OUTPUTS / "summary.json").read_text())
    boundary = gpd.read_file(C.PROCESSED / "study_area.gpkg")
    exc_path = C.PROCESSED / "exclusions.gpkg"
    exclusions = gpd.read_file(exc_path) if exc_path.exists() else None
    cells = pd.read_parquet(C.PROCESSED / "demand_cells.parquet")
    return solutions, summary, boundary, exclusions, cells


try:
    solutions, summary, boundary, exclusions, cells = load_data()
except FileNotFoundError as e:
    st.error(f"Missing pipeline output: {e}. Run the pipeline first (see analysis/README.md).")
    st.stop()

total_pop = summary["total_pop"]
thresholds = sorted(int(t) for t in summary["thresholds"])

# ---------------------------------------------------------------- sidebar
st.sidebar.title("📍 PUDO Planner")
st.sidebar.caption("Greater Accra Region + Kasoa")

minutes = st.sidebar.select_slider(
    "Max walking time to a PUDO node", options=thresholds, value=10,
    format_func=lambda m: f"{m} min",
)
target_pct = st.sidebar.slider("Population coverage target", 50, 100, 95, step=1,
                               format="%d%%")

show_exclusions = st.sidebar.checkbox("Show exclusion zones (water, industrial…)", True)
show_demand = st.sidebar.checkbox("Show population density", False)

thr_info = summary["thresholds"][str(minutes)]
coverable_pct = thr_info["coverable_pct"]

sol = solutions[solutions["minutes"] == minutes]
target_pop = target_pct / 100 * total_pop
cum = sol["cum_pop"].values
if cum[-1] >= target_pop:
    k = int(np.searchsorted(cum, target_pop - 1e-6) + 1)
    achieved_pct = sol["cum_pct"].values[k - 1]
    feasible = True
else:
    k = len(sol)
    achieved_pct = sol["cum_pct"].values[-1]
    feasible = False
chosen = sol.head(k)

# ---------------------------------------------------------------- header
st.title("Accra PUDO Network Planner")
c1, c2, c3, c4 = st.columns(4)
c1.metric("Walking time", f"{minutes} min", f"≈ {minutes * C.WALK_SPEED_M_MIN:,.0f} m walk")
c2.metric("PUDO nodes needed", f"{k:,}")
c3.metric("Population covered", f"{achieved_pct:.1f}%", f"{chosen['cum_pop'].iloc[-1]:,.0f} people")
c4.metric("Max reachable at this time", f"{coverable_pct:.1f}%")

if not feasible:
    st.warning(
        f"A {target_pct}% target is not reachable with {minutes} min walking — "
        f"only {coverable_pct:.1f}% of the population has any candidate site within "
        f"{minutes} min. Showing the full {k:,}-node solution ({achieved_pct:.1f}%)."
    )

# ---------------------------------------------------------------- map
layers = []

if show_demand:
    layers.append(
        pdk.Layer(
            "HeatmapLayer",
            cells.sample(min(len(cells), 150_000), random_state=0),
            get_position=["lon", "lat"],
            get_weight="pop",
            radius_pixels=30,
            opacity=0.35,
        )
    )

if show_exclusions and exclusions is not None:
    palette = {
        "water": [46, 134, 222, 120],
        "wetland": [72, 201, 176, 110],
        "industrial": [149, 165, 166, 110],
        "military": [231, 76, 60, 100],
        "airport": [155, 89, 182, 100],
        "cemetery": [127, 140, 141, 100],
        "landfill": [211, 84, 0, 100],
    }
    exc = exclusions.copy()
    exc["fill"] = exc["category"].map(lambda c: palette.get(c, [120, 120, 120, 90]))
    layers.append(
        pdk.Layer(
            "GeoJsonLayer",
            json.loads(exc.to_json()),
            get_fill_color="properties.fill",
            get_line_color=[255, 255, 255, 60],
            line_width_min_pixels=0.5,
            pickable=True,
            stroked=True,
            filled=True,
        )
    )

# study boundary outline
layers.append(
    pdk.Layer(
        "GeoJsonLayer",
        json.loads(boundary.boundary.to_frame("geometry").to_json()),
        get_line_color=[80, 80, 80, 200],
        line_width_min_pixels=1.5,
        stroked=True,
        filled=False,
    )
)

# PUDO nodes — colored by rank (early picks = biggest impact)
nodes_df = chosen[["lon", "lat", "rank", "pop_gain", "cum_pct"]].copy()
nodes_df["radius"] = np.clip(np.sqrt(nodes_df["pop_gain"]) * 4, 60, 400)
layers.append(
    pdk.Layer(
        "ScatterplotLayer",
        nodes_df,
        get_position=["lon", "lat"],
        get_radius="radius",
        get_fill_color=[230, 57, 70, 200],
        get_line_color=[255, 255, 255, 255],
        line_width_min_pixels=1,
        stroked=True,
        pickable=True,
    )
)

view = pdk.ViewState(latitude=5.65, longitude=-0.2, zoom=10)
st.pydeck_chart(
    pdk.Deck(
        layers=layers,
        initial_view_state=view,
        map_style="light",
        tooltip={
            "html": "<b>PUDO node #{rank}</b><br>serves {pop_gain} people<br>"
                    "cumulative coverage: {cum_pct}%",
        },
    ),
    height=560,
)
st.caption(
    "Red dots = selected PUDO nodes (size ∝ population served). "
    "Blue = water, teal = wetland, grey = industrial. Nodes are never placed in these zones."
)

# ---------------------------------------------------------------- charts
left, right = st.columns(2)

with left:
    st.subheader("Nodes needed vs walking time")
    fig = go.Figure()
    for pct, dash in [(90, "dot"), (95, "solid"), (99, "dash")]:
        ys = []
        for t in thresholds:
            s = solutions[solutions["minutes"] == t]
            tp = pct / 100 * total_pop
            cc = s["cum_pop"].values
            ys.append(int(np.searchsorted(cc, tp - 1e-6) + 1) if cc[-1] >= tp else None)
        fig.add_trace(go.Scatter(x=thresholds, y=ys, mode="lines+markers",
                                 name=f"{pct}% coverage", line={"dash": dash}))
    fig.update_layout(xaxis_title="Max walking time (min)", yaxis_title="PUDO nodes needed",
                      height=380, margin=dict(l=10, r=10, t=10, b=10),
                      legend=dict(orientation="h", y=1.1))
    st.plotly_chart(fig, use_container_width=True)

with right:
    st.subheader(f"Coverage vs number of nodes ({minutes} min walk)")
    fig2 = go.Figure()
    fig2.add_trace(go.Scatter(x=sol["rank"], y=sol["cum_pct"], mode="lines",
                              name="coverage", fill="tozeroy"))
    fig2.add_vline(x=k, line_dash="dash", line_color="#e63946",
                   annotation_text=f"{k} nodes → {achieved_pct:.1f}%")
    fig2.update_layout(xaxis_title="Nodes (in greedy order)", yaxis_title="Population covered (%)",
                       height=380, margin=dict(l=10, r=10, t=10, b=10))
    st.plotly_chart(fig2, use_container_width=True)

# ---------------------------------------------------------------- table + download
with st.expander(f"Selected node list ({k:,} nodes)"):
    show = chosen[["rank", "lat", "lon", "pop_gain", "cum_pct"]].rename(
        columns={"pop_gain": "people_served", "cum_pct": "cumulative_%"}
    )
    st.dataframe(show, use_container_width=True, height=350)
    st.download_button(
        "Download as CSV",
        show.to_csv(index=False).encode(),
        file_name=f"pudo_nodes_{minutes}min_{target_pct}pct.csv",
        mime="text/csv",
    )

st.caption(
    "Method: WorldPop 2020 population · OSM walking network · network travel time "
    f"at {C.WALK_SPEED_M_MIN:.0f} m/min · greedy set cover (near-optimal). "
    "Candidate sites exclude water bodies, wetlands, industrial/military zones, "
    "airports, cemeteries and landfills."
)
