'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export function Topbar() {
  const { user, signOut } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(false);

  return (
    <header className="h-14 bg-midnight-900/60 border-b border-midnight-700/40 flex items-center justify-between px-6 backdrop-blur-sm">
      {/* Mobile brand */}
      <div className="md:hidden flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass-400">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="text-base font-bold text-parchment" style={{ fontFamily: 'var(--font-serif)' }}>
          City Mysteries
        </span>
      </div>
      <div className="flex-1" />

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
            soundEnabled
              ? 'border-brass-500/40 bg-brass-700/10 text-brass-400'
              : 'border-midnight-600 bg-midnight-800 text-fog-600'
          }`}
          title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
        >
          {soundEnabled ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>

        {/* Agent badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full border border-brass-600/40 bg-midnight-800 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass-400">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <Link href="/profile/" className="text-sm text-fog-400 hover:text-brass-400 transition-colors">
            {user?.email}
          </Link>
        </div>
        <div className="w-px h-5 bg-midnight-700" />
        <button
          onClick={signOut}
          className="text-xs text-fog-600 hover:text-crimson-400 transition-colors tracking-wider uppercase"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Salir
        </button>
      </div>
    </header>
  );
}
