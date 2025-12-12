import React, { useEffect, useRef } from 'react';
import styles from './FrequencyVisualizer.module.css';

interface Props {
  analyserNode: AnalyserNode | null;
  height?: number;
}

const FrequencyVisualizer: React.FC<Props> = ({ analyserNode, height = 200 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const dataRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = height * dpr;
    };
    resize();

    const bufferSize = analyserNode.fftSize;
    if (!dataRef.current || dataRef.current.length !== bufferSize) {
      dataRef.current = new Float32Array(bufferSize);
    }

    const render = () => {
      analyserNode.getFloatTimeDomainData(dataRef.current!);
      const data = dataRef.current!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2 * dpr;
      ctx.strokeStyle = '#22c55e';
      ctx.beginPath();
      const sliceWidth = canvas.width / data.length;
      let x = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] + 1) / 2; // normalize 0..1
        const y = v * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [analyserNode, height]);

  return <canvas className={styles.visualizer} ref={canvasRef} style={{ height: `${height}px`, width: '100%' }} />;
};

export default FrequencyVisualizer;
