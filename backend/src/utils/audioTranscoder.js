import { spawn } from "child_process";

/**
 * Checks if a buffer is a valid RIFF WAVE file.
 * @param {Buffer} buffer
 * @returns {boolean}
 */
export function isWavBuffer(buffer) {
  if (!buffer || buffer.length < 44) return false;
  const isRiffWave =
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x41 && // A
    buffer[10] === 0x56 && // V
    buffer[11] === 0x45; // E
  if (!isRiffWave) return false;

  // Enforce standard 16kHz 16-bit mono PCM WAV for Gnani Prisma; transcode 48kHz/stereo/float WAVs via ffmpeg
  if (
    buffer[12] === 0x66 && // f
    buffer[13] === 0x6d && // m
    buffer[14] === 0x74 && // t
    buffer[15] === 0x20
  ) {
    const audioFormat = buffer.readUInt16LE(20);
    const channels = buffer.readUInt16LE(22);
    const sampleRate = buffer.readUInt32LE(24);
    const bitsPerSample = buffer.readUInt16LE(34);
    return audioFormat === 1 && channels === 1 && sampleRate === 16000 && bitsPerSample === 16;
  }
  return true;
}

/**
 * Ensures an audio buffer is converted into a standard 16kHz mono WAV buffer
 * supported by Gnani Prisma STT (which only supports wav, ogg, flac, m4a, aac, mp3).
 *
 * @param {Buffer} inputBuffer
 * @returns {Promise<Buffer>}
 */
export async function ensureWavBuffer(inputBuffer) {
  if (!inputBuffer || inputBuffer.length === 0) {
    return inputBuffer;
  }

  // If already a valid WAV header, pass through
  if (isWavBuffer(inputBuffer)) {
    return inputBuffer;
  }

  // Transcode WebM / Opus / other formats into 16kHz mono WAV via ffmpeg
  return new Promise((resolve) => {
    try {
      const ffmpeg = spawn("ffmpeg", [
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        "pipe:0",
        "-f",
        "wav",
        "-ar",
        "16000",
        "-ac",
        "1",
        "pipe:1",
      ]);

      const chunks = [];

      ffmpeg.stdout.on("data", (chunk) => chunks.push(chunk));
      ffmpeg.stderr.on("data", (err) => {
        console.warn("FFmpeg transcode info:", err.toString().trim());
      });

      ffmpeg.on("close", (code) => {
        if (code === 0 && chunks.length > 0) {
          const wavBuf = Buffer.concat(chunks);
          resolve(wavBuf);
        } else {
          console.warn(`FFmpeg transcode returned ${code}, passing raw buffer.`);
          resolve(inputBuffer);
        }
      });

      ffmpeg.on("error", (err) => {
        console.warn("FFmpeg spawn error, using raw buffer:", err.message);
        resolve(inputBuffer);
      });

      ffmpeg.stdin.write(inputBuffer);
      ffmpeg.stdin.end();
    } catch (err) {
      console.warn("FFmpeg execution error:", err.message);
      resolve(inputBuffer);
    }
  });
}
