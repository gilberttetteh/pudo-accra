import { Package, Loader2 } from 'lucide-react';
import { WALK_MINUTES } from '../planner';

/**
 * The controls, and the answer they produce.
 *
 * Two inputs drive the whole analysis: how far someone should have to walk to
 * a pickup point, and how much of the population must be covered. Everything
 * else — how many sites are needed, which ones, how many people they reach —
 * follows from those.
 *
 * "Populate Nodes" is what commits the settings to the map. The result numbers
 * update live as you drag, but drawing up to ~10 500 markers is deliberately
 * left until you ask for it.
 */
export default function Sidebar({
  area,
  setArea,
  minutes,
  setMinutes,
  targetPct,
  setTargetPct,
  showExclusions,
  setShowExclusions,
  summary,
  selection,
  peopleCovered,
  coverablePct,
  walkMeters,
  isLoading,
  isStale,
  error,
  onPopulate,
}) {
  return (
    <div className="sidebar">
      <div className="brand-title">
        <Package size={28} color="#FF6B35" />
        PUDO Nodes
      </div>

      <p className="sidebar-intro">
        Where should Greater Accra put its pickup &amp; drop-off points, and how many does it
        take?
      </p>

      {error && <div className="alert alert-error">{error.message}</div>}

      <div className="control-group">
        <label htmlFor="area">Operational Area</label>
        <select
          id="area"
          className="control-input"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        >
          <option value="all">Whole study area</option>
          <option value="accra">Greater Accra</option>
          <option value="kasoa">Kasoa</option>
        </select>
        <p className="control-hint">
          Moves the map. The analysis always solves Accra and Kasoa together, as one region.
        </p>
      </div>

      <div className="control-group">
        <label htmlFor="minutes">Max Walking Time to a Node</label>
        <select
          id="minutes"
          className="control-input"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
        >
          {WALK_MINUTES.map((m) => (
            <option key={m} value={m}>
              {m} minutes
            </option>
          ))}
        </select>
        {walkMeters !== undefined && summary && (
          <p className="control-hint">
            ≈ {walkMeters.toLocaleString()} m along roads, at {summary.walk_speed_m_min} m/min
          </p>
        )}
      </div>

      <div className="control-group">
        <label htmlFor="coverage">
          Population Coverage Target
          <span className="label-value">{targetPct}%</span>
        </label>
        <input
          id="coverage"
          type="range"
          className="control-range"
          min="50"
          max="100"
          step="1"
          value={targetPct}
          onChange={(e) => setTargetPct(Number(e.target.value))}
        />
      </div>

      <label className="control-checkbox">
        <input
          type="checkbox"
          checked={showExclusions}
          onChange={(e) => setShowExclusions(e.target.checked)}
        />
        Show exclusion zones
      </label>

      <button className="btn-populate" onClick={onPopulate} disabled={isLoading || !selection}>
        {isLoading ? (
          <>
            <Loader2 size={18} className="spin" /> Loading analysis…
          </>
        ) : isStale ? (
          'Populate Nodes'
        ) : (
          'Nodes Populated'
        )}
      </button>

      {selection && (
        <div className="results">
          <div className="result-row">
            <span>Nodes needed</span>
            <strong>{selection.nodesNeeded.toLocaleString()}</strong>
          </div>
          <div className="result-row">
            <span>Coverage reached</span>
            <strong>{selection.achievedPct.toFixed(1)}%</strong>
          </div>
          <div className="result-row">
            <span>People covered</span>
            <strong>{peopleCovered?.toLocaleString() ?? '—'}</strong>
          </div>
          <div className="result-row">
            <span>Reachable ceiling</span>
            <strong>{coverablePct?.toFixed(1) ?? '—'}%</strong>
          </div>

          {!selection.feasible && coverablePct !== undefined && (
            <div className="alert alert-warning">
              {targetPct}% can&rsquo;t be reached in {minutes} minutes — only{' '}
              {coverablePct.toFixed(1)}% of people live within that walk of any permitted site.
              Showing all {selection.nodesNeeded.toLocaleString()} of them.
            </div>
          )}
        </div>
      )}

      {summary && (
        <p className="sidebar-footnote">
          Greater Accra + Kasoa · {summary.total_pop.toLocaleString()} people (WorldPop 2020).
          Sites are ranked greedily, so each one adds the most coverage still available.
        </p>
      )}
    </div>
  );
}
