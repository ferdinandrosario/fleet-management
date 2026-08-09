import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from './Badge';

// Coordinates for Manaparai, Tiruchirappalli, Tamil Nadu
const center: [number, number] = [10.6094, 78.4119];

const createNeonIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-neon-marker',
    html: `
      <div style="
        width: 14px; 
        height: 14px; 
        background-color: ${color}; 
        border-radius: 50%; 
        box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
        border: 2px solid #1e293b;
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

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
