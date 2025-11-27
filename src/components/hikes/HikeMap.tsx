import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import { storage } from '../../lib/firebase';

interface HikeMapProps {
  gpxPath?: string | null;
}

// Composant pour centrer la carte automatiquement
function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length === 0) return;
    const bounds = L.latLngBounds(coords.map(([lat, lng]) => [lat, lng]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [coords, map]);
  return null;
}

export default function HikeMap({ gpxPath }: HikeMapProps) {
  const [coords, setCoords] = useState<[number, number][]>([]);

  useEffect(() => {
    const loadGpx = async () => {
      try {
        let url: string;
        if (gpxPath) {
          url = gpxPath.startsWith('http')
            ? gpxPath
            : await getDownloadURL(storageRef(storage, gpxPath));
        } else {
          url = '/default.gpx'; // fallback
        }

        const res = await fetch(url);
        const text = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');

        const trkpts: [number, number][] = Array.from(xml.getElementsByTagName('trkpt')).map(pt => [
          parseFloat(pt.getAttribute('lat') || '0'),
          parseFloat(pt.getAttribute('lon') || '0'),
        ]);

        if (trkpts.length) setCoords(trkpts);
        else console.warn('GPX vide ou non reconnu');
      } catch (err) {
        console.error('Impossible de charger le GPX', err);
      }
    };

    loadGpx();
  }, [gpxPath]);

  const initialCenter: LatLngExpression = coords.length ? coords[0] : [46, 6];

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer center={initialCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {coords.length > 0 &&
          <Polyline
            positions={coords}
            pathOptions={{
              color: 'green',
              weight: 5,
              opacity: 0.8,
              dashArray: '10, 5',
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        }
        <FitBounds coords={coords} />
      </MapContainer>
    </div>
  );
}
