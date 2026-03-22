'use client';

import { useEffect } from 'react';
import { useQuery } from '@/hooks/useGraphQL';
import { LIST_MYSTERIES } from '@/lib/graphql/queries';
import { useRouter } from 'next/navigation';
import { CardSkeleton } from '@/components/Skeleton';
import type { Mystery } from '@/types';

const difficultyConfig: Record<string, { label: string; color: string }> = {
  easy: { label: 'Principiante', color: 'text-teal-400' },
  medium: { label: 'Intermedio', color: 'text-brass-400' },
  hard: { label: 'Experto', color: 'text-crimson-400' },
};

export default function DashboardPage() {
  const { data: mysteries, loading, execute: loadMysteries } = useQuery<Mystery[]>(LIST_MYSTERIES);
  const router = useRouter();

  useEffect(() => { loadMysteries(); }, [loadMysteries]);

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-parchment" style={{ fontFamily: 'var(--font-serif)' }}>
          Casos Abiertos
        </h2>
        <p className="text-sm text-fog-500 mt-1">Selecciona un misterio para comenzar la investigacion</p>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
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
                  onClick={() => router.push(`/mystery/?id=${mystery.id}`)}
                  className="w-full py-3 rounded-lg btn-detective text-sm flex items-center justify-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Ver Expediente
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
