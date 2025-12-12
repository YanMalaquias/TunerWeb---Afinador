export function detectPitch(samples: Float32Array, sampleRate: number): number | null {
  if (!samples || samples.length < 64 || !isFinite(sampleRate) || sampleRate <= 0) return null;

  const minFreq = 50;
  const maxFreq = 1200;
  const threshold = 0.12;

  const targetSize = 2048;
  const step = Math.max(1, Math.floor(samples.length / targetSize));
  const decimatedLength = Math.floor(samples.length / step);
  const decimated = new Float32Array(decimatedLength);

  let mean = 0;
  for (let i = 0, j = 0; i < samples.length && j < decimatedLength; i += step, j++) {
    mean += samples[i];
    decimated[j] = samples[i];
  }
  mean /= decimatedLength;
  for (let i = 0; i < decimatedLength; i++) decimated[i] -= mean;

  const sr = sampleRate / step;
  const maxLag = Math.min(Math.floor(decimatedLength / 2), Math.ceil(sr / minFreq));
  const minLag = Math.max(2, Math.floor(sr / maxFreq));

  if (minLag >= maxLag) return null;

  const yinBuffer = new Float32Array(maxLag + 1);

  for (let tau = minLag; tau <= maxLag; tau++) {
    let sum = 0;
    const limit = decimatedLength - tau;
    for (let i = 0; i < limit; i++) {
      const delta = decimated[i] - decimated[i + tau];
      sum += delta * delta;
    }
    yinBuffer[tau] = sum;
  }

  let runningSum = 0;
  for (let tau = 1; tau < minLag; tau++) yinBuffer[tau] = 1;
  for (let tau = minLag; tau <= maxLag; tau++) {
    runningSum += yinBuffer[tau];
    yinBuffer[tau] = (yinBuffer[tau] * tau) / (runningSum || 1e-10);
  }

  let tauEstimate = -1;
  for (let tau = minLag; tau <= maxLag; tau++) {
    if (yinBuffer[tau] < threshold) {
      while (tau + 1 <= maxLag && yinBuffer[tau + 1] < yinBuffer[tau]) tau++;
      tauEstimate = tau;
      break;
    }
  }

  if (tauEstimate === -1) {
    let minVal = Infinity;
    let minIdx = -1;
    for (let tau = minLag; tau <= maxLag; tau++) {
      if (yinBuffer[tau] < minVal) {
        minVal = yinBuffer[tau];
        minIdx = tau;
      }
    }
    if (minIdx > 0 && minVal < 0.6) tauEstimate = minIdx;
    else return null;
  }

  let betterTau = tauEstimate;
  if (tauEstimate > 1 && tauEstimate + 1 <= maxLag) {
    const s0 = yinBuffer[tauEstimate - 1];
    const s1 = yinBuffer[tauEstimate];
    const s2 = yinBuffer[tauEstimate + 1];
    const denom = s0 + s2 - 2 * s1;
    if (denom !== 0) betterTau = tauEstimate + (s2 - s0) / (2 * denom);
  }

  const frequency = sampleRate / (betterTau * step);
  return isFinite(frequency) && frequency > 0 ? frequency : null;
}
