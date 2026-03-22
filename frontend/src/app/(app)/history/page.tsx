'use client';

import { useEffect } from 'react';
import { useQuery } from '@/hooks/useGraphQL';
import { LIST_GAME_SESSIONS } from '@/lib/graphql/queries';
import type { GameSessionList } from '@/types';

const statusConfig: Record<string, { label: string; stampClass: string; icon: string }> = {
  'completed-solved': {
    label: 'Caso Resuelto',
    stampClass: 'text-teal-400 border-teal-400',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  'completed-failed': {
    label: 'Caso Cerrado',
    stampClass: 'text-crimson-400 border-crimson-400',
    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  'active': {
    label: 'En Curso',
    stampClass: 'text-brass-400 border-brass-400',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
};

export default function HistoryPage() {
  const { data, loading, execute: loadSessions } = useQuery<GameSessionList>(LIST_GAME_SESSIONS);

  useEffect(() => { loadSessions({ limit: 20 }); }, [loadSessions]);

  const sessions = data?.items || [];

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-parchment" style={{ fontFamily: 'var(--font-serif)' }}>
          Archivo de Casos
        </h2>
        <p className="text-sm text-fog-500 mt-1">Registro de investigaciones anteriores</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-10 h-10 border-2 border-brass-500/30 border-t-brass-400 rounded-full animate-spin" />
          <p className="text-sm text-fog-500" style={{ fontFamily: 'var(--font-mono)' }}>Revisando archivos...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && sessions.length === 0 && (
        <div className="card-case-file rounded-xl p-12 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-fog-600 mx-auto mb-4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <p className="text-fog-500">El archivo esta vacio. Comienza tu primera investigacion.</p>
        </div>
      )}

      {/* Session list - logbook style */}
      <div className="space-y-3">
        {sessions.map((session, i) => {
          const key = session.status === 'completed'
            ? (session.solved ? 'completed-solved' : 'completed-failed')
            : 'active';
          const config = statusConfig[key];
          const date = new Date(session.startedAt);

          return (
            <div
              key={session.id}
              className="card-case-file rounded-xl p-5 flex items-center gap-5 animate-card-reveal"
              style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}
            >
              {/* Date column */}
              <div className="hidden sm:flex flex-col items-center min-w-[50px] text-center">
                <span className="text-lg font-bold text-fog-400" style={{ fontFamily: 'var(--font-serif)' }}>
                  {date.getDate()}
                </span>
                <span className="text-[10px] text-fog-600 uppercase tracking-wider">
                  {date.toLocaleDateString('es-ES', { month: 'short' })}
                </span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-10 bg-midnight-700/50" />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-parchment-dark truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                  {session.mysteryTitle || 'Misterio'}
                </h3>
                <p className="text-xs text-fog-600 mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                  ID: {session.id.slice(0, 8).toUpperCase()} &middot;{' '}
                  {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} className={config.stampClass.split(' ')[0]} />
                </svg>
                <span className={`stamp text-[9px] py-0 px-1.5 ${config.stampClass}`}>
                  {config.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
