'use client';

import { useRealtimeConversation } from '@/hooks/useRealtimeConversation';
import type { Character } from '@/types';

type CharacterModalProps = {
  character: Character;
  mysteryTitle: string;
  onClose: () => void;
};

export function CharacterModal({ character, mysteryTitle, onClose }: CharacterModalProps) {
  const { state, transcript, connect, disconnect, errorMessage } = useRealtimeConversation(character, mysteryTitle);

  const isConnecting = state === 'connecting';
  const isActive = state === 'connected' || state === 'listening' || state === 'speaking';
  const canConnect = state === 'idle' || state === 'error';

  const handleToggle = () => {
    if (isActive) {
      disconnect();
    } else if (canConnect) {
      connect();
    }
  };

  const handleClose = () => {
    disconnect();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-amber-400">{character.name}</h3>
            <p className="text-xs text-stone-500">{character.historicalPeriod} — {character.statue.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-stone-500 hover:text-stone-300 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <div className="px-4 py-3 border-b border-stone-800">
          <p className="text-sm text-stone-400">{character.description}</p>
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
          {transcript.length === 0 && !isActive && (
            <p className="text-stone-600 text-center text-sm py-8">
              Pulsa &ldquo;Hablar&rdquo; para iniciar la conversacion
            </p>
          )}
          {transcript.map((entry, i) => (
            <div
              key={i}
              className={`text-sm p-3 rounded-lg ${
                entry.role === 'user'
                  ? 'bg-stone-800 text-stone-300 ml-8'
                  : 'bg-amber-900/20 text-amber-200 mr-8 border border-amber-900/30'
              }`}
            >
              <span className="text-xs text-stone-600 block mb-1">
                {entry.role === 'user' ? 'Tu' : character.name}
              </span>
              {entry.text}
            </div>
          ))}
          {state === 'listening' && (
            <div className="text-sm text-stone-500 text-center">Escuchando...</div>
          )}
          {state === 'speaking' && (
            <div className="text-sm text-amber-400 text-center">
              {character.name} esta hablando...
            </div>
          )}
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="px-4 py-2 bg-red-500/10 text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Controls */}
        <div className="p-4 border-t border-stone-800 flex gap-3">
          <button
            onClick={handleToggle}
            className={`flex-1 py-2 font-medium rounded-lg transition-colors ${
              isActive
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : isConnecting
                ? 'bg-stone-700 text-stone-400 cursor-wait'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
            disabled={isConnecting}
          >
            {isConnecting ? 'Conectando...' : isActive ? 'Terminar conversacion' : 'Hablar con ' + character.name}
          </button>
        </div>
      </div>
    </div>
  );
}
