"""Step 5 — solve minimum-node coverage for each walking-time threshold.

For every threshold X in WALK_MINUTES:
  build the candidate→demand coverage relation (network walk time <= X min)
  run lazy-greedy set cover (CELF) weighted by population.

The greedy ordering doubles as the answer for ANY coverage target: the first
k nodes are the (near-optimal) solution for the coverage they reach, so the
app can slide both "minutes" and "% covered" instantly.

Outputs (in outputs/):
* solutions.parquet — minutes, rank, node_idx, lon, lat, pop_gain, cum_pop, cum_pct
* summary.json      — per-threshold totals, nodes needed at 80/90/95/99/100 %
"""
import json
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.sparse import coo_matrix, csr_matrix
from scipy.sparse.csgraph import dijkstra

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import config as C

CHUNK = 128  # dijkstra source chunk (keeps the dense buffer ~0.5 GB)


def build_graph():
    nodes = pd.read_parquet(C.PROCESSED / "nodes.parquet")
    edges = pd.read_parquet(C.PROCESSED / "edges.parquet")
    n = len(nodes)
    minutes = edges["length_m"].values / C.WALK_SPEED_M_MIN
    u, v = edges["u"].values, edges["v"].values
    g = coo_matrix(
        (np.concatenate([minutes, minutes]), (np.concatenate([u, v]), np.concatenate([v, u]))),
        shape=(n, n),
    ).tocsr()
    return nodes, g


def coverage_matrices(g, cand_nodes, demand_nodes):
    """Sparse bool matrices (n_candidates x n_demand), one per threshold."""
    n = g.shape[0]
    col_of = -np.ones(n, dtype=np.int64)
    col_of[demand_nodes] = np.arange(len(demand_nodes))

    per_thr_rows = {t: [] for t in C.WALK_MINUTES}
    per_thr_cols = {t: [] for t in C.WALK_MINUTES}

    t0 = time.time()
    for start in range(0, len(cand_nodes), CHUNK):
        idx = cand_nodes[start : start + CHUNK]
        dist = dijkstra(g, indices=idx, limit=C.MAX_WALK_MINUTES)
        sub = dist[:, demand_nodes]  # (chunk, n_demand)
        for t in C.WALK_MINUTES:
            r, c = np.nonzero(sub <= t)
            per_thr_rows[t].append(r + start)
            per_thr_cols[t].append(c)
        done = min(start + CHUNK, len(cand_nodes))
        if (start // CHUNK) % 10 == 0:
            rate = done / max(time.time() - t0, 1e-9)
            eta = (len(cand_nodes) - done) / max(rate, 1e-9)
            print(f"  dijkstra {done:,}/{len(cand_nodes):,} (eta {eta/60:.1f} min)")

    mats = {}
    for t in C.WALK_MINUTES:
        rows = np.concatenate(per_thr_rows[t])
        cols = np.concatenate(per_thr_cols[t])
        mats[t] = csr_matrix(
            (np.ones(len(rows), dtype=bool), (rows, cols)),
            shape=(len(cand_nodes), len(demand_nodes)),
        )
    return mats


def lazy_greedy(cov: csr_matrix, weights: np.ndarray):
    """CELF lazy-greedy weighted set cover. Returns (order, gains)."""
    import heapq

    n_cand = cov.shape[0]
    covered = np.zeros(cov.shape[1], dtype=bool)
    # initial gains
    gains = cov @ weights
    heap = [(-gains[i], i, 0) for i in range(n_cand) if gains[i] > 0]
    heapq.heapify(heap)

    order, gain_list = [], []
    iteration = 0
    while heap:
        neg_gain, i, when = heapq.heappop(heap)
        if when < iteration:
            cols = cov.indices[cov.indptr[i] : cov.indptr[i + 1]]
            fresh = float(weights[cols[~covered[cols]]].sum())
            if fresh > 0:
                heapq.heappush(heap, (-fresh, i, iteration))
            continue
        gain = -neg_gain
        if gain <= 0:
            break
        cols = cov.indices[cov.indptr[i] : cov.indptr[i + 1]]
        covered[cols] = True
        order.append(i)
        gain_list.append(gain)
        iteration += 1
    return np.array(order), np.array(gain_list)


def main():
    nodes, g = build_graph()
    cand = pd.read_parquet(C.PROCESSED / "candidates.parquet")
    demand = pd.read_parquet(C.PROCESSED / "demand.parquet")
    cand_nodes = cand["node_idx"].values
    demand_nodes = demand["node_idx"].values
    weights = demand["pop"].values
    total_pop = float(weights.sum())
    print(
        f"graph {g.shape[0]:,} nodes | candidates {len(cand_nodes):,} | "
        f"demand nodes {len(demand_nodes):,} | population {total_pop:,.0f}"
    )

    print("computing walk-time coverage (this is the slow part) ...")
    mats = coverage_matrices(g, cand_nodes, demand_nodes)

    all_rows = []
    summary = {"total_pop": total_pop, "thresholds": {}}
    for t in C.WALK_MINUTES:
        cov = mats[t]
        coverable = float(weights[np.asarray(cov.sum(axis=0)).ravel() > 0].sum())
        print(f"[{t} min] coverable population: {coverable:,.0f} ({100*coverable/total_pop:.1f}%)")
        order, gains = lazy_greedy(cov, weights)
        cum = np.cumsum(gains)
        pct = 100 * cum / total_pop
        sol = pd.DataFrame(
            {
                "minutes": t,
                "rank": np.arange(1, len(order) + 1),
                "node_idx": cand_nodes[order],
                "lon": cand["lon"].values[order],
                "lat": cand["lat"].values[order],
                "pop_gain": gains,
                "cum_pop": cum,
                "cum_pct": pct,
            }
        )
        all_rows.append(sol)

        targets = {}
        for target in (80, 90, 95, 99, 100):
            target_pop = min(target / 100 * total_pop, coverable)
            k = int(np.searchsorted(cum, target_pop - 1e-6) + 1)
            reachable = cum[-1] >= target_pop - 1e-6
            targets[str(target)] = int(k) if reachable else None
        summary["thresholds"][str(t)] = {
            "coverable_pop": coverable,
            "coverable_pct": 100 * coverable / total_pop,
            "nodes_total": int(len(order)),
            "nodes_for_pct": targets,
        }
        print(f"[{t} min] nodes for 80/90/95/99/100%: {targets}")

    pd.concat(all_rows, ignore_index=True).to_parquet(C.OUTPUTS / "solutions.parquet")
    with open(C.OUTPUTS / "summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    print("STEP 5 COMPLETE")


if __name__ == "__main__":
    main()
