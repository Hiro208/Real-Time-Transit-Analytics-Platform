import React, { useState, useEffect, useMemo } from 'react';
import Map, { Source, Layer, NavigationControl, Popup, GeolocateControl } from 'react-map-gl';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// 纽约地铁标准配色
const ROUTE_COLORS = {
  '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
  '4': '#00933C', '5': '#00933C', '6': '#00933C',
  '7': '#B933AD', '7X': '#B933AD',
  'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
  'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319',
  'G': '#6CBE45',
  'J': '#996633', 'Z': '#996633',
  'L': '#A7A9AC',
  'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
  'S': '#808183', 'GS': '#808183', 'FS': '#808183', 'H': '#808183',
  'SI': '#0039A6'
};

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('ALL');
  const [hoverInfo, setHoverInfo] = useState(null);

  // 数据获取
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/vehicles');
        if (res.data.success) setVehicles(res.data.data);
      } catch (err) { console.error("API Error:", err); }
    };
    fetchData();
    const timer = setInterval(fetchData, 3000); 
    return () => clearInterval(timer);
  }, []);

  // 数据处理与过滤
  const vehicleGeoJSON = useMemo(() => {
    const filtered = selectedRoute === 'ALL' 
      ? vehicles 
      : vehicles.filter(v => v.route_id === selectedRoute);

    return {
      type: 'FeatureCollection',
      features: filtered.map(v => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [parseFloat(v.longitude), parseFloat(v.latitude)] },
        properties: { ...v }
      }))
    };
  }, [vehicles, selectedRoute]);

  const getCircleColor = () => {
    const matchRules = ['match', ['get', 'route_id']];
    Object.entries(ROUTE_COLORS).forEach(([k, v]) => matchRules.push(k, v));
    matchRules.push('#FFFFFF');
    return matchRules;
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Map
        initialViewState={{ latitude: 40.73, longitude: -73.98, zoom: 11 }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['transit-point']}
        onMouseMove={e => {
          const feature = e.features?.[0];
          if (feature) {
            setHoverInfo({ lng: e.lngLat.lng, lat: e.lngLat.lat, props: feature.properties });
          } else {
            setHoverInfo(null);
          }
        }}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        
        <Source id="vehicles-source" type="geojson" data={vehicleGeoJSON}>
          <Layer 
            id="transit-corridor-glow"
            type="circle"
            beforeId="transit-point"
            paint={{
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 20, 14, 60],
              'circle-blur': 1, 
              'circle-color': getCircleColor(),
              'circle-opacity': 0.2
            }}
          />
          <Layer 
            id="transit-point"
            type="circle"
            paint={{
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 14, 8],
              'circle-color': getCircleColor(),
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 1
            }}
          />
        </Source>

        {/* 实时弹窗 */}
        {hoverInfo && (
          <Popup
            longitude={hoverInfo.lng}
            latitude={hoverInfo.lat}
            closeButton={false}
            offset={15}
            maxWidth="320px"
          >
            <div style={{ color: '#fff', padding: '12px', minWidth: '220px' }}>
              
              {/* 顶部：线路 logo 与 方向 */}
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
                <div style={{
                  background: ROUTE_COLORS[hoverInfo.props.route_id] || '#333',
                  color: '#fff', width: '35px', height: '35px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px'
                }}>
                  {hoverInfo.props.route_id}
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontSize:'10px', color:'#4ade80', fontWeight:'bold', letterSpacing: '1px'}}>● LIVE SERVICE</div>
                  <div style={{fontSize:'11px', color:'#aaa', textTransform: 'uppercase'}}>{hoverInfo.props.direction || "Inbound"}</div>
                </div>
              </div>

              {/* 中间：终点站 Bound For */}
              <div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Bound For</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>
                  {hoverInfo.props.destination || "Updating Terminal..."}
                </div>
              </div>

              {/* 底部：当前状态与下一站 */}
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px' }}>
                <div style={{ fontSize: '10px', color: '#aaa', fontWeight: 'bold' }}>
                  {hoverInfo.props.current_status || "MOVING"}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#4ade80' }}>
                  {hoverInfo.props.stop_name || "Unknown Stop"}
                </div>
              </div>

              {/* TRIP ID 调试信息 */}
              <div style={{marginTop: '10px', color:'#444', fontSize:'9px', fontFamily:'monospace', textAlign: 'center'}}>
                SYSTEM_ID: {hoverInfo.props.trip_id?.split('_')[0]}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* 控制面板 */}
      <div style={panelStyle}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '20px'}}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '-1px', color: '#fff' }}>REPLICA</h2>
            <div style={{ fontSize: '10px', color: '#4ade80', letterSpacing: '2px', fontWeight: 'bold' }}>NYC REAL-TIME NODE</div>
          </div>
        </div>
        
        <select value={selectedRoute} onChange={e => setSelectedRoute(e.target.value)} style={selectStyle}>
          <option value="ALL">🔭 All Active Lines</option>
          <optgroup label="Numbered Lines (IRT)">
            <option value="1">1 Line</option><option value="2">2 Line</option><option value="3">3 Line</option>
            <option value="4">4 Line</option><option value="5">5 Line</option><option value="6">6 Line</option>
            <option value="7">7 Line</option>
          </optgroup>
          <optgroup label="Lettered Lines (IND/BMT)">
            <option value="A">A Line</option><option value="C">C Line</option><option value="E">E Line</option>
            <option value="L">L Line</option><option value="G">G Line</option><option value="N">N Line</option>
            <option value="Q">Q Line</option><option value="R">R Line</option>
          </optgroup>
        </select>

        <div style={{ marginTop: '20px', background: 'rgba(74, 222, 128, 0.1)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#4ade80', lineHeight: '1' }}>
            {vehicleGeoJSON.features.length}
          </div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '5px', textTransform: 'uppercase' }}>Active Vehicles Tracked</div>
        </div>
      </div>

      <style>{`
        .mapboxgl-popup-content {
          background: rgba(10, 10, 10, 0.9) !important;
          backdrop-filter: blur(15px) !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          border-radius: 15px !important;
          padding: 0 !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.8) !important;
        }
        .mapboxgl-popup-tip { border-top-color: rgba(10, 10, 10, 0.9) !important; }
      `}</style>
    </div>
  );
}

const panelStyle = {
  position: 'absolute', top: '20px', left: '20px', width: '260px',
  background: 'rgba(15, 15, 15, 0.85)', color: '#fff', padding: '25px',
  borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)'
};

const selectStyle = {
  width: '100%', padding: '12px', background: '#222', color: '#fff', 
  border: '1px solid #444', borderRadius: '10px', outline: 'none', cursor: 'pointer'
};

export default App;