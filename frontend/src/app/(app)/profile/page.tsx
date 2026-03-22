'use client';

import { useEffect } from 'react';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_USER_PROFILE, GET_ACHIEVEMENTS } from '@/lib/graphql/queries';
import type { UserProfile, Achievement } from '@/types';

export default function ProfilePage() {
  const { data: profile, loading, execute: loadProfile } = useQuery<UserProfile>(GET_USER_PROFILE);
  const { data: achievements, execute: loadAchievements } = useQuery<Achievement[]>(GET_ACHIEVEMENTS);

  useEffect(() => { loadProfile(); loadAchievements(); }, [loadProfile, loadAchievements]);

  return (
    <div className="animate-slide-up max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-parchment" style={{ fontFamily: 'var(--font-serif)' }}>
          Credencial de Agente
        </h2>
        <p className="text-sm text-fog-500 mt-1">Tu identificacion, estadisticas e insignias</p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-10 h-10 border-2 border-brass-500/30 border-t-brass-400 rounded-full animate-spin" />
          <p className="text-sm text-fog-500" style={{ fontFamily: 'var(--font-mono)' }}>Cargando expediente...</p>
        </div>
      )}

      {profile && (
        <div className="space-y-6">
          {/* ID Card */}
          <div className="card-case-file rounded-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-brass-500 via-brass-400 to-brass-600" />
            <div className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-xl bg-midnight-700/50 border-2 border-brass-600/30 flex items-center justify-center flex-shrink-0">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass-500/60">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-parchment" style={{ fontFamily: 'var(--font-serif)' }}>
                        {profile.name || 'Agente Anonimo'}
                      </h3>
                      <p className="text-sm text-fog-500 mt-0.5">{profile.email}</p>
                    </div>
                    <span className="stamp text-[9px] py-0.5 px-2">Activo</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-fog-600">
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      ID: {profile.userId.slice(0, 8).toUpperCase()}
                    </span>
                    {profile.memberSince && (
                      <>
                        <span className="text-midnight-600">|</span>
                        <span>Desde {new Date(profile.memberSince).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Casos Totales" value={profile.totalGames} icon="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <StatCard label="Casos Resueltos" value={profile.gamesSolved} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" highlight />
            <StatCard label="Tasa de Exito" value={`${profile.successRate}%`} icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </div>

          {/* Rank */}
          <div className="card-case-file rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-fog-600 tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                  Rango de Detective
                </span>
                <h4 className="text-lg font-bold text-brass-400 mt-1" style={{ fontFamily: 'var(--font-serif)' }}>
                  {getRank(profile.gamesSolved, profile.successRate)}
                </h4>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-brass-500/30 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass-400">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Achievements / Badges */}
          {achievements && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass-500">
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
                <span className="text-xs text-fog-500 tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                  Insignias ({achievements.filter(a => a.unlocked).length}/{achievements.length})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {achievements.map((ach) => (
                  <div
                    key={ach.achievementId}
                    className={`card-case-file rounded-xl p-4 text-center transition-all ${
                      ach.unlocked ? '' : 'opacity-40 grayscale'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center border-2 ${
                      ach.unlocked
                        ? 'border-brass-400/40 bg-brass-700/15'
                        : 'border-midnight-600 bg-midnight-800'
                    }`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                        className={ach.unlocked ? 'text-brass-400' : 'text-fog-600'}>
                        <circle cx="12" cy="8" r="7" />
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                      </svg>
                    </div>
                    <p className={`text-xs font-medium mb-0.5 ${ach.unlocked ? 'text-parchment-dark' : 'text-fog-600'}`}
                      style={{ fontFamily: 'var(--font-serif)' }}>
                      {ach.name}
                    </p>
                    <p className="text-[10px] text-fog-600 leading-tight">{ach.description}</p>
                    {ach.unlocked && ach.unlockedAt && (
                      <p className="text-[9px] text-teal-500 mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                        {new Date(ach.unlockedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, highlight }: { label: string; value: string | number; icon: string; highlight?: boolean }) {
  return (
    <div className="card-case-file rounded-xl p-5 text-center">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        className={`mx-auto mb-3 ${highlight ? 'text-teal-400' : 'text-fog-600'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      <div className={`text-2xl font-bold mb-1 ${highlight ? 'text-teal-400' : 'text-parchment'}`}
        style={{ fontFamily: 'var(--font-serif)' }}>
        {value}
      </div>
      <span className="text-[10px] text-fog-600 tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
        {label}
      </span>
    </div>
  );
}

function getRank(solved: number, rate: number): string {
  if (solved >= 10 && rate >= 80) return 'Detective Legendario';
  if (solved >= 5 && rate >= 60) return 'Inspector Senior';
  if (solved >= 3) return 'Detective';
  if (solved >= 1) return 'Agente de Campo';
  return 'Cadete';
}
