'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@/hooks/useGraphQL';
import { GET_MYSTERY } from '@/lib/graphql/queries';
import { SUBMIT_SOLUTION } from '@/lib/graphql/mutations';
import { GameMap } from '@/components/Map';
import { CharacterModal } from '@/components/CharacterModal';
import type { Mystery, Character, GameResult } from '@/types';

function PlayContent() {
  const searchParams = useSearchParams();
  const mysteryId = searchParams?.get('mysteryId') || '';
  const sessionId = searchParams?.get('sessionId') || '';

  const { data: mystery, execute: loadMystery } = useQuery<Mystery>(GET_MYSTERY);
  const { execute: submitSolution, loading: submitting } = useMutation<GameResult>(SUBMIT_SOLUTION);

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [solution, setSolution] = useState('');
  const [result, setResult] = useState<GameResult | null>(null);

  useEffect(() => {
    if (mysteryId) loadMystery({ id: mysteryId });
  }, [mysteryId, loadMystery]);

  const handleCharacterClick = useCallback((character: Character) => {
    setSelectedCharacter(character);
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
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-amber-400">{mystery.title}</h2>
          <p className="text-sm text-stone-500">{mystery.city} — {mystery.characters?.length || 0} personajes</p>
        </div>
        <button
          onClick={() => setShowSolutionModal(true)}
          disabled={!!result}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {result ? (result.correct ? 'Resuelto!' : 'Fallido') : 'Resolver misterio'}
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 rounded-xl overflow-hidden border border-stone-700">
        <GameMap
          center={mystery.location}
          characters={mystery.characters || []}
          onCharacterClick={handleCharacterClick}
        />
      </div>

      {/* Character Modal */}
      {selectedCharacter && (
        <CharacterModal
          character={selectedCharacter}
          mysteryTitle={mystery.title}
          onClose={() => setSelectedCharacter(null)}
        />
      )}

      {/* Solution Modal */}
      {showSolutionModal && !result && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-4">Resolver misterio</h3>
            <p className="text-sm text-stone-400 mb-4">{mystery.description}</p>
            <form onSubmit={handleSubmitSolution}>
              <input
                type="text"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 outline-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSolutionModal(false)}
                  className="flex-1 py-2 bg-stone-800 text-stone-400 rounded-lg hover:bg-stone-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !solution.trim()}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {result && showSolutionModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-xl w-full max-w-md p-6 text-center">
            <div className="text-5xl mb-4">{result.correct ? '🎉' : '💀'}</div>
            <h3 className={`text-xl font-bold mb-2 ${result.correct ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.correct ? 'Correcto!' : 'Incorrecto'}
            </h3>
            <p className="text-sm text-stone-400 mb-6">{result.message}</p>
            <button
              onClick={() => setShowSolutionModal(false)}
              className="px-6 py-2 bg-stone-800 text-stone-300 rounded-lg hover:bg-stone-700"
            >
              Cerrar
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
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PlayContent />
    </Suspense>
  );
}
