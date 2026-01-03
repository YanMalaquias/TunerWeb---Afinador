/**
 * Represents the musical information derived from a frequency.
 */
export interface NoteData {
  note: string;
  octave: number;
  cents: number;
  frequency: number;
}

const NOTE_NAMES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const A4_FREQUENCY = 440.0;
const A4_SEMITONE_INDEX = 0; // A is our reference note

/**
 * Converts a frequency in Hz to musical note information.
 *
 * @param frequency - The frequency in Hz to convert.
 * @returns An object containing the note name, octave, and cents deviation,
 *          or null if the frequency is out of a reasonable range.
 */
export function getNoteFromFrequency(frequency: number): NoteData | null {
  if (!frequency || frequency <= 0) {
    return null;
  }

  // Formula to find the number of semitones away from A4
  const semitonesFromA4 = 12 * Math.log2(frequency / A4_FREQUENCY);
  const roundedSemitone = Math.round(semitonesFromA4);

  // Calculate the deviation in cents
  const cents = (semitonesFromA4 - roundedSemitone) * 100;

  // Calculate the absolute semitone index from C0
  const absoluteSemitone = roundedSemitone + 57; // 57 is the semitone index of A4 from C0
  
  const octave = Math.floor(absoluteSemitone / 12);
  const noteIndex = absoluteSemitone % 12;

  const note = NOTE_NAMES[noteIndex];

  return {
    note,
    octave,
    cents: Math.round(cents), // Round for cleaner display
    frequency,
  };
}

/**
 * Linear interpolation function.
 * Used for smoothing animations.
 *
 * @param a - The starting value.
 * @param b - The ending value.
 * @param t - The interpolation factor (0 to 1).
 * @returns The interpolated value.
 */
export function lerp(a: number, b: number, t: number): number {
    return a * (1 - t) + b * t;
}