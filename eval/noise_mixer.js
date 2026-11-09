/**
 * Audio Noise Mixer for Acoustic Robustness Benchmarking.
 * Simulates real-world noisy acoustic environments by adding scaled noise at target SNR levels.
 */

/**
 * Calculates Root Mean Square (RMS) energy of 16-bit PCM audio samples.
 *
 * @param {Int16Array} samples
 * @returns {number}
 */
export function calculateRms(samples) {
  if (!samples || samples.length === 0) return 0;
  let sumSquares = 0;
  for (let i = 0; i < samples.length; i++) {
    sumSquares += samples[i] * samples[i];
  }
  return Math.sqrt(sumSquares / samples.length);
}

/**
 * Mixes background noise into a 16-bit PCM audio buffer at a target SNR (in dB).
 * Formula: SNR_dB = 20 * log10(RMS_signal / RMS_noise)
 *
 * @param {Buffer} pcmBuffer - Linear 16-bit PCM audio
 * @param {number} targetSnrDb - Target SNR in decibels (e.g. 20 for mild, 10 for medium, 5 for heavy street noise)
 * @returns {Buffer} Noisy PCM audio buffer
 */
export function mixNoise(pcmBuffer, targetSnrDb = 20) {
  if (targetSnrDb >= 50) return Buffer.from(pcmBuffer); // virtually clean

  const samples = new Int16Array(
    pcmBuffer.buffer,
    pcmBuffer.byteOffset,
    pcmBuffer.byteLength / 2
  );
  const signalRms = calculateRms(samples);
  if (signalRms === 0) return Buffer.from(pcmBuffer);

  // Target noise RMS: noiseRms = signalRms / 10^(targetSnrDb / 20)
  const targetNoiseRms = signalRms / Math.pow(10, targetSnrDb / 20);

  const noisySamples = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    // Generate pseudo-Gaussian noise using Box-Muller transform
    const u1 = Math.max(1e-6, Math.random());
    const u2 = Math.random();
    const gaussian = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const noiseVal = gaussian * targetNoiseRms;

    // Add noise to signal and clamp to signed 16-bit bounds [-32768, 32767]
    const mixed = Math.round(samples[i] + noiseVal);
    noisySamples[i] = Math.max(-32768, Math.min(32767, mixed));
  }

  return Buffer.from(noisySamples.buffer, noisySamples.byteOffset, noisySamples.byteLength);
}
