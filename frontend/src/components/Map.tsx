
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import * as polyline from '@googlemaps/polyline-codec';

// Import marker icons directly
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Create a default icon instance
const DefaultIcon = L.icon({
    iconUrl,
    shadowUrl,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

interface MapProps {
  overview_polyline: string;
  stops: { name: string; type: string; location: [number, number]; website?: string }[];
}

// A new component to handle the map animation
const ChangeView = ({ center, zoom }: { center: LatLngExpression; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const Map: React.FC<MapProps> = ({ overview_polyline, stops }) => {
  const path = useMemo(() => {
    return polyline.decode(overview_polyline);
  }, [overview_polyline]);

  const center: LatLngExpression = path.length > 0 ? path[0] : [38.2919, -122.4580];

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom={true} className="leaflet-container">
      <ChangeView center={center} zoom={12} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {path.length > 0 && <Polyline positions={path as LatLngExpression[]} color="blue" />}
      {stops.map((stop, idx) => (
        <Marker key={idx} position={stop.location as LatLngExpression} icon={DefaultIcon}>
          <Popup>
            <b>{stop.name}</b><br />
            <a href={stop.website} target="_blank" rel="noopener noreferrer">Website</a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
