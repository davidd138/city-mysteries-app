'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
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
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [center.lng, center.lat],
      zoom: 14,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add user location
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      'top-right'
    );

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center]);

  // Add character markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    characters.forEach((char) => {
      const el = document.createElement('div');
      el.className = 'character-marker';
      el.style.cssText = `
        width: 36px; height: 36px; border-radius: 50%;
        background: #78350f; border: 3px solid #fbbf24;
        cursor: pointer; display: flex; align-items: center;
        justify-content: center; font-size: 18px;
        box-shadow: 0 0 12px rgba(251, 191, 36, 0.4);
        transition: transform 0.2s;
      `;
      el.innerHTML = '🗿';
      el.title = char.name;
      el.onmouseenter = () => { el.style.transform = 'scale(1.2)'; };
      el.onmouseleave = () => { el.style.transform = 'scale(1)'; };

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([char.statue.lng, char.statue.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML(`<div style="color:#1c1917;padding:4px"><strong>${char.name}</strong><br/><small>${char.historicalPeriod}</small></div>`)
        )
        .addTo(map);

      el.addEventListener('click', () => onCharacterClick(char));

      markersRef.current.push(marker);
    });
  }, [characters, onCharacterClick]);

  return (
    <div ref={mapContainerRef} className="w-full h-full rounded-xl overflow-hidden" style={{ minHeight: '400px' }} />
  );
}
