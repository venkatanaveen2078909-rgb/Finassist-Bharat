import {
  GnaniError,
  GnaniAuthError,
  GnaniRateLimitError,
  GnaniInvalidInputError,
  GnaniTimeoutError,
  GnaniNetworkError,
} from "./errors.js";
import { ensureWavBuffer } from "../../utils/audioTranscoder.js";

const DEFAULT_STT_URL = "https://api.vachana.ai/stt/v3";
const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_BACKOFF_BASE_MS = 300;

/**
 * Normalizes language codes to Gnani-supported BCP-47 codes.
 */
export function normalizeLanguageCode(lang = "te-IN") {
  const map = {
    te: "te-IN",
    "te-in": "te-IN",
    "te-IN": "te-IN",
    hi: "hi-IN",
    "hi-in": "hi-IN",
    "hi-IN": "hi-IN",
    en: "en-IN",
    "en-in": "en-IN",
    "en-IN": "en-IN",
    auto: "indic-auto",
    "indic-auto": "indic-auto",
  };
  return map[lang] || lang || "te-IN";
}

/**
 * Extracts a flat text transcript from Gnani Prisma response.
 * When indic-auto / multi_lang_codes is used, Gnani returns an object like:
 * { "te-IN": "...", "hi-IN": "...", "en-IN": "..." }
 * This helper selects the spoken transcript.
 */
export function extractTranscriptText(rawTranscript, preferredLang = "te-IN") {
  if (!rawTranscript) return "";
  if (typeof rawTranscript === "string") return rawTranscript.trim();

  if (typeof rawTranscript === "object") {
    // 1. If an explicit language (not 'indic-auto' or 'auto') was requested, check it first
    if (preferredLang && preferredLang !== "indic-auto" && preferredLang !== "auto") {
      const explicit = rawTranscript[preferredLang];
      if (typeof explicit === "string" && explicit.trim()) {
        return explicit.trim();
      }
    }

    const te = (typeof rawTranscript["te-IN"] === "string" ? rawTranscript["te-IN"] : "").trim();
    const hi = (typeof rawTranscript["hi-IN"] === "string" ? rawTranscript["hi-IN"] : "").trim();
    const en = (typeof rawTranscript["en-IN"] === "string" ? rawTranscript["en-IN"] : "").trim();

    // 2. If te-IN has Telugu script (\u0C00-\u0C7F), Telugu or code-mixed Telugu was spoken!
    // Gnani only emits Telugu Unicode when Telugu / Tenglish was spoken. Never drop it for English.
    if (te && /[\u0C00-\u0C7F]/.test(te)) {
      return te;
    }

    // 3. If hi-IN has Devanagari script and contains genuine Hindi financial words/particles
    const hasHindiWords =
      /[\u0900-\u097F]/.test(hi) &&
      /\b(लोन|ऋण|ब्याज|साल|महीने|चाहिए|कितना|रुपये|हजार|लाख|करोड़|बचत|खर्च|वेतन|आय|आमदनी|है|का|की|के|में|पर|से|एसआईपी|एफडी|डिपॉजिट)\b/.test(
        hi
      );
    if (hasHindiWords) {
      return hi;
    }

    // 4. If en-IN contains Latin characters (English words), English / Romanized Hinglish was spoken!
    // Gnani often returns phonetic Devanagari in hi-IN alongside proper English in en-IN:
    // e.g. hi-IN: "आई वॉन्ट यू टू कैलकुलेट दी ईएमआई" vs en-IN: "I want you to calculate the EMI"
    // English words in Latin script must be preferred over phonetic Devanagari transliteration.
    if (en && /[a-zA-Z]{2,}/.test(en)) {
      return en;
    }

    // 5. If hi-IN has any Devanagari script (\u0900-\u097F), Hindi was spoken
    if (hi && /[\u0900-\u097F]/.test(hi)) {
      return hi;
    }

    // 5. Fallback to whichever candidate is non-empty and longest
    const candidates = [en, te, hi].filter(Boolean);
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.length - a.length);
      return candidates[0];
    }

    for (const key of Object.keys(rawTranscript)) {
      const val = rawTranscript[key];
      if (typeof val === "string" && val.trim()) {
        return val.trim();
      }
    }
  }

  return "";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Speech-to-Text via Gnani Prisma v2.5 REST API.
 *
 * @param {Buffer|Uint8Array} audioBuffer - Audio file bytes (WAV, MP3, etc.)
 * @param {Object} options
 * @param {string} [options.language="te-IN"] - Language code (te-IN, hi-IN, en-IN, indic-auto)
 * @param {string} [options.multiLangCodes] - Comma-separated locales required when language=indic-auto (e.g. "te-IN,hi-IN,en-IN")
 * @param {string} [options.filename="audio.wav"] - Filename for form payload
 * @param {string} [options.mimeType="audio/wav"] - Audio MIME type
 * @param {number} [options.timeoutMs=15000] - Request timeout in milliseconds
 * @param {number} [options.maxRetries=2] - Number of retries on transient errors
 * @param {string} [options.apiKey] - Optional explicit API key
 * @param {string} [options.endpoint] - Optional custom endpoint URL
 * @returns {Promise<{transcript: string, language: string, durationMs: number, requestId: string, model: string, raw: any}>}
 */
