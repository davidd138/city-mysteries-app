'use client';

import { useEffect, useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Character, Location } from '@/types';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

type MapProps = {
  center: Location;
  characters: Character[];
  onCharacterClick: (character: Character) => void;
};

export function GameMap({ center, characters, onCharacterClick }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    if (!MAPBOX_TOKEN) {
      setMapError('Token de Mapbox no configurado. Configura NEXT_PUBLIC_MAPBOX_TOKEN para ver el mapa.');
      return;
    }

    let map: unknown;
    (async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [center.lng, center.lat],
          zoom: 14,
        });

        const m = map as mapboxgl.Map;
        m.addControl(new mapboxgl.NavigationControl(), 'top-right');
        m.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserHeading: true,
          }),
          'top-right'
        );

        mapRef.current = m;

        // Add markers once map is ready
        m.on('load', () => {
          characters.forEach((char) => {
            const el = document.createElement('div');
            el.style.cssText = `
              width: 40px; height: 40px; border-radius: 50%;
              background: radial-gradient(circle at 30% 30%, #c5a55a, #6b5a3e);
              border: 2px solid rgba(197, 165, 90, 0.6);
              cursor: pointer; display: flex; align-items: center;
              justify-content: center;
              box-shadow: 0 0 20px rgba(197, 165, 90, 0.3);
              transition: all 0.3s ease;
            `;
            el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#050810" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
            el.title = char.name;
            el.addEventListener('click', () => onCharacterClick(char));

            const marker = new mapboxgl.Marker({ element: el })
              .setLngLat([char.statue.lng, char.statue.lat])
              .addTo(m);
            markersRef.current.push(marker);
          });
        });
      } catch (err) {
        console.error('Map init error:', err);
        setMapError('Error al cargar el mapa. Los sospechosos estan en el listado lateral.');
      }
    })();

    return () => {
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, [center, characters, onCharacterClick]);

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-midnight-900/50" style={{ minHeight: '400px' }} data-testid="map-container">
        <div className="text-center p-8 max-w-sm">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-fog-500 mx-auto mb-3">
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-sm text-fog-500 mb-2">{mapError}</p>
          <p className="text-xs text-fog-600">Usa el panel de sospechosos para interactuar con los personajes.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '400px' }} data-testid="map-container" />
  );
}
