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
    <div className="fixed inset-0 bg-midnight-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-case-file rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-card-reveal overflow-hidden">
        {/* Header - portrait style */}
        <div className="p-5 border-b border-midnight-700/50 bg-gradient-to-r from-midnight-800 to-midnight-900">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Character silhouette */}
              <div className="w-14 h-14 rounded-lg bg-midnight-700/50 border border-brass-600/20 flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass-500/60">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-parchment" style={{ fontFamily: 'var(--font-serif)' }}>
                  {character.name}
                </h3>
                <p className="text-xs text-fog-500 mt-0.5">{character.historicalPeriod}</p>
                <p className="text-[10px] text-fog-600 mt-1 flex items-center gap-1" style={{ fontFamily: 'var(--font-mono)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {character.statue.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-fog-600 hover:text-fog-300 transition-colors p-1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="px-5 py-3 border-b border-midnight-700/50">
          <p className="text-sm text-fog-400 leading-relaxed italic">&ldquo;{character.description}&rdquo;</p>
        </div>

        {/* Transcript area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[200px]">
          {transcript.length === 0 && !isActive && (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full border border-brass-600/20 mx-auto mb-3 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass-500/40">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
              <p className="text-fog-600 text-sm">Inicia la conversacion para interrogar a {character.name}</p>
            </div>
          )}
          {transcript.map((entry, i) => (
            <div
              key={i}
              className={`text-sm p-3.5 rounded-lg animate-slide-up ${
                entry.role === 'user'
                  ? 'bg-midnight-700/40 text-fog-300 ml-8 border border-midnight-600/30'
                  : 'bg-brass-700/10 text-brass-200 mr-8 border border-brass-600/15'
              }`}
            >
              <span className="text-[10px] text-fog-600 block mb-1 tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                {entry.role === 'user' ? 'Detective' : character.name}
              </span>
              {entry.text}
            </div>
          ))}

          {/* Live states */}
          {state === 'listening' && (
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-teal-500">Escuchando...</span>
            </div>
          )}
          {state === 'speaking' && (
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="flex gap-0.5 items-end h-4">
                <div className="w-1 bg-brass-400 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0ms' }} />
                <div className="w-1 bg-brass-400 rounded-full animate-pulse" style={{ height: '80%', animationDelay: '100ms' }} />
                <div className="w-1 bg-brass-400 rounded-full animate-pulse" style={{ height: '60%', animationDelay: '200ms' }} />
                <div className="w-1 bg-brass-400 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '300ms' }} />
                <div className="w-1 bg-brass-400 rounded-full animate-pulse" style={{ height: '50%', animationDelay: '400ms' }} />
              </div>
              <span className="text-xs text-brass-400" style={{ fontFamily: 'var(--font-serif)' }}>
                {character.name} habla...
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="px-5 py-2.5 bg-crimson-900/30 border-t border-crimson-500/20 text-crimson-400 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Controls */}
        <div className="p-5 border-t border-midnight-700/50">
          <button
            onClick={handleToggle}
            className={`w-full py-3 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              isActive
                ? 'bg-crimson-500/20 border border-crimson-500/30 text-crimson-400 hover:bg-crimson-500/30'
                : isConnecting
                ? 'bg-midnight-700 text-fog-500 cursor-wait border border-midnight-600'
                : 'btn-detective'
            }`}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-fog-500/30 border-t-fog-400 rounded-full animate-spin" />
                Estableciendo conexion...
              </>
            ) : isActive ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Terminar Interrogatorio
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
                Interrogar a {character.name}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
