# Frontend Setup

**Applies to:** `frontend/` only — the React app that's actually been built
(Phases 1–9). There is no backend to run yet (Phase 10, not started); the
app runs entirely on mock data in the browser.

> **Note on other folders in this repo:** `analysis/` is a separate,
> unrelated Python/GIS pipeline (see its own `README.md` /
> `HOW_IT_WORKS.md`) — it is **not** connected to this frontend and isn't
> needed to run it. `frontend/pudo-accra/` is a leftover duplicate folder
> from an earlier push — ignore it. The root `README.md` describes an
> original planned Docker/FastAPI/PostGIS stack that doesn't reflect
> what's actually been built — this document does.

---

## 1. Prerequisites

| Requirement | Version | Check with |
|---|---|---|
| Node.js | **20.19+** (built and tested on 22.x) | `node --version` |
| npm | 10+ (ships with Node) | `npm --version` |

No Python, Docker, or database is required to run the frontend.

Don't have Node? Install via [nodejs.org](https://nodejs.org) or a version
manager like [nvm](https://github.com/nvm-sh/nvm):
```bash
nvm install 22
nvm use 22
```

---

## 2. Install

```bash
git clone https://github.com/gilberttetteh/pudo-accra.git
cd pudo-accra/frontend
npm install --legacy-peer-deps
```

### Why `--legacy-peer-deps`?

`@hookform/resolvers` wants `valibot@^1.0.0`, but the lockfile resolves
`valibot@0.39.0`. This is a known, pre-existing conflict (tracked since
Phase 7) — a plain `npm install` will fail on peer-dependency resolution
without the flag. **Always use `--legacy-peer-deps`** for any install in
this project until that version bump happens.

This installs everything in `package.json`, including the libraries added
in later phases — nothing needs to be installed one-by-one:

| Added in | Packages |
|---|---|
| Phase 1 | react, react-dom, react-router-dom, @tanstack/react-query, axios, react-hook-form, zod, leaflet, chart.js, lucide-react |
| Phase 2–6 | @radix-ui/* primitives, class-variance-authority, tailwind-merge, react-chartjs-2, react-leaflet, @tanstack/react-virtual |
| Phase 9 (Reports) | **jspdf, html2canvas** — PDF export |

If you're merging in a new phase's files by hand (rather than pulling the
branch) and its session summary mentions new dependencies, run
`npm install <package> --legacy-peer-deps` for those specifically before
`npm run dev` — otherwise you'll get a "failed to resolve import" error.

---

## 3. Run it

```bash
npm run dev
```
Opens at the printed `localhost` URL (typically `http://localhost:5173`).
Hot-reloads on file changes.

---

## 4. Other useful commands

| Command | What it does |
|---|---|
| `npm run build` | Type-checks (`tsc -b`) then produces a production build in `dist/`. **Does not serve anything** — see below to view it. |
| `npm run preview` | Serves the `dist/` folder from `npm run build` at a local URL, so you can check the production build actually works. |
| `npm run typecheck` | `tsc -b --noEmit` — type errors only, no build output. |
| `npm run lint` | ESLint across the whole project. |
| `npm run lint:fix` | Same, auto-fixing what it can. |
| `npm run format` | Prettier, writes changes. |

---

## 5. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `npm install` fails with `ERESOLVE` peer dependency errors | Missing `--legacy-peer-deps` flag (see §2) | Re-run with the flag |
| `npm run dev` → "Missing script: dev" | Run from the repo root instead of `frontend/` | `cd frontend` first |
| Blank page / "failed to resolve import" for a specific package | A phase's new dependency wasn't installed (e.g. `jspdf`) | Check that phase's session summary for what to `npm install`, or just re-run `npm install --legacy-peer-deps` after pulling the branch that updated `package.json` |
| `Cannot find module 'react/jsx-runtime'` in VS Code | `node_modules` not installed yet, or stale TS server | `npm install --legacy-peer-deps`, then restart the TS server |

---

## 6. What you do NOT need

- Docker / docker-compose (the root `README.md`'s "Start Docker" step is
  aspirational, for a backend phase that hasn't started)
- Python, pip, or anything under `analysis/` — unrelated project
- A running database — all data is mocked in `frontend/src/mock/`
