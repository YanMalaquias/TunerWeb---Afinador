// src/utils/note.ts

export const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export interface NoteData {
  note: string;
  octave: number;
  cents: number;
  frequency: number;
}

/**
 * Converte uma frequência em Hz para a nota musical mais próxima e o desvio em cents.
 */
export const getNoteFromFrequency = (frequency: number): NoteData => {
  const A4 = 440;
  const semitonesFromA4 = 12 * Math.log2(frequency / A4);
  const noteIndexTotal = Math.round(semitonesFromA4) + 69; // 69 é o número MIDI para A4
  
  const noteIndex = noteIndexTotal % 12;
  const octave = Math.floor(noteIndexTotal / 12) - 1;
  
  const note = noteStrings[noteIndex];
  
  // Calcula a frequência exata da nota mais próxima para encontrar os cents
  const exactFrequency = A4 * Math.pow(2, (noteIndexTotal - 69) / 12);
  const cents = 1200 * Math.log2(frequency / exactFrequency);

  return {
    note,
    octave,
    cents,
    frequency
  };
};
// src/hooks/useTuner.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { yin } from '../utils/yin';
import { getNoteFromFrequency, NoteData } from '../utils/note';

export const useTuner = () => {
  const [noteData, setNoteData] = useState<NoteData | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const requestRef = useRef<number>();
  const bufferRef = useRef<Float32Array | null>(null);

  const updatePitch = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current || !bufferRef.current) return;
    
    // 2. Extração da Forma de Onda
    analyserRef.current.getFloatTimeDomainData(bufferRef.current);
    
    // 3. Detecção de Pitch (YIN)
    const frequency = yin(bufferRef.current, audioContextRef.current.sampleRate);
    
    if (frequency) {
      // 4. Converter Frequência -> Nota
      const data = getNoteFromFrequency(frequency);
      setNoteData(data);
    } else {
        // Opcional: Limpar dados se nenhum pitch for detectado por um tempo
    }
    
    // 7. Loop Contínuo
    requestRef.current = requestAnimationFrame(updatePitch);
  }, []);

  const startTuner = async () => {
    try {
      // 1. Captura do Áudio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new window.AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096; // Alta resolução para melhor detecção de graves
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      bufferRef.current = new Float32Array(analyser.fftSize);
      
      setIsListening(true);
      requestRef.current = requestAnimationFrame(updatePitch);
    } catch (err) {
      console.error("Erro ao acessar o microfone", err);
    }
  };

  const stopTuner = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    setIsListening(false);
    setNoteData(null);
  };

  useEffect(() => {
    return () => {
      if (isListening) stopTuner();
    };
  }, []);

  return { startTuner, stopTuner, isListening, noteData };
};
// src/components/Tuner.tsx
import React, { useEffect, useState } from 'react';
import { useTuner } from '../hooks/useTuner';

// Função auxiliar para interpolação linear (suavização)
const lerp = (start: number, end: number, amt: number) => {
  return (1 - amt) * start + amt * end;
};

