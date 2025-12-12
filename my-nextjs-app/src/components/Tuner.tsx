import React, { useEffect, useRef, useState } from 'react';
import { useMicrophone } from '../hooks/useMicrophone';
import styles from './Tuner.module.css';
import { detectPitch } from '../utils/pitchDetection';
import { getNoteFromFrequency, NoteResult } from '../utils/musicUtils';

const NOTES = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

// Lerp helper for smooth animation
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const Tuner: React.FC = () => {
  const [noteResult, setNoteResult] = useState<NoteResult | null>(null);
  const { analyserNode, timeDomainRef, startListening, stopListening, error } = useMicrophone();

  const targetRotationRef = useRef(0);
  const currentRotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Auto-start and stop microphone on mount/unmount
  useEffect(() => {
    startListening();
    return () => {
      stopListening();
    };
  }, [startListening, stopListening]);

  // Pitch detection loop
  useEffect(() => {
    let running = true;

    const processAudio = () => {
      if (!running || !analyserNode || !timeDomainRef.current) {
        if (running) rafRef.current = requestAnimationFrame(processAudio);
        return;
      }

      analyserNode.getFloatTimeDomainData(timeDomainRef.current);
      const pitch = detectPitch(timeDomainRef.current, analyserNode.context.sampleRate);

      if (pitch) {
        setNoteResult(getNoteFromFrequency(pitch));
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
  }, [analyserNode, timeDomainRef]);

  // Maps cents (-50 to +50) to degrees (-45 to +45 for the needle)
  const centsToDegrees = (cents: number) => {
    const limited = Math.max(-50, Math.min(50, cents));
    // This maps the cents to a +/- 45 degree swing.
    return (limited / 50) * 45;
  };

  // Animation loop for smooth needle movement
  useEffect(() => {
    const needleEl = document.querySelector(`.${styles.needle}`) as HTMLElement | null;
    if (!needleEl) return;

    let mounted = true;

    const animateNeedle = () => {
      if (!mounted) return;

      const cents = noteResult?.cents ?? 0;
      targetRotationRef.current = centsToDegrees(cents);

      // Smoothly interpolate from current to target rotation
      currentRotationRef.current = lerp(currentRotationRef.current, targetRotationRef.current, 0.1);

      // Apply rotation to the needle
      needleEl.style.transform = `translate(-50%, -100%) rotate(${currentRotationRef.current}deg)`;

      requestAnimationFrame(animateNeedle);
    };

    animateNeedle();

    return () => {
      mounted = false;
    };
  }, [noteResult]);


  // SVG arc helper functions
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const isTuned = noteResult && Math.abs(noteResult.cents) <= 5;
  const displayNote = noteResult?.note ?? '-';
  const displayOctave = noteResult?.octave ?? '';
  const displayFrequency = noteResult ? `${noteResult.frequency.toFixed(1)} Hz` : '';
  const isActiveNote = (note: string) => noteResult && noteResult.note === note;

  return (
    <div className={styles.tunerContainer}>
        <h1 className={styles.title}>Web Tuner</h1>
        <div className={styles.tuner}>
            <div className={styles.meter}>
                <div className={styles.noteDisplay}>
                    <span className={`${styles.noteName} ${isTuned ? styles.tunedColor : styles.farColor}`}>
                        {displayNote}
                        <sub className={styles.octave}>{displayOctave}</sub>
                    </span>
                    <span className={styles.frequency}>{displayFrequency}</span>
                </div>

                <div className={styles.needleContainer}>
                    <svg className={styles.gauge} viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
                        {/* Gauge arcs based on reference image: -45 to +45 degrees */}
                        {/* Red: -45 to -20 deg */}
                        <path d={describeArc(100, 100, 80, 225, 250)} className={styles.gaugeArcRed} />
                        {/* Yellow: -20 to +20 deg */}
                        <path d={describeArc(100, 100, 80, 250, 290)} className={styles.gaugeArcYellow} />
                        {/* Green: +20 to +45 deg */}
                        <path d={describeArc(100, 100, 80, 290, 315)} className={styles.gaugeArcGreen} />
                    </svg>
                    <div className={styles.needle} aria-hidden="true" />
                    <div className={styles.needleBase} aria-hidden="true" />
                </div>
            </div>

            <div className={styles.notesBar}>
                {NOTES.map((note) => (
                    <div key={note} className={`${styles.noteItem} ${isActiveNote(note) ? styles.activeNote : ''}`}>
                        <span>{note}</span>
                    </div>
                ))}
            </div>

            {error && <p className={styles.error}>Erro: {error.message}</p>}
        </div>
    </div>
  );
};

export default Tuner;