export default function MapArea({ location, radius }) {
  const displayLocation = location === 'accra' ? 'Greater Accra' : 'Kasoa';

  return (
    <div className="map-wrapper" id="google-map-mount">
      <div className="map-placeholder-content">
        <h2>Google Maps Canvas Ready</h2>
        <p><strong>Target Zone:</strong> {displayLocation}</p>
        <p><strong>Calculated Node Radius:</strong> {radius}m</p>
        <br />
        <p style={{ fontSize: '0.9rem', color: '#9CA3AF' }}>
          Initialize your Maps JS API here when backend is connected.
        </p>
      </div>
    </div>
  );
}