'use client';

import { useAuth } from '@/hooks/useAuth';

export function Topbar() {
  const { user, signOut } = useAuth();

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

      {/* Agent badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          {/* Badge icon */}
          <div className="w-7 h-7 rounded-full border border-brass-600/40 bg-midnight-800 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass-400">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <span className="text-sm text-fog-400">{user?.email}</span>
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
