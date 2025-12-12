import { useEffect, useRef, useState } from "react";
import styles from "../styles/Tuner.module.css";

export default function Tuner() {
  const [frequency, setFrequency] = useState<number | null>(null);
  const [note, setNote] = useState("--");
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cents, setCents] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const isStoppingRef = useRef(false);
  const buffer = useRef(new Float32Array(4096)).current;

  // ✅ Expandido para múltiplas oitavas
  const NOTES = [
    { name: "C", freq: 261.63 },
    { name: "C#", freq: 277.18 },
    { name: "D", freq: 293.66 },
    { name: "D#", freq: 311.13 },
    { name: "E", freq: 329.63 },
    { name: "F", freq: 349.23 },
    { name: "F#", freq: 369.99 },
    { name: "G", freq: 392.0 },
    { name: "G#", freq: 415.3 },
    { name: "A", freq: 440.0 },
    { name: "A#", freq: 466.16 },
    { name: "B", freq: 493.88 },
  ];

  const MIN_FREQ = 80;
  const MAX_FREQ = 1000;
  const CONFIDENCE_THRESHOLD = 0.01;

  const getClosestNote = (freq: number) => {
    let best = NOTES[0];
    let minDiff = Math.abs(freq - best.freq);

    NOTES.forEach((n) => {
      const diff = Math.abs(freq - n.freq);
      if (diff < minDiff) {
        minDiff = diff;
        best = n;
      }
    });

    // ✅ Calcular acurácia (0-100%)
    const accuracy = Math.max(0, 100 - (minDiff * 10));
    return { ...best, diff: minDiff, accuracy };
  };

  const calculateCents = (freq: number, noteFreq: number): number => {
    if (freq <= 0 || noteFreq <= 0) return 0;
    return Math.round(1200 * Math.log2(freq / noteFreq));
  };

  // ✅ Algoritmo de autocorrelação otimizado
  const autoCorrelate = (buffer: Float32Array, sampleRate: number): number | null => {
    // Normalizar buffer
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);

    if (rms < 0.01) return null; // Muito silencioso

    let bestOffset = -1;
    let bestCorrelation = 0;
    const minOffset = Math.floor(sampleRate / MAX_FREQ);
    const maxOffset = Math.floor(sampleRate / MIN_FREQ);

    for (let offset = minOffset; offset < maxOffset; offset++) {
      let correlation = 0;

      for (let i = 0; i < buffer.length - offset; i++) {
        correlation += Math.abs(buffer[i] * buffer[i + offset]);
      }

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    }

    if (bestOffset > -1 && bestCorrelation > CONFIDENCE_THRESHOLD) {
      return sampleRate / bestOffset;
    }

    return null;
  };

  const detectNote = () => {
    if (!analyserRef.current || !audioContextRef.current || !isActive) return;

    analyserRef.current.getFloatTimeDomainData(buffer);
    const freq = autoCorrelate(buffer, audioContextRef.current.sampleRate);

    if (freq && freq >= MIN_FREQ && freq <= MAX_FREQ) {
      setFrequency(freq);
      const closest = getClosestNote(freq);
      setNote(closest.name);
      setCents(calculateCents(freq, closest.freq));
      setAccuracy(Math.round(closest.accuracy));
    } else {
      setNote("--");
      setFrequency(null);
      setCents(0);
      setAccuracy(0);
    }

    animationIdRef.current = requestAnimationFrame(detectNote);
  };

  const startTuner = async () => {
    try {
      setError(null);
      setIsLoading(true);
      isStoppingRef.current = false;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 4096;

      source.connect(analyserRef.current);
      setIsActive(true);
      setIsLoading(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
      setError(`Permissão negada: ${errorMsg}`);
      setIsActive(false);
      setIsLoading(false);
    }
  };

  const stopTuner = async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    setIsActive(false);

    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      await audioContextRef.current.close();
    }

    setFrequency(null);
    setNote("--");
    setCents(0);
    setAccuracy(0);
    
    // ✅ Reset com delay para evitar race condition
    await new Promise((resolve) => setTimeout(resolve, 100));
    isStoppingRef.current = false;
  };

  useEffect(() => {
    if (isActive) {
      detectNote();
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isActive]);

  useEffect(() => {
    return () => {
      stopTuner();
    };
  }, []);

  return (
    <div className={styles.container}>
      <h1>🎸 Afinador Web</h1>

      <div className={styles.buttons}>
        <button
          onClick={startTuner}
          disabled={isActive || isLoading}
          className={styles.btnStart}
        >
          {isLoading ? "Iniciando..." : "Ativar Microfone"}
        </button>
        <button
          onClick={stopTuner}
          disabled={!isActive}
          className={styles.btnStop}
        >
          Desativar
        </button>
      </div>

      {error && <p className={styles.error}>⚠️ {error}</p>}

      <div className={styles.display}>
        <h2 className={isActive ? styles.active : ""}>{note}</h2>
        <p className={styles.frequency}>
          {frequency ? `${frequency.toFixed(2)} Hz` : "Aguardando áudio..."}
        </p>

        <div className={styles.tuningBar}>
          <div className={styles.centerLine}></div>
          <div
            className={styles.tuningIndicator}
            style={{
              left: `${50 + Math.min(Math.max(cents / 2, -50), 50)}%`,
            }}
          ></div>
        </div>

        <p className={styles.cents}>
          Cents: <span className={cents === 0 ? styles.inTune : ""}>{cents > 0 ? `+${cents}` : cents}</span>
        </p>

        <p className={styles.accuracy}>
          Acurácia: <span>{accuracy}%</span>
        </p>

        <p className={styles.status}>
          {isActive ? "🔴 Microfone ativo" : "⚪ Microfone inativo"}
        </p>
      </div>
    </div>
  );
}