'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard/', label: 'Misterios', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { href: '/history/', label: 'Historial', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-stone-900 border-r border-stone-800 min-h-screen p-4 hidden md:block">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-amber-400">City Mysteries</h1>
        <p className="text-xs text-stone-500 mt-1">Escape Room Urbano</p>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href.replace(/\/$/, ''));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-amber-900/30 text-amber-400'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
