'use client';

import { useEffect } from 'react';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_LEADERBOARD } from '@/lib/graphql/queries';
import type { LeaderboardEntry } from '@/types';

export default function LeaderboardPage() {
  const { data: entries, loading, execute: loadLeaderboard } = useQuery<LeaderboardEntry[]>(GET_LEADERBOARD);

  useEffect(() => { loadLeaderboard(); }, [loadLeaderboard]);

  return (
    <div className="animate-slide-up max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-parchment" style={{ fontFamily: 'var(--font-serif)' }}>
          Salon de la Fama
        </h2>
        <p className="text-sm text-fog-500 mt-1">Los mejores detectives de City Mysteries</p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-10 h-10 border-2 border-brass-500/30 border-t-brass-400 rounded-full animate-spin" />
          <p className="text-sm text-fog-500" style={{ fontFamily: 'var(--font-mono)' }}>Consultando registros...</p>
        </div>
      )}

      {!loading && (!entries || entries.length === 0) && (
        <div className="card-case-file rounded-xl p-12 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-fog-600 mx-auto mb-4">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <p className="text-fog-500">Aun no hay detectives en el ranking. Se el primero en resolver un caso.</p>
        </div>
      )}

      {entries && entries.length > 0 && (
        <div className="card-case-file rounded-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-brass-500 via-brass-400 to-brass-600" />

          {/* Table header */}
          <div className="grid grid-cols-[40px_1fr_120px_80px] gap-3 px-5 py-3 border-b border-midnight-700/50 text-[10px] text-fog-600 tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
            <span>#</span>
            <span>Detective</span>
            <span className="text-right">Puntuacion</span>
            <span className="text-right">Tiempo</span>
          </div>

          {/* Entries */}
          <div className="divide-y divide-midnight-700/30">
            {entries.map((entry, i) => (
              <div
                key={entry.userId}
                className={`grid grid-cols-[40px_1fr_120px_80px] gap-3 px-5 py-3.5 items-center animate-card-reveal ${
                  i < 3 ? 'bg-brass-700/5' : ''
                }`}
                style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}
              >
                {/* Rank */}
                <div className="flex items-center justify-center">
                  {entry.rank <= 3 ? (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      entry.rank === 1 ? 'bg-brass-400/20 text-brass-400 border border-brass-400/30' :
                      entry.rank === 2 ? 'bg-fog-400/10 text-fog-400 border border-fog-400/20' :
                      'bg-brass-600/10 text-brass-600 border border-brass-600/20'
                    }`}>
                      {entry.rank}
                    </div>
                  ) : (
                    <span className="text-sm text-fog-600">{entry.rank}</span>
                  )}
                </div>

                {/* Name + Mystery */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-parchment-dark truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                    {entry.name || 'Anonimo'}
                  </p>
                  <p className="text-[10px] text-fog-600 truncate">{entry.mysteryTitle}</p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="text-sm font-bold text-brass-400" style={{ fontFamily: 'var(--font-serif)' }}>
                    {entry.bestScore}
                  </span>
                  <span className="text-[10px] text-fog-600 ml-1">pts</span>
                </div>

                {/* Time */}
                <div className="text-right text-sm text-fog-400" style={{ fontFamily: 'var(--font-mono)' }}>
                  {entry.elapsedSeconds != null
                    ? `${Math.floor(entry.elapsedSeconds / 60)}:${String(entry.elapsedSeconds % 60).padStart(2, '0')}`
                    : '-'
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
