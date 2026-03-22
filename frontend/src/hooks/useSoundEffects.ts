'use client';

import { useCallback, useRef, useState } from 'react';

type SoundEffect = 'clue' | 'hint' | 'correct' | 'incorrect' | 'ambient';

export function useSoundEffects() {
  const [muted, setMuted] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<OscillatorNode | null>(null);

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const playNote = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) => {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }, [getContext]);

  const play = useCallback((effect: SoundEffect) => {
    if (muted) return;
    const t = getContext().currentTime;

    switch (effect) {
      case 'clue':
        // Rising mysterious chime
        playNote(440, 0.3, 'sine', 0.1);
        setTimeout(() => playNote(554, 0.3, 'sine', 0.1), 100);
        setTimeout(() => playNote(659, 0.5, 'sine', 0.08), 200);
        break;
      case 'hint':
        // Low mysterious tone
        playNote(220, 0.5, 'triangle', 0.12);
        setTimeout(() => playNote(196, 0.7, 'triangle', 0.08), 200);
        break;
      case 'correct':
        // Triumphant rising tones
        playNote(523, 0.2, 'sine', 0.12);
        setTimeout(() => playNote(659, 0.2, 'sine', 0.12), 150);
        setTimeout(() => playNote(784, 0.3, 'sine', 0.12), 300);
        setTimeout(() => playNote(1047, 0.5, 'sine', 0.1), 450);
        break;
      case 'incorrect':
        // Low descending tones
        playNote(330, 0.3, 'sawtooth', 0.06);
        setTimeout(() => playNote(277, 0.4, 'sawtooth', 0.05), 200);
        setTimeout(() => playNote(220, 0.6, 'sawtooth', 0.04), 400);
        break;
    }
  }, [muted, getContext, playNote]);

  const startAmbient = useCallback(() => {
    if (ambientRef.current || muted) return;
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, ctx.currentTime);
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    ambientRef.current = osc;
  }, [muted, getContext]);

  const stopAmbient = useCallback(() => {
    if (ambientRef.current) {
      ambientRef.current.stop();
      ambientRef.current = null;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      if (!prev) {
        stopAmbient();
      }
      return !prev;
    });
  }, [stopAmbient]);

  return { play, muted, toggleMute, startAmbient, stopAmbient };
}
