import { useState, useEffect, useRef } from 'react';
import { detectPitch } from '../utils/pitchDetection';
import { getNoteFromFrequency, NoteResult } from '../utils/musicUtils';

interface UsePitchDetectionProps {
    isListening: boolean;
    analyserNode: AnalyserNode | null;
    timeDomainRef: React.RefObject<Float32Array | null>;
}

export const usePitchDetection = ({ isListening, analyserNode, timeDomainRef }: UsePitchDetectionProps): NoteResult | null => {
    const [noteResult, setNoteResult] = useState<NoteResult | null>(null);
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        const processAudio = () => {
            const timeData = timeDomainRef.current;
            if (isListening && analyserNode && timeData) {
                analyserNode.getFloatTimeDomainData(timeData as any);
                const pitch = detectPitch(timeData, analyserNode.context.sampleRate);

                if (pitch) {
                    const note = getNoteFromFrequency(pitch);
                    setNoteResult(note);
                } else {
                    setNoteResult(null);
                }
                animationFrameRef.current = requestAnimationFrame(processAudio);
            }
        };

        if (isListening) {
            processAudio();
        } else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            setNoteResult(null); // Clear note when stopped
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isListening, analyserNode, timeDomainRef]);

    return noteResult;
};
