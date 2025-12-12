import React, { useEffect, useRef, useState } from 'react';
import { useMicrophone } from '../../hooks/useMicrophone';
import styles from './Tuner.module.css';
import { detectPitch } from '../../utils/pitchDetection';
import { getNoteFromFrequency, NoteResult } from '../../utils/musicUtils';

const NOTES = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

// Helper para interpolação linear (suavização)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const Tuner: React.FC = () => {
  const [noteResult, setNoteResult] = useState<NoteResult | null>(null);
  const [rotation, setRotation] = useState(0);
  const { isListening, analyserNode, timeDomainRef, startListening, stopListening, error } = useMicrophone();

  const targetRotationRef = useRef(0);
  const currentRotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Loop de detecção de afinação
  useEffect(() => {
    if (!isListening || !analyserNode || !timeDomainRef.current) return;

    let running = true;
    const processAudio = () => {
      if (!running) return;

      analyserNode.getFloatTimeDomainData(timeDomainRef.current);
      const pitch = detectPitch(timeDomainRef.current, analyserNode.context.sampleRate);
      
      if (pitch) {
        const note = getNoteFromFrequency(pitch);
        // anexa a frequência para exibição
        if (note) note.frequency = pitch;
        setNoteResult(note);
      } else {
        setNoteResult(null);
      }
      rafRef.current = requestAnimationFrame(processAudio);
    };

    processAudio();

    return () => {
      running = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isListening, analyserNode, timeDomainRef]);

  // Mapeia cents (-50 a +50) para graus de rotação (-45 a +45)
  const centsToDegrees = (cents: number) => {
    const limited = Math.max(-50, Math.min(50, cents));
    return (limited / 50) * 45;
  };

  // Loop de animação para suavizar o movimento do ponteiro
  useEffect(() => {
    const cents = noteResult?.cents ?? 0;
    targetRotationRef.current = centsToDegrees(cents);

    let mounted = true;
    const animateNeedle = () => {
      if (!mounted) return;

      const smoothing = 0.12; // Fator de suavização
      currentRotationRef.current = lerp(currentRotationRef.current, targetRotationRef.current, smoothing);
      setRotation(currentRotationRef.current);

      requestAnimationFrame(animateNeedle);
    };

    animateNeedle();
    return () => {
      mounted = false;
    };
  }, [noteResult]);


  const handleToggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  // Helpers para SVG: centro (100,100), semicírculo de 225 a 315 graus (arco superior)
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    return ["M", start.x, start.y, "A", radius, radius, 0, "0", 0, end.x, end.y].join(" ");
  };

  const isTuned = noteResult && Math.abs(noteResult.cents ?? 999) <= 5;
  const isActiveNote = (note: string) => noteResult && noteResult.note === note;

  return (
    <div className={styles.tunerContainer}>
      <h1 className={styles.title}>Web Tuner</h1>
      <div className={styles.tuner}>
        <div className={styles.meter}>
          
          <div className={styles.noteDisplay}>
            <span className={`${styles.noteName} ${isTuned ? styles.tunedColor : ''}`}>
              {noteResult?.note ?? '--'}
              <sub className={styles.octave}>{noteResult?.octave}</sub>
            </span>
            <span className={styles.frequency}>
              {noteResult?.frequency ? `${noteResult.frequency.toFixed(1)} Hz` : ''}
            </span>
          </div>
          
          <div className={styles.needleContainer}>
            <svg className={styles.gauge} viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
              {/* Arco redesenhado para 90 graus (-45 a +45) */}
              <path d={describeArc(100, 100, 75, 225, 247.5)} className={styles.gaugeArcRed} />
              <path d={describeArc(100, 100, 75, 247.5, 265)} className={styles.gaugeArcYellow} />
              <path d={describeArc(100, 100, 75, 265, 275)} className={styles.gaugeArcGreen} />
              <path d={describeArc(100, 100, 75, 275, 292.5)} className={styles.gaugeArcYellow} />
              <path d={describeArc(100, 100, 75, 292.5, 315)} className={styles.gaugeArcRed} />

              {/* Marcas centrais */}
              <line x1="100" y1="25" x2="100" y2="35" className={styles.gaugeTick} />
            </svg>
            
            <div 
              className={styles.needle} 
              style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }} 
              aria-hidden="true" 
            />
            <div className={`${styles.needleBase} ${isTuned ? styles.tuned : ''}`} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.notesBar}>
          {NOTES.map(note => (
            <div key={note} className={`${styles.noteItem} ${isActiveNote(note) ? styles.activeNote : ''}`}>
              {note}
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleToggleListening} className={styles.ctaButton}>
        {isListening ? 'Parar' : 'Iniciar Afinador'}
      </button>

      {error && <p className={styles.error}>Erro: {error.message}</p>}
    </div>
  );
};

export default Tuner;
