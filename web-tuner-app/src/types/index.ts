// This file defines TypeScript types and interfaces used throughout the application.

export interface FrequencyData {
    frequency: number;
    note: string;
    deviation: number;
}

export interface AudioStream {
    stream: MediaStream | null;
    isActive: boolean;
}

export interface TunerSettings {
    sensitivity: number;
    autoTune: boolean;
}

export interface VisualizerSettings {
    width: number;
    height: number;
    color: string;
}