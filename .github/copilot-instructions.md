# AI Copilot Instructions for Music Tuner Workspace

## Project Overview
This workspace contains three React + TypeScript + Vite applications focused on audio tuning and visualization:
- **web-tuner-app**: Fully featured tuner with frequency visualization
- **my-nextjs-app**: Modular tuner components (under development)
- **my-react-vite-app**: Generic Vite React template

## Architecture

### Core Audio Processing Pipeline
The tuner applications follow a consistent audio capture → analysis → UI feedback pattern:

1. **Microphone Access** (`useMicrophone.ts`, `useTuner.ts`)
   - Acquire MediaStream with audio constraints (echo cancellation, noise suppression enabled in my-nextjs-app)
   - Create WebAudio API context with AnalyserNode
   - FFT size: 4096 (my-nextjs-app for low-frequency resolution) or 2048 (web-tuner-app)
   - Do NOT connect source to audioContext.destination (no feedback)

2. **Pitch Detection** (`pitchDetection.ts`)
   - **Primary algorithm**: YIN (refined implementation with CMNDF threshold)
   - **Fallback**: Autocorrelation with parabolic interpolation
   - **Range**: 50-1200 Hz (instrument/voice focus)
   - **Refinement**: Parabolic interpolation for ±1 semitone accuracy
   - Input: Float32Array from analyser.getFloatTimeDomainData()

3. **Frequency-to-Note Mapping** (`musicUtils.ts`)
   - Reference: A4 = 440 Hz
   - Output: `NoteResult { note, octave, cents }`
   - Cents: ±50 relative to nearest semitone (musical tuning standard)

4. **Visualization** (`FrequencyVisualizer.tsx`)
   - Canvas-based bar chart from byte frequency data
   - Updates via requestAnimationFrame in animation loops
   - Dynamic color gradient based on magnitude

## Key Patterns & Conventions

### Hook-Based Architecture
- **useMicrophone** (my-nextjs-app): Full-featured, returns analyser node + data arrays
  - Reuses AudioContext if already created
  - Data refs (floatDataRef, byteDataRef) prevent allocation thrashing in animation loops
  - Error handling: NotAllowedError (permission denied), NotFoundError (no device)
- **useTuner** (web-tuner-app): Simpler version, uses requestAnimationFrame internally
  - Cleanup in useEffect return to stop tracks and close context

### Data Flow
```
MediaStream → MediaStreamAudioSourceNode → AnalyserNode
                                            ↓
                                       FFT Analysis
                                            ↓
                                    getFloatFrequencyData / getByteFrequencyData
                                    getFloatTimeDomainData (for pitch detection)
                                            ↓
                              detectPitch → getNoteFromFrequency
                                            ↓
                                          UI Components
```

### TypeScript Practices
- Strict null checking: Return `null` for invalid audio data (silence, no samples)
- Type exports in `types/index.ts` for cross-component sharing (e.g., NoteResult)
- Interface pattern for hook returns (see UseMicrophoneReturn in useMicrophone.ts)

### Performance Considerations
- FFT size trade-off: Larger (4096) = better frequency resolution, higher latency
- Smoothing constant: 0.2-0.8 range; lower = faster response but noisier
- Reuse typed arrays (Float32Array, Uint8Array) in refs to avoid GC pressure
- Decimation in detectPitch: Downsamples to ~2048 samples target for complexity bounds

## Development Workflow

### Setup
```bash
# web-tuner-app
cd web-tuner-app
npm install
npm run dev          # Port 3000, auto-opens browser

# my-nextjs-app/my-react-vite-app
cd my-nextjs-app/my-react-vite-app
npm install
npm run dev
```

### Build
```bash
npm run build        # Creates optimized dist/ directory
npm run serve        # Preview production build locally
```

### Common Tasks
- **Add new frequency range**: Modify minFrequency/maxFrequency in `detectPitch()` options
- **Tweak pitch detection**: Adjust YIN threshold (0.1-0.15 range) or CMNDF threshold in pitchDetection.ts
- **Change canvas visualization**: Edit FrequencyVisualizer.tsx draw logic or Tuner.module.css styling
- **Add new audio constraint**: Pass to getUserMedia options in useMicrophone startListening()

## Critical Dependencies & Browser APIs
- **Web Audio API**: AudioContext, AnalyserNode, MediaStreamAudioSourceNode
- **MediaDevices**: getUserMedia with audio constraints
- **Canvas 2D**: Frequency visualization
- **React 18**: Hooks, refs, functional components
- **Vite 4+**: ESM bundling, dev server with open plugin
- **TypeScript 4.0+**: Strict mode

## Testing & Validation
- Manual testing: Run dev server, grant microphone permission, play tones
- Expected behavior: Detect frequencies within 50-1200 Hz range with ±1 semitone accuracy
- Audio constraints in my-nextjs-app (echoCancellation: true, autoGainControl: false) improve tuning accuracy for live instruments
