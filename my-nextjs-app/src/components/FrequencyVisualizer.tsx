import React, { useEffect, useRef } from 'react';
import './FrequencyVisualizer.css';

interface FrequencyVisualizerProps {
    analyserNode: AnalyserNode | null;
    isListening: boolean;
}

const FrequencyVisualizer: React.FC<FrequencyVisualizerProps> = ({ analyserNode, isListening }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafId = useRef<number | null>(null);

    const draw = () => {
        if (!analyserNode || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Fundo escuro transparente para rastro (opcional, aqui usando clear total)
        // ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = (dataArray[i] / 255) * canvas.height;

            // Gradiente de cores baseado na altura (intensidade)
            const r = barHeight + 25 * (i / bufferLength);
            const g = 250 * (i / bufferLength);
            const b = 50;

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }

        rafId.current = requestAnimationFrame(draw);
    };

    useEffect(() => {
        if (isListening && analyserNode) {
            draw();
        } else {
            if (rafId.current) cancelAnimationFrame(rafId.current);
        }
        return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
    }, [isListening, analyserNode]);

    return <canvas ref={canvasRef} className="frequency-visualizer" width={300} height={100} />;
};

export default FrequencyVisualizer;