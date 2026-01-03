import { useState, useRef, useCallback } from 'react';

/**
 * Interface for the return value of the useMicrophone hook.
 */
export interface UseMicrophoneResult {
  analyserNode: AnalyserNode | null;
  audioBuffer: Float32Array | null;
  permissionState: 'idle' | 'prompt' | 'granted' | 'denied';
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
}

/**
 * Custom hook to capture audio from the user's microphone using the Web Audio API.
 * It requests permission, creates an AudioContext and an AnalyserNode, and provides
 * real-time audio data without routing it to the speakers.
 *
 * @param fftSize - The size of the Fast Fourier Transform. Higher values provide more
 * detail in the frequency domain but increase processing latency.
 * @returns An object containing the analyserNode, audio buffer, state, and controls.
 */
export const useMicrophone = (fftSize: number = 4096): UseMicrophoneResult => {
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<Float32Array | null>(null);
  const [permissionState, setPermissionState] = useState<'idle' | 'prompt' | 'granted' | 'denied'>('idle');
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Stops the microphone stream and disconnects the audio nodes.
   */
  const stopListening = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAnalyserNode(null);
    setAudioBuffer(null);
    // Only reset permission if it was granted, to allow for restarting
    if (permissionState === 'granted') {
        setPermissionState('idle');
    }
  }, [permissionState]);

  /**
   * Requests microphone permission and starts listening to the audio stream.
   */
  const startListening = useCallback(async () => {
    // Prevent multiple concurrent requests
    if (audioContextRef.current) return;

    setPermissionState('prompt');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // These constraints are often beneficial for audio processing.
          // echoCancellation: false,
          // autoGainControl: false,
          // noiseSuppression: false,
        },
      });

      const context = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = context;
      streamRef.current = stream;

      const source = context.createMediaStreamSource(stream);
      mediaStreamSourceRef.current = source;

      const analyser = context.createAnalyser();
      analyser.fftSize = fftSize;
      // Per user request, smoothing is handled by LERP in the UI layer.
      // A small amount of hardware smoothing can still be useful.
      analyser.smoothingTimeConstant = 0.2;

      source.connect(analyser);
      // Do NOT connect the analyser to context.destination, to avoid feedback.

      setAnalyserNode(analyser);
      setAudioBuffer(new Float32Array(analyser.frequencyBinCount));
      setPermissionState('granted');
    } catch (err) {
      setError(
        err instanceof Error ? `Microphone access denied: ${err.message}` : 'An unknown error occurred.'
      );
      setPermissionState('denied');
      // Clean up on error
      stopListening();
    }
  }, [fftSize, stopListening]);

  return {
    analyserNode,
    audioBuffer,
    permissionState,
    error,
    startListening,
    stopListening,
  };
};