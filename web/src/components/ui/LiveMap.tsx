import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

// Coordinates for Manaparai, Tiruchirappalli, Tamil Nadu
const center: [number, number] = [10.6094, 78.4119];


export const LiveMap: React.FC = () => {
  return (
    <div style={{ height: '500px', width: '100%', overflow: 'hidden' }} className="relative z-0">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        {/* Dark Matter CartoDB Base Map */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Real telemetry points will go here */}
      </MapContainer>
    </div>
  );
};
