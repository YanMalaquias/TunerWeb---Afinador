import React from 'react';
import styles from './Tuner.module.css';
import { NoteData } from '../utils/musicUtils';

interface TunerProps {
  noteData: NoteData | null;
  needleAngle: number;
}

const Tuner: React.FC<TunerProps> = ({ noteData, needleAngle }) => {
  const cents = noteData?.cents ?? 0;

  // Determine the color based on the cents deviation
  const getTuningColor = (c: number): string => {
    const absCents = Math.abs(c);
    if (absCents <= 5) return styles.inTune;
    if (absCents <= 25) return styles.close;
    return styles.outOfTune;
  };

  const tuningColorClass = getTuningColor(cents);
  const isInTune = Math.abs(cents) <= 5;

  return (
    <div className={styles.tunerWrapper}>
      <div className={styles.gauge}>
        <svg
          className={styles.gaugeSvg}
          viewBox="0 0 200 100"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Base Arc */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="4"
            fill="none"
          />
          {/* Colored Arcs for feedback */}
          <g className={styles.arcs}>
             {/* Red Low */}
             <path d="M 10 100 A 90 90 0 0 1 34.6 39.4" className={styles.arcRed} />
            {/* Yellow Low */}
            <path d="M 34.6 39.4 A 90 90 0 0 1 73.2 13.5" className={styles.arcYellow} />
            {/* Green Center */}
            <path d="M 73.2 13.5 A 90 90 0 0 1 126.8 13.5" className={styles.arcGreen} />
            {/* Yellow High */}
            <path d="M 126.8 13.5 A 90 90 0 0 1 165.4 39.4" className={styles.arcYellow} />
            {/* Red High */}
            <path d="M 165.4 39.4 A 90 90 0 0 1 190 100" className={styles.arcRed} />
          </g>

          {/* Needle */}
          <g
            className={styles.needle}
            style={{ transform: `rotate(${needleAngle}deg)` }}
          >
            <polygon points="100,20 102,100 98,100" fill="rgba(255, 50, 50, 1)" />
            <circle
              cx="100"
              cy="100"
              r="5"
              fill="rgba(255, 50, 50, 1)"
              className={isInTune ? styles.pulse : ''}
            />
          </g>
        </svg>

        <div className={`${styles.noteDisplay} ${tuningColorClass}`}>
            <span className={styles.noteName}>{noteData?.note ?? '--'}</span>
            <span className={styles.octave}>{noteData?.octave ?? ''}</span>
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.centsDisplay}>
          <span>{cents.toFixed(1)} cents</span>
        </div>
        <div className={styles.freqDisplay}>
          <span>{noteData?.frequency.toFixed(2) ?? '0.00'} Hz</span>
        </div>
      </div>
    </div>
  );
};

export default Tuner;