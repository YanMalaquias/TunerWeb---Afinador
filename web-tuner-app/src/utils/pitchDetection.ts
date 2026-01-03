/**
 * This file implements the YIN algorithm for fundamental frequency detection.
 * Based on the paper "YIN, a fundamental frequency estimator for speech and music"
 * by Alain de Cheveigné and Hideki Kawahara.
 */

/**
 * Parameters for the YIN algorithm.
 */
export interface YinOptions {
  sampleRate: number;
  threshold?: number;
  probabilityThreshold?: number;
}

/**
 * Detects the fundamental frequency of a signal using the YIN algorithm.
 *
 * @param buffer - The audio buffer (Float32Array) containing time-domain data.
 * @param options - Configuration options for the YIN algorithm.
 * @returns The detected frequency in Hz, or `null` if no clear pitch is found.
 */
export function getPitch(buffer: Float32Array, options: YinOptions): number | null {
  const { sampleRate, threshold = 0.12 } = options;
  const bufferSize = buffer.length;
  const yinBuffer = new Float32Array(Math.floor(bufferSize / 2));

  let tau: number | null = null;

  // Step 1 & 2: Difference function and Cumulative Mean Normalized Difference (CMNDF)
  let runningSum = 0;
  yinBuffer[0] = 1;

  for (let t = 1; t < yinBuffer.length; t++) {
    let squaredDifference = 0;
    for (let i = 0; i < yinBuffer.length; i++) {
      const delta = buffer[i] - buffer[i + t];
      squaredDifference += delta * delta;
    }
    runningSum += squaredDifference;
    yinBuffer[t] = squaredDifference / ((1 / t) * runningSum);
  }

  // Step 3: Absolute thresholding
  // Find the first dip below the threshold.
  for (let t = 2; t < yinBuffer.length; t++) {
    if (yinBuffer[t] < threshold) {
      // Look for the minimum value around this dip.
      let t_min = t;
      while (t + 1 < yinBuffer.length && yinBuffer[t + 1] < yinBuffer[t]) {
        t++;
      }
      tau = t;
      break;
    }
  }

  if (tau === null) {
    return null; // No pitch detected
  }

  // Step 5: Parabolic interpolation for better accuracy
  let betterTau: number;
  const x0 = tau - 1;
  const x2 = tau + 1 < yinBuffer.length ? tau + 1 : tau;

  if (x0 < 0) {
    betterTau = tau;
  } else {
    const y0 = yinBuffer[x0];
    const y1 = yinBuffer[tau];
    const y2 = yinBuffer[x2];

    const numerator = (y2 - y0);
    // Denominator can be zero if the values are equal, avoid division by zero.
    const denominator = 2 * (2 * y1 - y2 - y0);
    const peakShift = denominator !== 0 ? numerator / denominator : 0;
    
    betterTau = tau - peakShift;
  }
  
  // If the interpolated value is out of reasonable bounds, use the original estimate.
  if (betterTau <= 0 || betterTau >= bufferSize) {
    betterTau = tau;
  }

  const fundamentalFrequency = sampleRate / betterTau;
  
  // Filter out frequencies outside the specified range.
  if (fundamentalFrequency >= 50 && fundamentalFrequency <= 1200) {
    return fundamentalFrequency;
  }

  return null;
}