export async function sttRest(audioBuffer, options = {}) {
  const apiKey = options.apiKey || process.env.GNANI_API_KEY;
  if (!apiKey) {
    throw new GnaniAuthError("GNANI_API_KEY is not configured", { stage: "STT" });
  }

  if (!audioBuffer || !(audioBuffer.length > 0)) {
    throw new GnaniInvalidInputError("Audio buffer cannot be empty", { stage: "STT" });
  }

  // Ensure buffer is a valid 16kHz mono WAV supported by Gnani STT
  const validWavBuffer = await ensureWavBuffer(audioBuffer);

  const endpoint = options.endpoint || DEFAULT_STT_URL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const backoffBaseMs = options.backoffBaseMs ?? DEFAULT_BACKOFF_BASE_MS;
  const languageCode = normalizeLanguageCode(options.language || "te-IN");
  const mimeType = "audio/wav";
  const filename = "audio.wav";

  // Gnani API requires multi_lang_codes when using indic-auto
  const multiLangCodes =
    options.multiLangCodes ||
    (languageCode === "indic-auto" ? "te-IN,hi-IN,en-IN" : null);

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const startTime = performance.now();
    try {
      const formData = new FormData();
      const blob = new Blob([validWavBuffer], { type: mimeType });
      formData.append("audio_file", blob, filename);
      formData.append("language_code", languageCode);
      if (multiLangCodes) {
        formData.append("multi_lang_codes", multiLangCodes);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      let response;
      try {
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "X-API-Key-ID": apiKey,
          },
          body: formData,
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
          throw new GnaniAuthError(`STT Authentication failed: ${errMsg}`, {
            stage: "STT",
            statusCode: response.status,
          });
        }

        if (response.status === 429) {
          throw new GnaniRateLimitError(`STT Rate limit exceeded: ${errMsg}`, {
            stage: "STT",
            statusCode: 429,
          });
        }

        if (response.status === 400) {
          throw new GnaniInvalidInputError(`STT Invalid input: ${errMsg}`, {
            stage: "STT",
            statusCode: 400,
          });
        }

        // 5xx errors are transient and can be retried
        throw new GnaniNetworkError(`STT Server error: ${errMsg}`, {
          stage: "STT",
          statusCode: response.status,
        });
      }

      const data = await response.json();
      const transcriptText = extractTranscriptText(data.transcript, languageCode);
      return {
        transcript: transcriptText,
        detectedLanguages: typeof data.transcript === "object" ? data.transcript : null,
        language: languageCode,
        durationMs,
        requestId: data.request_id || "",
        model: data.model || "gnani-prisma-v2.5",
        raw: data,
      };
    } catch (err) {
      lastError = err;

      // Do not retry on non-transient errors (invalid input or auth)
      if (err instanceof GnaniAuthError || err instanceof GnaniInvalidInputError) {
        throw err;
      }

      // Detect timeout
      if (err.name === "AbortError") {
        lastError = new GnaniTimeoutError(`STT request timed out after ${timeoutMs}ms`, {
          stage: "STT",
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
