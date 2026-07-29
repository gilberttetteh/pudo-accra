import { useEffect, useMemo, useState } from 'react';
import Intro from './components/Intro';
import Sidebar from './components/Sidebar';
import MapArea from './components/MapArea';
import {
  fetchBoundary,
  fetchExclusions,
  fetchRanking,
  fetchSummary,
  selectForCoverage,
} from './planner';

/** Where "Operational Area" jumps the map to. The analysis solves Accra and
 *  Kasoa as one region, so these only move the view — they don't re-run
 *  anything or filter the result. */
const AREAS = {
  all: null, // keep the fitted study-area bounds
  accra: { center: [5.6037, -0.187], zoom: 12 },
  kasoa: { center: [5.5333, -0.4167], zoom: 13 },
};

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  // Controls.
  const [area, setArea] = useState('all');
  const [minutes, setMinutes] = useState(10);
  const [targetPct, setTargetPct] = useState(95);
  const [showExclusions, setShowExclusions] = useState(false);

  // Analysis data.
  const [summary, setSummary] = useState(null);
  const [boundary, setBoundary] = useState(null);
  const [exclusions, setExclusions] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // What's actually drawn. Held separately from `selection` so the map only
  // redraws when "Populate Nodes" is pressed — the numbers stay live while you
  // drag, but rendering thousands of markers waits until you ask for it.
  const [plotted, setPlotted] = useState(null);
  const [flyTo, setFlyTo] = useState(null);

  // Study-area geometry and totals: fetched once, never change.
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchSummary(), fetchBoundary()])
      .then(([s, b]) => {
        if (cancelled) return;
        setSummary(s);
        setBoundary(b);
      })
      .catch((e) => !cancelled && setError(e));
    return () => {
      cancelled = true;
    };
  }, []);

  // Exclusions are the largest file and are off by default, so only load them
  // the first time they're switched on.
  useEffect(() => {
    if (!showExclusions || exclusions) return;
    let cancelled = false;
    fetchExclusions()
      .then((e) => !cancelled && setExclusions(e))
      .catch((e) => !cancelled && setError(e));
    return () => {
      cancelled = true;
    };
  }, [showExclusions, exclusions]);

  // One ranking per walking time. Changing the coverage target re-slices this
  // in memory rather than fetching again.
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchRanking(minutes)
      .then((r) => {
        if (cancelled) return;
        setRanking(r);
        setIsLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [minutes]);

  const selection = useMemo(
    () => (ranking ? selectForCoverage(ranking, targetPct) : null),
    [ranking, targetPct]
  );

  // Draw the first result automatically — landing on an empty map would just
  // look broken, and the default 10 min / 95% is a reasonable starting point.
  useEffect(() => {
    if (selection && !plotted) setPlotted(selection.nodes);
  }, [selection, plotted]);

  const peopleCovered =
    selection && summary
      ? Math.round((selection.achievedPct / 100) * summary.total_pop)
      : undefined;

  const handleAreaChange = (next) => {
    setArea(next);
    // New object each time so re-selecting the same area still flies there.
    if (AREAS[next]) setFlyTo({ ...AREAS[next] });
  };

  if (showIntro) {
    return <Intro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="dashboard">
      <Sidebar
        area={area}
        setArea={handleAreaChange}
        minutes={minutes}
        setMinutes={setMinutes}
        targetPct={targetPct}
        setTargetPct={setTargetPct}
        showExclusions={showExclusions}
        setShowExclusions={setShowExclusions}
        summary={summary}
        selection={selection}
        peopleCovered={peopleCovered}
        coverablePct={summary?.thresholds[String(minutes)]?.coverable_pct}
        walkMeters={ranking?.walkMeters}
        isLoading={isLoading}
        isStale={selection ? selection.nodes !== plotted : false}
        error={error}
        onPopulate={() => selection && setPlotted(selection.nodes)}
      />
      <MapArea
        nodes={plotted}
        boundary={boundary}
        exclusions={exclusions}
        showExclusions={showExclusions}
        flyTo={flyTo}
      />
    </div>
  );
}
