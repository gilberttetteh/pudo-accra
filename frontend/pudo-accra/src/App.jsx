import { useState } from 'react';
import Intro from './components/Intro';
import Sidebar from './components/Sidebar';
import MapArea from './components/MapArea';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [location, setLocation] = useState('accra');
  const [radius, setRadius] = useState(1500); 

  const handlePopulate = () => {
    // This function will eventually trigger your backend API call 
    // to calculate actual nodes based on the location and radius.
    console.log(`Fetching nodes for ${location} with radius ${radius}m...`);
  };

  if (showIntro) {
    return <Intro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="dashboard">
      <Sidebar 
        location={location} 
        setLocation={setLocation} 
        radius={radius} 
        setRadius={setRadius} 
        onPopulate={handlePopulate} 
      />
      <MapArea 
        location={location} 
        radius={radius} 
      />
    </div>
  );
}