import {
  GnaniError,
  GnaniAuthError,
  GnaniRateLimitError,
  GnaniInvalidInputError,
  GnaniTimeoutError,
  GnaniNetworkError,
} from "./errors.js";

const DEFAULT_TTS_URL = "https://api.vachana.ai/api/v1/tts/inference";
const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_BACKOFF_BASE_MS = 300;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Text-to-Speech via Gnani Timbre v2.5 REST API.
 *
 * @param {string} text - Text to synthesize into speech
 * @param {Object} options
 * @param {string} [options.voice="Yukti"] - Voice name from Gnani catalog (Yukti, Nalini, Avinash)
 * @param {string} [options.model="timbre-v2.5"] - Model version
 * @param {string} [options.language="te"] - Language code (te, hi, en)
 * @param {number} [options.speed=1.0] - Speech playback rate
 * @param {string} [options.container="wav"] - Container type (wav, mp3)
 * @param {number} [options.sampleRate=16000] - Sample rate in Hz
 * @param {number} [options.timeoutMs=15000] - Request timeout in milliseconds
 * @param {number} [options.maxRetries=2] - Number of retries on transient errors
 * @param {string} [options.apiKey] - Optional explicit API key
 * @param {string} [options.endpoint] - Optional custom endpoint URL
 * @returns {Promise<{audioBuffer: Buffer, contentType: string, durationMs: number}>}
 */
export async function ttsRest(text, options = {}) {
  const apiKey = options.apiKey || process.env.GNANI_API_KEY;
  if (!apiKey) {
    throw new GnaniAuthError("GNANI_API_KEY is not configured", { stage: "TTS" });
  }

  const cleanText = String(text || "").trim();
  if (!cleanText) {
    throw new GnaniInvalidInputError("TTS text cannot be empty", { stage: "TTS" });
  }

  const endpoint = options.endpoint || DEFAULT_TTS_URL;
  const voice = options.voice || "Yukti";
  const model = options.model || "timbre-v2.5";
  const language = options.language || (voice === "Yukti" ? "te" : "te");
  const speed = options.speed ?? 1.0;
  const container = options.container || "wav";
  const sampleRate = options.sampleRate ?? 16000;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const backoffBaseMs = options.backoffBaseMs ?? DEFAULT_BACKOFF_BASE_MS;

  const requestBody = {
    text: cleanText,
    voice,
    model,
    language,
    speed,
    audio_config: {
      container,
      sample_rate: sampleRate,
    },
  };

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      let response;
      try {
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "X-API-Key-ID": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const durationMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        let errBody = null;
        try {
          errBody = await response.json();
        } catch {
          errBody = await response.text();
        }

        const errMsg = typeof errBody === "object" && errBody?.error?.message
          ? errBody.error.message
          : `HTTP ${response.status} ${response.statusText}`;

        if (response.status === 401 || response.status === 403) {
          throw new GnaniAuthError(`TTS Authentication failed: ${errMsg}`, {
            stage: "TTS",
            statusCode: response.status,
          });
        }

        if (response.status === 429) {
          throw new GnaniRateLimitError(`TTS Rate limit exceeded: ${errMsg}`, {
            stage: "TTS",
            statusCode: 429,
          });
        }

        if (response.status === 400) {
          throw new GnaniInvalidInputError(`TTS Invalid input: ${errMsg}`, {
            stage: "TTS",
            statusCode: 400,
          });
        }

        throw new GnaniNetworkError(`TTS Server error: ${errMsg}`, {
          stage: "TTS",
          statusCode: response.status,
        });
      }

      const contentType = response.headers.get("content-type") || `audio/${container}`;
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      return {
        audioBuffer,
        contentType,
        durationMs,
      };
    } catch (err) {
      lastError = err;

      if (err instanceof GnaniAuthError || err instanceof GnaniInvalidInputError) {
        throw err;
      }

      if (err.name === "AbortError") {
        lastError = new GnaniTimeoutError(`TTS request timed out after ${timeoutMs}ms`, {
          stage: "TTS",
          cause: err,
        });
      }

      if (attempt < maxRetries) {
        const delay = backoffBaseMs * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}
