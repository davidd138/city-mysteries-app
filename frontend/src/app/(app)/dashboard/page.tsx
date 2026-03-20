'use client';

import { useEffect } from 'react';
import { useQuery } from '@/hooks/useGraphQL';
import { LIST_MYSTERIES } from '@/lib/graphql/queries';
import { useMutation } from '@/hooks/useGraphQL';
import { START_GAME } from '@/lib/graphql/mutations';
import { useRouter } from 'next/navigation';
import type { Mystery, GameSession } from '@/types';

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
    <div>
      <h2 className="text-2xl font-bold text-stone-100 mb-6">Misterios disponibles</h2>
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {mysteries && mysteries.length === 0 && (
        <p className="text-stone-500 text-center py-12">No hay misterios disponibles todavia.</p>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mysteries?.map((mystery) => (
          <div
            key={mystery.id}
            className="bg-stone-800 border border-stone-700 rounded-xl p-5 hover:border-amber-600/50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-amber-400 mb-2">{mystery.title}</h3>
            <p className="text-sm text-stone-400 mb-3">{mystery.description}</p>
            <div className="flex items-center gap-3 text-xs text-stone-500 mb-4">
              <span>{mystery.city}</span>
              <span>|</span>
              <span className="capitalize">{mystery.difficulty}</span>
              <span>|</span>
              <span>{mystery.characters?.length || 0} personajes</span>
            </div>
            <button
              onClick={() => handleStartGame(mystery.id)}
              disabled={starting}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {starting ? 'Iniciando...' : 'Jugar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
