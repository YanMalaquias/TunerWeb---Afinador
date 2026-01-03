import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './App.module.css';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import Tuner from './Tuner/Tuner';
import FrequencyVisualizer from './FrequencyVisualizer/FrequencyVisualizer';
import { useMicrophone } from '../hooks/useMicrophone';
import { getPitch } from '../utils/pitchDetection';
import { getNoteFromFrequency, lerp, NoteData } from '../utils/musicUtils';

function App() {
  const [noteData, setNoteData] = useState<NoteData | null>(null);
  const [needleAngle, setNeedleAngle] = useState(0);

  const {
    analyserNode,
    audioBuffer,
    permissionState,
    error,
    startListening,
    stopListening,
  } = useMicrophone();

  const animationFrameRef = useRef<number>();
  const smoothedAngleRef = useRef(0);

  const processAudio = useCallback(() => {
    if (!analyserNode || !audioBuffer) {
      setNoteData(null);
      return;
    }

    analyserNode.getFloatTimeDomainData(audioBuffer);
    const sampleRate = analyserNode.context.sampleRate;
    const frequency = getPitch(audioBuffer, { sampleRate });
    
    const newNoteData = frequency ? getNoteFromFrequency(frequency) : null;
    setNoteData(newNoteData);

    animationFrameRef.current = requestAnimationFrame(processAudio);
  }, [analyserNode, audioBuffer]);

  useEffect(() => {
    if (analyserNode) {
      animationFrameRef.current = requestAnimationFrame(processAudio);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setNoteData(null); // Clear data when not listening
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, processAudio]);

  // LERP for smooth needle animation
  useEffect(() => {
    const updateNeedle = () => {
      const cents = noteData?.cents ?? 0;
      // Clamp cents to the [-50, 50] range for angle calculation
      const clampedCents = Math.max(-50, Math.min(50, cents));
      const targetAngle = (clampedCents / 50) * 45; // Map [-50, 50] cents to [-45, 45] degrees

      smoothedAngleRef.current = lerp(smoothedAngleRef.current, targetAngle, 0.1);

      // Stop updating if the change is negligible to save resources
      if (Math.abs(smoothedAngleRef.current - targetAngle) > 0.01) {
        setNeedleAngle(smoothedAngleRef.current);
        requestAnimationFrame(updateNeedle);
      } else {
        // Snap to final position
        setNeedleAngle(targetAngle);
      }
    };

    requestAnimationFrame(updateNeedle);

  }, [noteData]);

  const handleToggleListening = () => {
    if (analyserNode) {
      stopListening();
    } else {
      startListening();
    }
  };

  const renderContent = () => {
    if (error) {
      return <p className={styles.errorMessage}>Erro: {error}</p>;
    }

    switch (permissionState) {
      case 'prompt':
        return <p>Aguardando permissão do microfone...</p>;
      case 'denied':
        return <p className={styles.errorMessage}>Permissão do microfone negada.</p>;
      case 'granted':
        return <Tuner noteData={noteData} needleAngle={needleAngle} />;
      case 'idle':
      default:
        return <p>Clique no botão para iniciar o afinador.</p>;
    }
  };

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.tunerContainer}>
          {renderContent()}
        </div>
        <button onClick={handleToggleListening} className={styles.controlButton}>
          {analyserNode ? 'Parar' : 'Iniciar'}
        </button>
        <FrequencyVisualizer analyserNode={analyserNode} audioBuffer={audioBuffer} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
