import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * The map surface: basemap tiles, the study-area outline, the exclusion zones,
 * and the PUDO sites the analysis chose.
 *
 * Built directly on Leaflet rather than react-leaflet because the site count
 * reaches ~10 500 at the tightest settings. One React element and one SVG path
 * per site is enough to lock up the browser; a single shared canvas renderer
 * draws them all at once, and the layer is rebuilt imperatively whenever the
 * selection changes.
 */

/** Marker area encodes people served, so the sites doing the heavy lifting
 *  stand out — the first few hundred ranks cover more than the following
 *  thousands combined. Square root, because the eye compares area. */
function radiusFor(peopleServed, maxPeopleServed) {
  if (maxPeopleServed <= 0) return 4;
  const share = Math.min(1, Math.max(0, peopleServed / maxPeopleServed));
  return 3 + Math.sqrt(share) * 8;
}

function colorFor(peopleServed, maxPeopleServed) {
  if (maxPeopleServed <= 0) return '#4B9CD3';
  const share = peopleServed / maxPeopleServed;
  if (share > 0.5) return '#FF6B35';
  if (share > 0.2) return '#FBA834';
  if (share > 0.05) return '#2BB673';
  return '#4B9CD3';
}

/** Matches the palette in analysis/app.py so a category reads the same colour
 *  in both tools. */
const EXCLUSION_COLORS = {
  water: '#2e86de',
  wetland: '#48c9b0',
  industrial: '#95a5a6',
  military: '#e74c3c',
  airport: '#9b59b6',
  cemetery: '#7f8c8d',
  landfill: '#d35400',
};

function popupHtml(node) {
  return `
    <div class="node-popup">
      <strong>PUDO site #${node.rank}</strong>
      <div><b>${node.peopleServed.toLocaleString()}</b> people first reached here</div>
      <div>Cumulative coverage: <b>${node.cumPct.toFixed(2)}%</b></div>
      <div class="node-popup-coords">${node.lat.toFixed(5)}, ${node.lon.toFixed(5)}</div>
    </div>
  `;
}

export default function MapArea({ nodes, boundary, exclusions, showExclusions, flyTo }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const nodeLayerRef = useRef(null);
  const exclusionLayerRef = useRef(null);

  // Create the map once. Leaflet owns this DOM node from here on, so React
  // must never render children into it.
  useEffect(() => {
    const map = L.map(containerRef.current, {
      center: [5.6037, -0.187],
      zoom: 11,
      preferCanvas: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Study-area outline.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !boundary) return;

    const layer = L.geoJSON(boundary, {
      style: { color: '#004E89', weight: 2, opacity: 0.9, fill: false, dashArray: '6 4' },
    }).addTo(map);

    // Frame the study area once it's known, so the user starts on Accra rather
    // than wherever the default centre happens to land.
    map.fitBounds(layer.getBounds(), { padding: [20, 20] });

    return () => layer.remove();
  }, [boundary]);

  // Exclusion zones.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !exclusions || !showExclusions) return;

    const layer = L.geoJSON(exclusions, {
      style: (feature) => {
        const color = EXCLUSION_COLORS[feature?.properties?.category] ?? '#78788c';
        return { color, weight: 1, opacity: 0.6, fillColor: color, fillOpacity: 0.35 };
      },
      onEachFeature: (feature, featureLayer) => {
        featureLayer.bindTooltip(`Excluded: ${feature?.properties?.category ?? 'other'}`, {
          sticky: true,
        });
      },
    }).addTo(map);
    exclusionLayerRef.current = layer;

    return () => {
      layer.remove();
      exclusionLayerRef.current = null;
    };
  }, [exclusions, showExclusions]);

  // The PUDO sites themselves.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !nodes || nodes.length === 0) return;

    // One canvas for every marker. Without this, thousands of sites would each
    // get their own SVG path and the map would stop responding.
    const renderer = L.canvas({ padding: 0.5 });
    const group = L.layerGroup();

    // Rank 1 is the greedy maximum, so it bounds every other marginal gain.
    const maxPeopleServed = nodes[0].peopleServed;

    for (const node of nodes) {
      L.circleMarker([node.lat, node.lon], {
        renderer,
        radius: radiusFor(node.peopleServed, maxPeopleServed),
        color: '#1A1A24',
        weight: 1,
        opacity: 0.45,
        fillColor: colorFor(node.peopleServed, maxPeopleServed),
        fillOpacity: 0.85,
      })
        .bindPopup(popupHtml(node))
        .addTo(group);
    }

    group.addTo(map);
    nodeLayerRef.current = group;

    return () => {
      group.remove();
      nodeLayerRef.current = null;
    };
  }, [nodes]);

  // The sidebar's area selector jumps the view without reloading anything.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTo) return;
    map.flyTo(flyTo.center, flyTo.zoom, { duration: 1 });
  }, [flyTo]);

  return (
    <div className="map-wrapper">
      <div ref={containerRef} className="map-canvas" />

      {nodes && nodes.length > 0 && (
        <div className="map-legend">
          <div className="map-legend-title">People first reached</div>
          <div className="legend-row">
            <span className="legend-dot" style={{ background: '#FF6B35', width: 15, height: 15 }} />
            Highest impact
          </div>
          <div className="legend-row">
            <span className="legend-dot" style={{ background: '#FBA834', width: 12, height: 12 }} />
            High
          </div>
          <div className="legend-row">
            <span className="legend-dot" style={{ background: '#2BB673', width: 9, height: 9 }} />
            Moderate
          </div>
          <div className="legend-row">
            <span className="legend-dot" style={{ background: '#4B9CD3', width: 7, height: 7 }} />
            Long tail
          </div>
        </div>
      )}
    </div>
  );
}
