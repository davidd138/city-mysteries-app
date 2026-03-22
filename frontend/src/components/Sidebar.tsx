'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard/', label: 'Casos', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { href: '/history/', label: 'Archivo', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { href: '/leaderboard/', label: 'Ranking', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 bg-midnight-900/80 border-r border-midnight-700/50 min-h-screen p-5 hidden md:block backdrop-blur-sm relative">
        {/* Agency brand */}
        <div className="mb-10 pb-5 border-b border-midnight-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-brass-500/30 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass-400">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-parchment" style={{ fontFamily: 'var(--font-serif)' }}>
                City Mysteries
              </h1>
              <p className="text-[10px] text-fog-600 tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                Agencia
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-[10px] text-fog-600 tracking-widest uppercase font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
            Indice
          </span>
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href.replace(/\/$/, ''));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-brass-700/20 text-brass-300 border-l-2 border-brass-400 shadow-[inset_0_0_20px_rgba(197,165,90,0.05)]'
                    : 'text-fog-500 hover:text-fog-300 hover:bg-midnight-700/30 border-l-2 border-transparent'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span className="tracking-wide">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brass-400 animate-glow" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-5 right-5">
          <div className="border-t border-midnight-700/50 pt-4">
            <p className="text-[9px] text-fog-600/50 text-center tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
              Expedientes Clasificados
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav aria-label="Navegacion principal movil" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-midnight-900/95 border-t border-midnight-700/50 backdrop-blur-md safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href.replace(/\/$/, ''));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'text-brass-400' : 'text-fog-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span className="text-[10px] tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
