'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@/hooks/useGraphQL';
import { GET_MYSTERY } from '@/lib/graphql/queries';
import { SUBMIT_SOLUTION, USE_HINT } from '@/lib/graphql/mutations';
import dynamic from 'next/dynamic';

const GameMap = dynamic(() => import('@/components/Map').then(m => ({ default: m.GameMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-midnight-900/50 rounded-xl">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-brass-500/30 border-t-brass-400 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-fog-500" style={{ fontFamily: 'var(--font-mono)' }}>Cargando mapa...</p>
      </div>
    </div>
  ),
});

const CharacterModal = dynamic(() => import('@/components/CharacterModal').then(m => ({ default: m.CharacterModal })), {
  ssr: false,
});
import type { Mystery, Character, GameResult, Hint } from '@/types';

function PlayContent() {
  const searchParams = useSearchParams();
  const mysteryId = searchParams?.get('mysteryId') || '';
  const sessionId = searchParams?.get('sessionId') || '';

  const { data: mystery, execute: loadMystery } = useQuery<Mystery>(GET_MYSTERY);
  const { execute: submitSolution, loading: submitting } = useMutation<GameResult>(SUBMIT_SOLUTION);
  const { execute: requestHint, loading: hintLoading } = useMutation<Hint>(USE_HINT);

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [visitedCharacters, setVisitedCharacters] = useState<Set<string>>(new Set());
  const [showGallery, setShowGallery] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [solution, setSolution] = useState('');
  const [result, setResult] = useState<GameResult | null>(null);
  const [currentHint, setCurrentHint] = useState<Hint | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (result) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [result]);

  useEffect(() => {
    if (mysteryId) loadMystery({ id: mysteryId });
  }, [mysteryId, loadMystery]);

  const handleCharacterClick = useCallback((character: Character) => {
    setSelectedCharacter(character);
    setVisitedCharacters(prev => new Set(prev).add(character.characterId));
  }, []);

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !solution.trim()) return;
    try {
      const res = await submitSolution({ input: { sessionId, solution: solution.trim() } });
      if (res) setResult(res);
    } catch (err) {
      console.error('Submit failed:', err);
    }
  };

  if (!mystery) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-10 h-10 border-2 border-brass-500/30 border-t-brass-400 rounded-full animate-spin" />
        <p className="text-sm text-fog-500" style={{ fontFamily: 'var(--font-mono)' }}>Cargando expediente...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-parchment" style={{ fontFamily: 'var(--font-serif)' }}>
            {mystery.title}
          </h2>
          <p className="text-sm text-fog-500 flex items-center gap-2 mt-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fog-600">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {mystery.city} — {mystery.characters?.length || 0} sospechosos
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="px-3 py-2 bg-midnight-800/60 border border-midnight-700/30 rounded-lg flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-fog-500">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-sm text-fog-400 tabular-nums" style={{ fontFamily: 'var(--font-mono)', minWidth: '48px' }}>
              {String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:{String(elapsedSeconds % 60).padStart(2, '0')}
            </span>
          </div>

          {/* Hint button */}
          <button
            onClick={async () => {
              if (hintsUsed >= 3 || hintLoading || !!result) return;
              try {
                const hint = await requestHint({ sessionId });
                if (hint) {
                  setCurrentHint(hint);
                  setShowHint(true);
                  setHintsUsed(3 - hint.hintsRemaining);
                }
              } catch (e) {
                console.error('Hint failed:', e);
              }
            }}
            disabled={hintsUsed >= 3 || hintLoading || !!result}
            className="px-4 py-2.5 rounded-lg bg-midnight-800 border border-midnight-700/50 text-fog-400 hover:text-brass-400 hover:border-brass-600/30 transition-all text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            title={`${3 - hintsUsed} pistas restantes`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {hintsUsed}/3
          </button>

        <button
          onClick={() => setShowSolutionModal(true)}
          disabled={!!result}
          className="px-5 py-2.5 rounded-lg btn-detective text-sm flex items-center gap-2"
        >
          {result ? (
            result.correct ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-400">
                  <path d="M9 12l2 2 4-4" />
                </svg>
                Caso Resuelto
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-crimson-400">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                Caso Cerrado
              </>
            )
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
              </svg>
              Resolver Caso
            </>
          )}
        </button>
        </div>
      </div>

      {/* Map + Gallery */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Map */}
        <div className="flex-1 rounded-xl overflow-hidden border-aged">
          <GameMap
            center={mystery.location}
            characters={mystery.characters || []}
            onCharacterClick={handleCharacterClick}
          />
        </div>

        {/* Character Gallery Panel */}
        <div className={`transition-all duration-300 ${showGallery ? 'w-64' : 'w-10'} flex-shrink-0`}>
          {/* Toggle button */}
          <button
            onClick={() => setShowGallery(!showGallery)}
            className="w-10 h-10 rounded-lg card-case-file flex items-center justify-center mb-2"
            title={showGallery ? 'Ocultar galeria' : 'Ver sospechosos'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass-400">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </button>

          {showGallery && (
            <div className="card-case-file rounded-xl p-3 h-[calc(100%-48px)] overflow-y-auto animate-slide-up">
              <span className="text-[9px] text-fog-600 tracking-widest uppercase block mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
                Sospechosos ({visitedCharacters.size}/{mystery.characters?.length || 0})
              </span>
              <div className="space-y-2">
                {mystery.characters?.map((char) => {
                  const visited = visitedCharacters.has(char.characterId);
                  return (
                    <button
                      key={char.characterId}
                      onClick={() => visited ? handleCharacterClick(char) : undefined}
                      className={`w-full text-left p-2.5 rounded-lg transition-all ${
                        visited
                          ? 'bg-brass-700/10 border border-brass-600/15 cursor-pointer hover:bg-brass-700/20'
                          : 'bg-midnight-800/50 border border-midnight-700/30 cursor-default'
                      }`}
                    >
                      {/* Polaroid-style card */}
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                          visited ? 'bg-brass-700/20 border border-brass-600/20' : 'bg-midnight-700/30 border border-midnight-600/20'
                        }`}>
                          {visited ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass-400">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-fog-600">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-medium truncate ${visited ? 'text-parchment-dark' : 'text-fog-600'}`}>
                            {visited ? char.name : '???'}
                          </p>
                          <p className="text-[10px] text-fog-600 truncate">
                            {visited ? char.historicalPeriod : 'Sin identificar'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Character Modal */}
      {selectedCharacter && (
        <CharacterModal
          character={selectedCharacter}
          mysteryTitle={mystery.title}
          onClose={() => setSelectedCharacter(null)}
        />
      )}

      {/* Hint Modal */}
      {showHint && currentHint && (
        <div className="fixed inset-0 bg-midnight-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-case-file rounded-xl w-full max-w-sm p-6 animate-card-reveal">
            <div className="flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass-400">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h3 className="text-base font-bold text-parchment" style={{ fontFamily: 'var(--font-serif)' }}>
                Nota Misteriosa
              </h3>
            </div>
            <div className="bg-midnight-900/60 border border-midnight-700/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-fog-300 italic leading-relaxed" style={{ fontFamily: 'var(--font-serif)' }}>
                &ldquo;{currentHint.text}&rdquo;
              </p>
            </div>
            <p className="text-xs text-fog-600 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
              Pistas restantes: {currentHint.hintsRemaining}
            </p>
            <button
              onClick={() => setShowHint(false)}
              className="w-full py-2.5 bg-midnight-800 text-fog-400 rounded-lg hover:bg-midnight-700 transition-colors text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Solution Modal */}
      {showSolutionModal && !result && (
        <div className="fixed inset-0 bg-midnight-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-case-file rounded-xl w-full max-w-md p-7 animate-slide-up">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-midnight-700/50">
              <h3 className="text-lg font-bold text-parchment" style={{ fontFamily: 'var(--font-serif)' }}>
                Presentar Solucion
              </h3>
              <span className="stamp text-[9px] py-0 px-1.5">Definitivo</span>
            </div>
            <p className="text-sm text-fog-400 mb-5 leading-relaxed">{mystery.description}</p>
            <form onSubmit={handleSubmitSolution}>
              <label className="block text-xs text-fog-500 mb-1.5 tracking-wider uppercase">
                Tu veredicto
              </label>
              <input
                type="text"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Nombre del culpable..."
                className="w-full px-4 py-2.5 rounded-lg input-noir text-sm mb-5"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSolutionModal(false)}
                  className="flex-1 py-2.5 bg-midnight-800 text-fog-500 rounded-lg hover:bg-midnight-700 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !solution.trim()}
                  className="flex-1 py-2.5 rounded-lg btn-detective text-sm"
                >
                  {submitting ? 'Deliberando...' : 'Presentar Veredicto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {result && showSolutionModal && (
        <div className="fixed inset-0 bg-midnight-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-case-file rounded-xl w-full max-w-md p-8 text-center animate-card-reveal">
            <div className={`w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center ${
              result.correct
                ? 'bg-teal-600/20 border-2 border-teal-500/30'
                : 'bg-crimson-600/20 border-2 border-crimson-500/30'
            }`}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                className={result.correct ? 'text-teal-400' : 'text-crimson-400'}>
                <path d={result.correct
                  ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  : 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
                } />
              </svg>
            </div>
            <h3 className={`text-xl font-bold mb-3 ${result.correct ? 'text-teal-400' : 'text-crimson-400'}`}
              style={{ fontFamily: 'var(--font-serif)' }}>
              {result.correct ? 'Caso Resuelto' : 'Veredicto Incorrecto'}
            </h3>
            <p className="text-sm text-fog-400 mb-4 leading-relaxed">{result.message}</p>
            {result.correct && result.session?.score && (
              <div className="flex items-center justify-center gap-6 mb-6 p-3 bg-midnight-800/50 rounded-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-brass-400" style={{ fontFamily: 'var(--font-serif)' }}>
                    {result.session.score}
                  </div>
                  <span className="text-[9px] text-fog-600 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Puntos</span>
                </div>
                {result.session.elapsedSeconds != null && (
                  <div className="text-center">
                    <div className="text-xl font-bold text-fog-300" style={{ fontFamily: 'var(--font-serif)' }}>
                      {Math.floor(result.session.elapsedSeconds / 60)}:{String(result.session.elapsedSeconds % 60).padStart(2, '0')}
                    </div>
                    <span className="text-[9px] text-fog-600 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Tiempo</span>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setShowSolutionModal(false)}
              className="px-8 py-2.5 bg-midnight-800 text-fog-400 rounded-lg hover:bg-midnight-700 transition-colors text-sm"
            >
              Cerrar Expediente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-10 h-10 border-2 border-brass-500/30 border-t-brass-400 rounded-full animate-spin" />
        <p className="text-sm text-fog-500" style={{ fontFamily: 'var(--font-mono)' }}>Cargando expediente...</p>
      </div>
    }>
      <PlayContent />
    </Suspense>
  );
}
