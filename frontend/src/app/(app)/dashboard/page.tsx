'use client';

import { useEffect } from 'react';
import { useQuery } from '@/hooks/useGraphQL';
import { LIST_MYSTERIES } from '@/lib/graphql/queries';
import { useMutation } from '@/hooks/useGraphQL';
import { START_GAME } from '@/lib/graphql/mutations';
import { useRouter } from 'next/navigation';
import type { Mystery, GameSession } from '@/types';

const difficultyConfig: Record<string, { label: string; color: string }> = {
  easy: { label: 'Principiante', color: 'text-teal-400' },
  medium: { label: 'Intermedio', color: 'text-brass-400' },
  hard: { label: 'Experto', color: 'text-crimson-400' },
};

export default function DashboardPage() {
  const { data: mysteries, loading, execute: loadMysteries } = useQuery<Mystery[]>(LIST_MYSTERIES);
  const { execute: startGame, loading: starting } = useMutation<GameSession>(START_GAME);
  const router = useRouter();

  useEffect(() => { loadMysteries(); }, [loadMysteries]);

  const handleStartGame = async (mysteryId: string) => {
    try {
      const session = await startGame({ input: { mysteryId } });
      if (session) {
        router.push(`/play/?mysteryId=${mysteryId}&sessionId=${session.id}`);
      }
    } catch (e) {
      console.error('Failed to start game:', e);
    }
  };

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-parchment" style={{ fontFamily: 'var(--font-serif)' }}>
          Casos Abiertos
        </h2>
        <p className="text-sm text-fog-500 mt-1">Selecciona un misterio para comenzar la investigacion</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-10 h-10 border-2 border-brass-500/30 border-t-brass-400 rounded-full animate-spin" />
          <p className="text-sm text-fog-500" style={{ fontFamily: 'var(--font-mono)' }}>Consultando archivos...</p>
        </div>
      )}

      {/* Empty state */}
      {mysteries && mysteries.length === 0 && (
        <div className="card-case-file rounded-xl p-12 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-fog-600 mx-auto mb-4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="text-fog-500">No hay casos disponibles en este momento.</p>
        </div>
      )}

      {/* Mystery cards grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mysteries?.map((mystery, i) => {
          const diff = difficultyConfig[mystery.difficulty] || difficultyConfig.medium;
          return (
            <div
              key={mystery.id}
              className="card-case-file rounded-xl overflow-hidden animate-card-reveal"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}
            >
              {/* Case file header stripe */}
              <div className="h-1 bg-gradient-to-r from-brass-500/60 via-brass-400/30 to-transparent" />

              <div className="p-6">
                {/* Case number & stamp */}
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[10px] text-fog-600 tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                    Caso #{mystery.id.slice(-6).toUpperCase()}
                  </span>
                  <span className="stamp text-[9px] py-0 px-1.5">Abierto</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-parchment mb-3 leading-snug" style={{ fontFamily: 'var(--font-serif)' }}>
                  {mystery.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-fog-400 mb-5 leading-relaxed line-clamp-3">
                  {mystery.description}
                </p>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-3 text-xs mb-5 pb-5 border-b border-midnight-700/50">
                  <div className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fog-500">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-fog-400">{mystery.city}</span>
                  </div>
                  <span className="text-midnight-600">|</span>
                  <span className={diff.color}>{diff.label}</span>
                  <span className="text-midnight-600">|</span>
                  <div className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fog-500">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    <span className="text-fog-400">{mystery.characters?.length || 0} sospechosos</span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => handleStartGame(mystery.id)}
                  disabled={starting}
                  className="w-full py-3 rounded-lg btn-detective text-sm flex items-center justify-center gap-2"
                >
                  {starting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-midnight-950/30 border-t-midnight-950 rounded-full animate-spin" />
                      Abriendo caso...
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      Investigar Caso
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
