# AI Copilot Instructions for Music Tuner Workspace

## Project Overview
This workspace contains a React + TypeScript + Vite application focused on audio tuning and visualization:
- **web-tuner-app**: A fully-featured musical tuner with a real-time frequency and waveform visualizer.

## Architecture

### Core Audio Processing Pipeline
The tuner application follows a consistent audio capture → analysis → UI feedback pattern:

1.  **Microphone Access** (`hooks/useMicrophone.ts`)
    -   Acquires a `MediaStream` from the user's microphone.
    -   Creates a Web Audio API context with an `AnalyserNode`.
    -   FFT size: 4096 for high frequency resolution.
    -   Smoothing: 0.2 `smoothingTimeConstant`.
    -   Does NOT connect the source to `audioContext.destination` to prevent audio feedback.

2.  **Pitch Detection** (`utils/pitchDetection.ts`)
    -   **Algorithm**: Implements the YIN algorithm for accurate fundamental frequency detection.
    -   **Details**: Uses Cumulative Mean Normalized Difference Function (CMNDF) with a threshold of `0.12`.
    -   **Refinement**: Includes parabolic interpolation for sub-harmonic accuracy.
    -   **Range**: Optimized for 50 Hz to 1200 Hz, covering most instruments and voice.
    -   **Input**: `Float32Array` from `analyser.getFloatTimeDomainData()`.

3.  **Frequency-to-Note Mapping** (`utils/musicUtils.ts`)
    -   **Reference Pitch**: A4 = 440 Hz.
    -   **Output**: An object containing `{ note, octave, cents, frequency }`.
    -   **Cents**: Calculated as the deviation from the nearest perfect semitone (from -50 to +50).

4.  **Visualization**
    -   **Tuner Gauge** (`components/Tuner/Tuner.tsx`): An SVG-based semicircular gauge with a needle that rotates to show tuning accuracy. The needle's rotation is smoothed using Linear Interpolation (LERP).
    -   **Waveform Display** (`components/FrequencyVisualizer/FrequencyVisualizer.tsx`): A Canvas-based component that draws a line graph of the raw audio waveform from the time-domain data (`getFloatTimeDomainData`).

## Key Patterns & Conventions

### Hook-Based Architecture
-   **`useMicrophone.ts`**: A custom hook that encapsulates all Web Audio API logic.
    -   Manages microphone permission state (`prompt`, `granted`, `denied`).
    -   Provides the `analyserNode`, `audioBuffer`, and `start/stop` controls to the application.
    -   Handles errors gracefully (e.g., permission denied).
    -   Ensures proper cleanup of the `AudioContext` and `MediaStream` when stopped.

### Data Flow
```
MediaStream → MediaStreamAudioSourceNode → AnalyserNode
                                            ↓
                                    getFloatTimeDomainData()
                                            ↓
                              getPitch() → getNoteFromFrequency()
                                            ↓
                                       UI Components (Tuner, FrequencyVisualizer)
```

### TypeScript Practices
-   Strict typing is used throughout the application.
-   Interfaces are defined for complex objects (e.g., `NoteData`, `UseMicrophoneResult`).
-   Avoids the use of `any`.

### Performance Considerations
-   **Animation**: `requestAnimationFrame` is used for all UI updates (needle rotation and waveform drawing) to ensure smooth, efficient rendering.
-   **Smoothing**: Linear Interpolation (LERP) is used to smooth the movement of the tuner's needle, providing a more stable and professional feel.
-   **FFT Size**: A larger FFT size (4096) is chosen for better frequency resolution, which is critical for accurate low-frequency note detection.

## Development Workflow

### Setup
```bash
# Navigate to the application directory
cd web-tuner-app

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Build
```bash
# Creates an optimized production build in the dist/ directory
npm run build

# Serves the production build locally for preview
npm run serve
```

### Common Tasks
-   **Adjust Pitch Detection**: Modify the `threshold` in `getPitch()` (`utils/pitchDetection.ts`).
-   **Change Tuning Reference**: Update `A4_FREQUENCY` in `utils/musicUtils.ts`.
-   **Tweak Needle Smoothing**: Adjust the LERP factor (`0.1`) in the `App.tsx` animation loop.

## Critical Dependencies & Browser APIs
-   **Web Audio API**: `AudioContext`, `AnalyserNode`, `MediaStreamAudioSourceNode`
-   **MediaDevices**: `navigator.mediaDevices.getUserMedia`
-   **Canvas 2D API**: Used for the `FrequencyVisualizer`.
-   **React 18**: Hooks (`useState`, `useEffect`, `useRef`, `useCallback`), functional components.
-   **Vite**: Next-generation frontend tooling for bundling and development.
-   **TypeScript**: For static typing and improved code quality.