export const Tuner: React.FC = () => {
  const { startTuner, stopTuner, isListening, noteData } = useTuner();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (noteData) {
      // 5. Atualizar o Ponteiro no Gauge
      // Mapeia cents -50..50 para -45..45 graus
      const targetRotation = (noteData.cents / 50) * 45;
      
      // Movimento suave (lerp)
      setRotation(prev => lerp(prev, targetRotation, 0.1));
    } else {
        // Reseta para 0 se não houver nota
        setRotation(prev => lerp(prev, 0, 0.05));
    }
  }, [noteData]);

  // 6. Feedback Visual (Cores)
  let color = 'text-red-500'; // Vermelho padrão
  let statusColor = 'bg-red-500';
  
  if (noteData) {
    const absCents = Math.abs(noteData.cents);
    if (absCents <= 5) {
      color = 'text-green-500'; // Afinado
      statusColor = 'bg-green-500';
    } else if (absCents <= 25) {
      color = 'text-yellow-500'; // Quase lá
      statusColor = 'bg-yellow-500';
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8">Afinador Web</h1>
      
      {/* Display do Gauge */}
      <div className="relative w-64 h-32 mb-8">
        {/* Arcos de Fundo do Gauge (Representação CSS simplificada) */}
        <div className="absolute inset-0 rounded-t-full border-t-8 border-gray-700 overflow-hidden">
            <div className="absolute bottom-0 left-1/2 w-full h-full origin-bottom-left rotate-45 border-t-8 border-transparent border-l-8 border-green-500 opacity-20"></div>
        </div>

        {/* Agulha */}
        <div 
          className="absolute bottom-0 left-1/2 w-1 h-28 bg-white origin-bottom rounded-full transition-transform duration-75 ease-linear"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
            <div className={`w-3 h-3 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2  shadow-[0_0_10px_rgba(255,255,255,0.8)]`}></div>
        </div>
        
        {/* Pivô */}
        <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-gray-500 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Display da Nota */}
      <div className="text-center mb-8 h-32">
        {noteData ? (
          <>
            <div className={`text-8xl font-black  transition-colors duration-200`}>
              {noteData.note}
            </div>
            <div className="text-2xl text-gray-400">
              {noteData.octave}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {noteData.cents.toFixed(1)} cents | {noteData.frequency.toFixed(1)} Hz
            </div>
          </>
        ) : (
          <div className="text-6xl text-gray-700">--</div>
        )}
      </div>

      {/* Controles */}
      <button
        onClick={isListening ? stopTuner : startTuner}
        className={`px-8 py-3 rounded-full font-bold text-lg transition-all ${
          isListening 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isListening ? 'Parar' : 'Iniciar Afinador'}
      </button>
    </div>
  );
};
// src/utils/yin.ts

/**
 * Implementa o Algoritmo de Detecção de Pitch YIN.
 * @param float32AudioBuffer O buffer contendo dados de áudio no domínio do tempo.
 * @param sampleRate A taxa de amostragem do contexto de áudio.
 * @returns A frequência fundamental detectada (Hz) ou null se não encontrada.
 */
export const yin = (float32AudioBuffer: Float32Array, sampleRate: number): number | null => {
  const threshold = 0.10; // Limiar padrão para o YIN
  const bufferSize = float32AudioBuffer.length;
  const yinBufferLength = bufferSize / 2;
  const yinBuffer = new Float32Array(yinBufferLength);

  // Passo 1: Função de Diferença (Autocorrelação)
  // d(tau) = Σ (x[t] - x[t+tau])^2
  for (let t = 0; t < yinBufferLength; t++) {
    yinBuffer[t] = 0;
    for (let i = 0; i < yinBufferLength; i++) {
      const delta = float32AudioBuffer[i] - float32AudioBuffer[i + t];
      yinBuffer[t] += delta * delta;
    }
  }

  // Passo 2: Função de Diferença Média Normalizada Cumulativa (CMNDF)
  // d'(tau) = d(tau) / ((1/tau) * Σ d(j))
  yinBuffer[0] = 1;
  let runningSum = 0;
  for (let t = 1; t < yinBufferLength; t++) {
    runningSum += yinBuffer[t];
    yinBuffer[t] *= t / runningSum;
  }

  // Passo 3: Limiar Absoluto
  // Encontra o primeiro tau onde a diferença normalizada está abaixo do limiar
  let tau = -1;
  for (let t = 2; t < yinBufferLength; t++) {
    if (yinBuffer[t] < threshold) {
      while (t + 1 < yinBufferLength && yinBuffer[t + 1] < yinBuffer[t]) {
        t++;
      }
      tau = t;
      break;
    }
  }

  if (tau === -1) return null; // Nenhum pitch encontrado

  // Passo 4: Interpolação Parabólica
  // Refina a localização do mínimo para maior precisão
  const x0 = tau;
  const x2 = tau + 1 < yinBufferLength ? tau + 1 : tau;
  const x1 = tau - 1 >= 0 ? tau - 1 : tau;
  
  const s0 = yinBuffer[x0];
  const s1 = yinBuffer[x1];
  const s2 = yinBuffer[x2];

  let betterTau = tau;
  if (x0 !== x1 && x0 !== x2) {
      betterTau = tau + (s2 - s1) / (2 * (2 * s0 - s2 - s1));
  }

  return sampleRate / betterTau;
};
