import { Package } from 'lucide-react';

export default function Sidebar({ location, setLocation, radius, setRadius, onPopulate }) {
  return (
    <div className="sidebar">
      <div className="brand-title">
        <Package size={28} color="#FF6B35" />
        PUDO Nodes
      </div>

      <div className="control-group">
        <label>Operational Area</label>
        <select 
          className="control-input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="accra">Greater Accra</option>
          <option value="kasoa">Kasoa</option>
        </select>
      </div>

      <div className="control-group">
        <label>Node Coverage Radius (meters)</label>
        <input 
          type="number" 
          className="control-input"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          min="100"
          step="100"
        />
      </div>

      <button className="btn-populate" onClick={onPopulate}>
        Populate Nodes
      </button>
    </div>
  );
}