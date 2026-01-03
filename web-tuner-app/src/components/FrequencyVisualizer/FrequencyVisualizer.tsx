import React, { useRef, useEffect } from 'react';
import styles from './FrequencyVisualizer.module.css';

interface FrequencyVisualizerProps {
  analyserNode: AnalyserNode | null;
  audioBuffer: Float32Array | null;
}

const FrequencyVisualizer: React.FC<FrequencyVisualizerProps> = ({ analyserNode, audioBuffer }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode || !audioBuffer) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const draw = () => {
      if (!analyserNode) return;

      analyserNode.getFloatTimeDomainData(audioBuffer);

      canvasCtx.fillStyle = '#1a1a1a';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = '#48d969';
      canvasCtx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / audioBuffer.length;
      let x = 0;

      for (let i = 0; i < audioBuffer.length; i++) {
        const v = audioBuffer[i] * 0.5 + 0.5; // Normalize to [0, 1]
        const y = v * canvas.height;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, audioBuffer]);

  if (!analyserNode) {
    return null; // Don't render if not active
  }

  return (
    <div className={styles.visualizerContainer}>
      <canvas ref={canvasRef} className={styles.canvas}></canvas>
    </div>
  );
};

export default FrequencyVisualizer;