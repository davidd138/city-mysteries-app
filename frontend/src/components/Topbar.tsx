'use client';

import { useAuth } from '@/hooks/useAuth';

export function Topbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="h-14 bg-stone-900 border-b border-stone-800 flex items-center justify-between px-6">
      <div className="md:hidden">
        <span className="text-lg font-bold text-amber-400">City Mysteries</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <span className="text-sm text-stone-400">{user?.email}</span>
        <button
          onClick={signOut}
          className="text-sm text-stone-500 hover:text-stone-300 transition-colors"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
