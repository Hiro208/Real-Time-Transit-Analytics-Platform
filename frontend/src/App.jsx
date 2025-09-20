import Map, { NavigationControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function App() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/vehicles');
        if (res.data.success) setVehicles(res.data.data);
      } catch (err) { console.error("API Error:", err); }
    };
    fetchData();
    const timer = setInterval(fetchData, 5000); 
    return () => clearInterval(timer);
  }, []);

  const vehicleGeoJSON = useMemo(() => ({
    type: 'FeatureCollection',
    features: vehicles.map(v => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [v.longitude, v.latitude] },
      properties: { ...v }
    }))
  }), [vehicles]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Map {...config}>
        <Source id="vehicles" type="geojson" data={vehicleGeoJSON}>
          <Layer id="transit-point" type="circle" paint={{ 'circle-color': '#4ade80', 'circle-radius': 5 }} />
        </Source>
      </Map>
    </div>
  );
}

export default App;