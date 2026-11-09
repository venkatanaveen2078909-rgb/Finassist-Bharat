export { sttRest, normalizeLanguageCode } from "./sttRest.js";
export { ttsRest } from "./ttsRest.js";
export * from "./errors.js";

import { sttRest } from "./sttRest.js";
import { ttsRest } from "./ttsRest.js";

/**
 * Speech service interface wrapper.
 */
export class GnaniSpeechService {
  constructor(config = {}) {
    this.config = config;
  }

  async transcribe(audioBuffer, options = {}) {
    return await sttRest(audioBuffer, { ...this.config, ...options });
  }

  async synthesize(text, options = {}) {
    return await ttsRest(text, { ...this.config, ...options });
  }
}

export const defaultSpeechService = new GnaniSpeechService();
