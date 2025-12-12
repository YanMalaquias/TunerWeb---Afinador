import { useState, useRef, useCallback } from 'react';

export const useMicrophone = () => {
    const [isListening, setIsListening] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const startListening = useCallback(async () => {
        if (isListening) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass();
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;

            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            sourceRef.current = source;

            setIsListening(true);
        } catch (err) {
            console.error("Erro ao acessar microfone", err);
            alert("Não foi possível acessar o microfone.");
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (sourceRef.current) sourceRef.current.disconnect();
        if (audioContextRef.current) audioContextRef.current.close();
        
        sourceRef.current = null;
        analyserRef.current = null;
        audioContextRef.current = null;
        setIsListening(false);
    }, []);

    const getAnalyserNode = useCallback(() => {
        return analyserRef.current;
    }, []);

    return {
        isListening,
        startListening,
        stopListening,
        getAnalyserNode,
        audioContext: audioContextRef.current
    };
};