'use client';

import { useState, useCallback, useRef } from 'react';
import { generateClient } from 'aws-amplify/api';
import { GET_REALTIME_TOKEN } from '@/lib/graphql/queries';
import type { Character, TrainingState } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: any = null;
function getClient() {
  if (!_client) _client = generateClient();
  return _client;
}

const SAMPLE_RATE = 24000;

export type TranscriptEntry = { role: 'user' | 'assistant'; text: string };

export function useRealtimeConversation(character: Character, mysteryTitle: string) {
  const [state, setState] = useState<TrainingState>('idle');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micCtxRef = useRef<AudioContext | null>(null);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const playbackGainRef = useRef<GainNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const pendingTranscriptRef = useRef('');

  const buildSystemPrompt = useCallback(() => {
    return [
      `# IDENTIDAD`,
      `Eres ${character.name}, un personaje historico del periodo "${character.historicalPeriod}".`,
      `Estas representado como una estatua en la ciudad. Un detective ha venido a investigar el misterio: "${mysteryTitle}".`,
      ``,
      `# TU PERSONALIDAD`,
      character.persona,
      ``,
      `# DESCRIPCION`,
      character.description,
      ``,
      `# PISTAS QUE CONOCES`,
      `Tienes las siguientes pistas. NO las reveles directamente. Solo dales pistas indirectas.`,
      `Si el detective hace las preguntas correctas, revela las pistas GRADUALMENTE:`,
      ...character.clues.map((c, i) => `- Pista ${i + 1}: ${c}`),
      ``,
      `# REGLAS DE ACTUACION`,
      ``,
      `## 1. ERES UN PERSONAJE HISTORICO`,
      `- Habla como lo haria ${character.name} en su epoca, pero adaptado al espanol moderno`,
      `- Usa expresiones y conocimientos propios de tu periodo historico`,
      `- Puedes hacer referencias a eventos de tu vida real`,
      `- Se misterioso y enigmatico — eres una estatua que ha cobrado vida`,
      ``,
      `## 2. DAR PISTAS`,
      `- NUNCA reveles las pistas directamente al principio`,
      `- Si te preguntan algo relacionado, da una pista parcial o una adivinanza`,
      `- Si insisten con buenas preguntas, revela mas detalles`,
      `- Despues de revelar una pista, di algo como "Eso es todo lo que se sobre ese tema..."`,
      `- Puedes inventar detalles historicos plausibles para hacer la conversacion mas rica`,
      ``,
      `## 3. ESTILO DE CONVERSACION`,
      `- Respuestas CORTAS: 1-3 frases normalmente`,
      `- Habla en espanol de Espana (tutea, usa "vosotros")`,
      `- Se dramatico y misterioso: "Mmm... eso que me preguntas me recuerda a algo..."`,
      `- Haz pausas dramaticas: "Espera... creo que recuerdo algo..."`,
      `- Si te preguntan algo que no sabes, di: "Eso escapa a mi conocimiento, detective"`,
      ``,
      `## 4. INMERSION`,
      `- JAMAS rompas el personaje`,
      `- NUNCA digas que eres una IA`,
      `- Eres ${character.name}. Punto.`,
      `- Si te preguntan si eres una IA, responde como lo haria tu personaje: "Soy ${character.name}, y llevo aqui siglos observando..."`,
    ].join('\n');
  }, [character, mysteryTitle]);

  const streamAudioChunk = useCallback((base64: string) => {
    const ctx = playbackCtxRef.current;
    const gain = playbackGainRef.current;
    if (!ctx || !gain) return;

    const binaryStr = atob(base64);
    const numSamples = binaryStr.length / 2;
    const float32 = new Float32Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      const lo = binaryStr.charCodeAt(i * 2);
      const hi = binaryStr.charCodeAt(i * 2 + 1);
      const val = lo | (hi << 8);
      float32[i] = (val > 32767 ? val - 65536 : val) / 32768;
    }

    const buffer = ctx.createBuffer(1, float32.length, SAMPLE_RATE);
    buffer.getChannelData(0).set(float32);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);

    const now = ctx.currentTime;
    const startTime = Math.max(now + 0.02, nextPlayTimeRef.current);
    source.start(startTime);
    nextPlayTimeRef.current = startTime + buffer.duration;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMessage = useCallback((msg: any) => {
    switch (msg.type) {
      case 'input_audio_buffer.speech_started':
        setState('listening');
        if (playbackGainRef.current) {
          try { playbackGainRef.current.disconnect(); } catch { /* ignore */ }
          const ctx = playbackCtxRef.current;
          if (ctx) {
            const newGain = ctx.createGain();
            newGain.connect(ctx.destination);
            playbackGainRef.current = newGain;
          }
        }
        nextPlayTimeRef.current = 0;
        break;

      case 'conversation.item.input_audio_transcription.completed':
        if (msg.transcript) {
          setTranscript(prev => [...prev, { role: 'user', text: msg.transcript }]);
        }
        break;

      case 'response.audio_transcript.delta':
        pendingTranscriptRef.current += msg.delta;
        break;

      case 'response.audio.delta':
        setState('speaking');
        streamAudioChunk(msg.delta);
        break;

      case 'response.audio_transcript.done':
        if (pendingTranscriptRef.current) {
          setTranscript(prev => [...prev, { role: 'assistant', text: pendingTranscriptRef.current }]);
          pendingTranscriptRef.current = '';
        }
        break;

      case 'response.done':
        setState('connected');
        break;
    }
  }, [streamAudioChunk]);

  const startMicStream = useCallback((ws: WebSocket, stream: MediaStream, audioCtx: AudioContext) => {
    try {
      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      micProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const input = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          const s = Math.max(-1, Math.min(1, input[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        const bytes = new Uint8Array(pcm16.buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: btoa(binary) }));
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
    } catch (e) {
      console.error('Mic setup failed:', e);
      setState('error');
    }
  }, []);

  const connect = useCallback(async () => {
    setState('connecting');
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: SAMPLE_RATE, channelCount: 1, echoCancellation: true, noiseSuppression: true },
      }).catch((e: Error) => {
        throw new Error(`No se pudo acceder al microfono: ${e.message}`);
      });
      micStreamRef.current = stream;

      const pCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
      const gain = pCtx.createGain();
      gain.connect(pCtx.destination);
      playbackCtxRef.current = pCtx;
      playbackGainRef.current = gain;
      nextPlayTimeRef.current = 0;

      const micAudioCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
      micCtxRef.current = micAudioCtx;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await getClient().graphql({
        query: GET_REALTIME_TOKEN,
        variables: { characterId: character.characterId, mysteryId: character.mysteryId },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tokenData = (result as any).data?.getRealtimeToken;
      if (!tokenData || !tokenData.token) {
        throw new Error('No se pudo obtener el token de sesion.');
      }
      const { token } = tokenData;

      const ws = new WebSocket(
        'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview',
        ['realtime', `openai-insecure-api-key.${token}`, 'openai-beta.realtime-v1']
      );
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['audio', 'text'],
            instructions: buildSystemPrompt(),
            voice: character.voice || 'coral',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: { model: 'gpt-4o-mini-transcribe' },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 700,
            },
          },
        }));
        setState('connected');
        startMicStream(ws, stream, micAudioCtx);

        // The character greets the detective
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'response.create',
              response: {
                modalities: ['audio', 'text'],
                instructions: `La estatua de ${character.name} cobra vida. Saluda al detective de forma misteriosa y breve. UNA frase. Ejemplo: "Ah... un detective... hace siglos que nadie se acerca a preguntar..." o "Mmm... veo que buscas respuestas... interesante..." Habla en espanol de Espana.`,
              },
            }));
          }
        }, 600);
      };

      ws.onmessage = (event) => handleMessage(JSON.parse(event.data));
      ws.onerror = () => setState('error');
      ws.onclose = () => setState('idle');
    } catch (e: unknown) {
      const err = e as { message?: string };
      console.error('Connection failed:', e);
      setErrorMessage(err.message || 'Error de conexion');
      setState('error');
    }
  }, [character, buildSystemPrompt, handleMessage, startMicStream]);

  const disconnect = useCallback(() => {
    if (micProcessorRef.current) { micProcessorRef.current.disconnect(); micProcessorRef.current = null; }
    if (micCtxRef.current) { micCtxRef.current.close(); micCtxRef.current = null; }
    if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
    if (playbackCtxRef.current) { playbackCtxRef.current.close(); playbackCtxRef.current = null; }
    playbackGainRef.current = null;
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    setState('idle');
  }, []);

  return { state, transcript, connect, disconnect, errorMessage };
}
