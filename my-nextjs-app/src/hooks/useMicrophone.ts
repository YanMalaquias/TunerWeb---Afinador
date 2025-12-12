import { useCallback, useEffect, useRef, useState } from 'react';

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | null;

export interface UseMicrophoneReturn {
  stream: MediaStream | null;
  audioContext: AudioContext | null;
  analyserNode: AnalyserNode | null;
  isListening: boolean;
  isLoading: boolean;
  permissionStatus: PermissionStatus;
  error: Error | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  getFloatFrequencyData: () => Float32Array | null;
  getByteFrequencyData: () => Uint8Array | null;
  getTimeDomainData: (size?: number) => Float32Array | null;
  timeDomainRef: React.RefObject<Float32Array | null>;
}

export const useMicrophone = (): UseMicrophoneReturn => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>(null);
  const [error, setError] = useState<Error | null>(null);

  const floatDataRef = useRef<Float32Array | null>(null);
  const byteDataRef = useRef<Uint8Array | null>(null);
  const timeDomainRef = useRef<Float32Array | null>(null);

  const startListening = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const mediaDevices = navigator.mediaDevices;
      if (!mediaDevices || !mediaDevices.getUserMedia) {
        throw new Error('getUserMedia não é suportado neste navegador');
      }

      const mediaStream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      setStream(mediaStream);
      setPermissionStatus('granted');

      const AudioCtxCtor = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxCtor();
      setAudioContext(ctx);

      const sourceNode = ctx.createMediaStreamSource(mediaStream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.2;
      sourceNode.connect(analyser);

      setAnalyserNode(analyser);

      byteDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      floatDataRef.current = new Float32Array(analyser.frequencyBinCount);
      timeDomainRef.current = new Float32Array(analyser.fftSize);

      setIsListening(true);
      setIsLoading(false);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro desconhecido ao acessar microfone');
      if ((e as any).name === 'NotAllowedError') {
        setPermissionStatus('denied');
        e.message = 'Permissão de microfone negada';
      } else if ((e as any).name === 'NotFoundError') {
        e.message = 'Nenhum dispositivo de microfone encontrado';
      }
      setError(e);
      setIsLoading(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
    setAnalyserNode(null);
    setIsListening(false);
    setError(null);
  }, [stream, audioContext]);

  const getFloatFrequencyData = useCallback((): Float32Array | null => {
    if (analyserNode && floatDataRef.current) {
      analyserNode.getFloatFrequencyData(floatDataRef.current as any);
      return floatDataRef.current;
    }
    return null;
  }, [analyserNode]);

  const getByteFrequencyData = useCallback((): Uint8Array | null => {
    if (analyserNode && byteDataRef.current) {
      analyserNode.getByteFrequencyData(byteDataRef.current as any);
      return byteDataRef.current;
    }
    return null;
  }, [analyserNode]);

  const getTimeDomainData = useCallback((size?: number): Float32Array | null => {
    if (!analyserNode) return null;
    const targetSize = size || analyserNode.fftSize;
    if (!timeDomainRef.current || timeDomainRef.current.length !== targetSize) {
      timeDomainRef.current = new Float32Array(targetSize);
    }
    analyserNode.getFloatTimeDomainData(timeDomainRef.current as any);
    return timeDomainRef.current;
  }, [analyserNode]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    stream,
    audioContext,
    analyserNode,
    isListening,
    isLoading,
    permissionStatus,
    error,
    startListening,
    stopListening,
    getFloatFrequencyData,
    getByteFrequencyData,
    getTimeDomainData,
    timeDomainRef,
  };
};
