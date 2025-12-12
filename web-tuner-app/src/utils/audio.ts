export function detectPitch(audioBuffer: AudioBuffer): number | null {
    const sampleRate = audioBuffer.sampleRate;
    const data = audioBuffer.getChannelData(0);
    const threshold = 0.01;
    let maxAmplitude = 0;
    let maxIndex = -1;

    for (let i = 0; i < data.length; i++) {
        if (Math.abs(data[i]) > maxAmplitude) {
            maxAmplitude = Math.abs(data[i]);
            maxIndex = i;
        }
    }

    if (maxAmplitude < threshold) {
        return null; // No significant sound detected
    }

    const frequency = sampleRate / maxIndex;
    return frequency;
}

export function normalizeAudioData(data: Float32Array): Float32Array {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    return data.map(value => (value - min) / range);
}