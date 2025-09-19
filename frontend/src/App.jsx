import React, { useState } from 'react';
import Map, { NavigationControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Map
        initialViewState={{ latitude: 40.73, longitude: -73.98, zoom: 11 }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
      </Map>
    </div>
  );
}

export default App;