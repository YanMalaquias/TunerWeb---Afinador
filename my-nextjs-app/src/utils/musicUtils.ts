export interface NoteResult {
  note: string;
  octave: number;
  cents: number;
  frequency: number;
}

/**
 * Converts a frequency in Hz to the nearest musical note.
 * @param frequency - The frequency in Hz.
 * @param a4 - The reference frequency for A4 (default is 440 Hz).
 * @returns An object containing the note name, octave, and cents deviation.
 */
export function getNoteFromFrequency(frequency: number, a4: number = 440): NoteResult {
  const semitone = 69 + 12 * Math.log2(frequency / a4);
  const midiNum = Math.round(semitone);
  const cents = (semitone - midiNum) * 100;

  const noteIndex = midiNum % 12;
  const octave = Math.floor(midiNum / 12) - 1;

  return {
    note: NOTES[noteIndex],
    octave,
    cents: Math.round(cents),
    frequency,
  };
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
