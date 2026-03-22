'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@/hooks/useGraphQL';
import { GET_MYSTERY } from '@/lib/graphql/queries';
import { START_GAME } from '@/lib/graphql/mutations';
import type { Mystery, GameSession } from '@/types';

const difficultyConfig: Record<string, { label: string; color: string }> = {
  easy: { label: 'Principiante', color: 'text-teal-400' },
  medium: { label: 'Intermedio', color: 'text-brass-400' },
  hard: { label: 'Experto', color: 'text-crimson-400' },
};

function MysteryDetailContent() {
  const searchParams = useSearchParams();
  const mysteryId = searchParams?.get('id') || '';
  const router = useRouter();

  const { data: mystery, loading, execute: loadMystery } = useQuery<Mystery>(GET_MYSTERY);
  const { execute: startGame, loading: starting } = useMutation<GameSession>(START_GAME);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (mysteryId) loadMystery({ id: mysteryId });
  }, [mysteryId, loadMystery]);

  const handleAcceptCase = async () => {
    try {
      const session = await startGame({ input: { mysteryId } });
      if (session) {
        router.push(`/play/?mysteryId=${mysteryId}&sessionId=${session.id}`);
      }
    } catch (e) {
      console.error('Failed to start game:', e);
    }
  };

  if (loading || !mystery) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-10 h-10 border-2 border-brass-500/30 border-t-brass-400 rounded-full animate-spin" />
        <p className="text-sm text-fog-500" style={{ fontFamily: 'var(--font-mono)' }}>Abriendo expediente...</p>
      </div>
    );
  }

  const diff = difficultyConfig[mystery.difficulty] || difficultyConfig.medium;

  return (
    <div className="animate-slide-up max-w-2xl mx-auto">
      {/* Case file header */}
      <div className="card-case-file rounded-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-crimson-500/60 via-brass-400/30 to-transparent" />

        <div className="p-7">
          {/* Top row: case number + classification */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-midnight-700/50">
            <div>
              <span className="text-[10px] text-fog-600 tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                Expediente #{mystery.id.slice(-6).toUpperCase()}
              </span>
            </div>
            <span className="stamp text-[10px] py-0.5 px-2">Clasificado</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-parchment mb-3 leading-snug" style={{ fontFamily: 'var(--font-serif)' }}>
            {mystery.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs mb-6">
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
            <span className="text-fog-400">{mystery.characters?.length || 0} sospechosos</span>
            <span className="text-midnight-600">|</span>
            <span className="text-fog-400">Radio: {mystery.radius}m</span>
          </div>

          {/* Description */}
          <p className="text-sm text-fog-400 leading-relaxed mb-6">{mystery.description}</p>

          {/* Briefing */}
          {mystery.briefing && (
            <div className="bg-midnight-900/60 border border-midnight-700/50 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass-500">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-xs text-brass-400 tracking-wider uppercase font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                  Briefing Confidencial
                </span>
              </div>
              <p className="text-sm text-fog-300 leading-relaxed italic">
                &ldquo;{mystery.briefing}&rdquo;
              </p>
            </div>
          )}

          {/* Suspect count (redacted style) */}
          <div className="bg-midnight-800/50 border border-midnight-700/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-fog-600">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <div>
                <span className="text-sm text-fog-400">
                  {mystery.characters?.length || 0} sospechosos identificados
                </span>
                <p className="text-xs text-fog-600 mt-0.5">Las identidades se revelaran durante la investigacion</p>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/')}
              className="flex-1 py-3 bg-midnight-800 text-fog-500 rounded-lg hover:bg-midnight-700 transition-colors text-sm"
            >
              Volver al Archivo
            </button>
            <button
              onClick={handleAcceptCase}
              disabled={starting}
              className="flex-1 py-3 rounded-lg btn-detective text-sm flex items-center justify-center gap-2"
            >
              {starting ? (
                <>
                  <div className="w-4 h-4 border-2 border-midnight-950/30 border-t-midnight-950 rounded-full animate-spin" />
                  Preparando...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Aceptar el Caso
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MysteryDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-10 h-10 border-2 border-brass-500/30 border-t-brass-400 rounded-full animate-spin" />
        <p className="text-sm text-fog-500" style={{ fontFamily: 'var(--font-mono)' }}>Abriendo expediente...</p>
      </div>
    }>
      <MysteryDetailContent />
    </Suspense>
  );
}
