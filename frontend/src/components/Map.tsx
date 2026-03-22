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

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    characters.forEach((char) => {
      const el = document.createElement('div');
      el.className = 'character-marker marker-glow';
      el.style.cssText = `
        width: 40px; height: 40px; border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, #c5a55a, #6b5a3e);
        border: 2px solid rgba(197, 165, 90, 0.6);
        cursor: pointer; display: flex; align-items: center;
        justify-content: center; font-size: 14px;
        box-shadow: 0 0 20px rgba(197, 165, 90, 0.3), 0 0 40px rgba(197, 165, 90, 0.1);
        transition: all 0.3s ease;
        position: relative; z-index: 1;
      `;
      // Use a silhouette icon instead of emoji
      el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#050810" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
      el.title = char.name;
      el.onmouseenter = () => {
        el.style.transform = 'scale(1.25)';
        el.style.boxShadow = '0 0 30px rgba(197, 165, 90, 0.5), 0 0 60px rgba(197, 165, 90, 0.2)';
      };
      el.onmouseleave = () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = '0 0 20px rgba(197, 165, 90, 0.3), 0 0 40px rgba(197, 165, 90, 0.1)';
      };

      const popupHtml = `
        <div style="
          background: #111827;
          color: #f5e6c8;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid rgba(197, 165, 90, 0.2);
          font-family: 'Playfair Display', Georgia, serif;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        ">
          <strong style="font-size: 14px;">${char.name}</strong>
          <br/>
          <small style="color: #8892a8; font-family: 'Inter', sans-serif; font-size: 11px;">${char.historicalPeriod}</small>
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([char.statue.lng, char.statue.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: false, className: 'mystery-popup' })
            .setHTML(popupHtml)
        )
        .addTo(map);

      el.addEventListener('click', () => onCharacterClick(char));

      markersRef.current.push(marker);
    });
  }, [characters, onCharacterClick]);

  return (
    <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '400px' }} />
  );
}
