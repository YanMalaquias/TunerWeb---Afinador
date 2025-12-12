import { useEffect, useState } from 'react';

const useTuner = () => {
    const [frequency, setFrequency] = useState<number | null>(null);
    const [isListening, setIsListening] = useState<boolean>(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [microphone, setMicrophone] = useState<MediaStream | null>(null);

    useEffect(() => {
        const initAudio = async () => {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            setAudioContext(context);

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setMicrophone(stream);
                const source = context.createMediaStreamSource(stream);
                const analyser = context.createAnalyser();
                source.connect(analyser);
                analyser.fftSize = 2048;

                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                const detectFrequency = () => {
                    analyser.getByteFrequencyData(dataArray);
                    const maxIndex = dataArray.indexOf(Math.max(...dataArray));
                    const detectedFrequency = maxIndex * (context.sampleRate / 2) / dataArray.length;
                    setFrequency(detectedFrequency);
                    requestAnimationFrame(detectFrequency);
                };

                detectFrequency();
            } catch (error) {
                console.error('Error accessing microphone:', error);
            }
        };

        if (isListening) {
            initAudio();
        }

        return () => {
            if (microphone) {
                microphone.getTracks().forEach(track => track.stop());
            }
            if (audioContext) {
                audioContext.close();
            }
        };
    }, [isListening, microphone, audioContext]);

    const startListening = () => {
        setIsListening(true);
    };

    const stopListening = () => {
        setIsListening(false);
    };

    return { frequency, startListening, stopListening, isListening };
};

export default useTuner;