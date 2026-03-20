'use client';

import { useEffect } from 'react';
import { useQuery } from '@/hooks/useGraphQL';
import { LIST_GAME_SESSIONS } from '@/lib/graphql/queries';
import type { GameSessionList } from '@/types';

export default function HistoryPage() {
  const { data, loading, execute: loadSessions } = useQuery<GameSessionList>(LIST_GAME_SESSIONS);

  useEffect(() => { loadSessions({ limit: 20 }); }, [loadSessions]);

  const sessions = data?.items || [];

  return (
    <div>
      <h2 className="text-2xl font-bold text-stone-100 mb-6">Historial de partidas</h2>
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!loading && sessions.length === 0 && (
        <p className="text-stone-500 text-center py-12">No has jugado ninguna partida todavia.</p>
      )}
      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-stone-800 border border-stone-700 rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <h3 className="font-medium text-stone-200">{session.mysteryTitle || 'Misterio'}</h3>
              <p className="text-xs text-stone-500 mt-1">
                {new Date(session.startedAt).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {session.status === 'completed' && (
                <span className={`text-sm font-medium ${session.solved ? 'text-emerald-500' : 'text-red-500'}`}>
                  {session.solved ? 'Resuelto' : 'Fallido'}
                </span>
              )}
              {session.status === 'active' && (
                <span className="text-sm text-amber-400">En curso</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
