import { voiceOrchestrator } from "../agents/voiceOrchestrator.js";
import { redactSensitiveData } from "../services/privacyRedactor.js";
import { detectPromptInjection } from "../middleware/promptInjectionGuard.js";
import { sttRest, ttsRest } from "../services/gnani/index.js";

/**
 * Handles binary audio recording from frontend MediaRecorder.
 * Pipeline: Audio -> Gnani Prisma STT -> Security & Privacy -> Orchestrator -> Gnani Timbre TTS -> Audio Response.
 */
export const processAudio = async (req, res) => {
  const overallStart = performance.now();
  try {
    if (!req.file || !req.file.buffer || req.file.buffer.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required",
      });
    }

    const sessionId = req.body?.sessionId || "default";
    const language = req.body?.language || "indic-auto";

    // 1. Gnani Prisma STT
    let sttResult;
    try {
      sttResult = await sttRest(req.file.buffer, {
        language,
        filename: req.file.originalname || "recording.wav",
        mimeType: req.file.mimetype || "audio/wav",
      });
    } catch (sttErr) {
      return res.status(502).json({
        success: false,
        stage: "STT",
        message: `Gnani STT failed: ${sttErr.message}`,
        error: sttErr.message,
      });
    }

    let transcript = (
      typeof sttResult.transcript === "string"
        ? sttResult.transcript
        : String(sttResult.transcript || "")
    ).trim();

    // If auto-detect returned empty transcript on non-trivial audio, fall back once to en-IN (prisma-v2.5)
    if (!transcript && language === "indic-auto" && req.file.buffer.length > 8000) {
      try {
        const retryStt = await sttRest(req.file.buffer, {
          language: "en-IN",
          filename: req.file.originalname || "recording.wav",
          mimeType: req.file.mimetype || "audio/wav",
          timeoutMs: 10000,
          maxRetries: 0,
        });
        const retryText = (
          typeof retryStt.transcript === "string"
            ? retryStt.transcript
            : String(retryStt.transcript || "")
        ).trim();
        if (retryText) {
          sttResult = retryStt;
          transcript = retryText;
        }
      } catch {
        // Keep primary result cleanly
      }
    }

    if (!transcript) {
      const emptyReply = language.startsWith("en")
        ? "No speech words detected. Please check your selected microphone and speak clearly."
        : language.startsWith("hi")
        ? "आवाज़ स्पष्ट सुनाई नहीं दी। कृपया माइक्रोफोन के पास स्पष्ट बोलें।"
        : "స్పష్టమైన మాటలు వినపడలేదు. దయచేసి మైక్ దగ్గరగా స్పష్టంగా మాట్లాడండి. / No speech detected — please check your mic and speak clearly.";
      return res.json({
        success: true,
        transcript: "",
        agent: "Voice Orchestrator",
        reply: emptyReply,
        audioBase64: null,
        latencies: {
          sttMs: sttResult.durationMs,
          toolMs: 0,
          ttsMs: 0,
          totalMs: Math.round(performance.now() - overallStart),
        },
      });
    }

    // 2. Security: Prompt Injection Guard on Spoken Transcript
    if (detectPromptInjection(transcript)) {
      return res.status(400).json({
        success: false,
        error: "SECURITY_VIOLATION",
        message: "Prompt injection attempt detected in spoken transcript",
        reply: "భద్రతా కారణాల వల్ల ఈ సూచనను అమలు చేయలేము. / Security rules prevent executing this prompt.",
        transcript,
      });
    }

    // 3. Privacy Redaction
    const privacyResult = redactSensitiveData(transcript);

    // 4. Voice Orchestrator & Deterministic Tools
    const toolStart = performance.now();
    const result = await voiceOrchestrator(privacyResult.redactedText, {
      sessionId,
      language,
      sttDetectedLanguage: sttResult.detectedLanguageCode || null,
    });
    const toolMs = Math.round(performance.now() - toolStart);

    // 5. Gnani Timbre TTS (synthesize concise spoken text for fast <2s voice response)
    const spokenText = result.reply
      .replace(/\s*\([^)]*\)/g, "")
      .trim() || result.reply;

    let ttsResult = null;
    let audioBase64 = null;
    const ttsLang = result.detectedLanguage || (language.startsWith("en") ? "en" : language.startsWith("hi") ? "hi" : "te");
    try {
      ttsResult = await ttsRest(spokenText, {
        voice: "Yukti",
        model: "timbre-v2.5",
        language: ttsLang,
        speed: 1.0,
        container: "wav",
        timeoutMs: 12000,
        maxRetries: 1,
      });
      audioBase64 = ttsResult.audioBuffer.toString("base64");
    } catch (ttsErr) {
      console.warn("TTS generation skipped (falling back to text reply):", ttsErr.message);
    }

    const totalMs = Math.round(performance.now() - overallStart);

    return res.json({
      success: true,
      transcript,
      agent: result.agent,
      reply: result.reply,
      detectedLanguage: result.detectedLanguage || ttsLang,
      audioBase64,
      audioMimeType: "audio/wav",
      data: result.data || null,
      parsedFields: result.parsedFields || null,
      pendingConfirmation: result.pendingConfirmation || false,
      needsClarification: result.needsClarification || false,
      lastActivity: result.activeContext || null,
      latencies: {
        sttMs: sttResult.durationMs,
        toolMs,
        ttsMs: ttsResult?.durationMs || 0,
        totalMs,
      },
      privacy: {
        enabled: true,
        redacted: privacyResult.isSensitive,
        findings: privacyResult.findings,
        findingsCount: privacyResult.findings.length,
      },
    });
  } catch (error) {
    console.error("Audio processing failed error:", error);
    return res.status(500).json({
      success: false,
      message: "Audio processing failed",
      error: error.message,
    });
  }
};

/**
 * Handles text queries (fallback & typed mode).
 */
export const voiceMessage = async (req, res) => {
  const overallStart = performance.now();
  try {
    const rawTranscript = req.body?.transcript || req.body?.message;
    const sessionId = req.body?.sessionId || "default";
    const language = req.body?.language || "indic-auto";

    if (!rawTranscript || typeof rawTranscript !== "string") {
      return res.status(400).json({
        success: false,
        message: "Transcript or message is required",
      });
    }

    if (detectPromptInjection(rawTranscript)) {
      return res.status(400).json({
        success: false,
        error: "SECURITY_VIOLATION",
        message: "Prompt injection attempt detected",
        reply: "భద్రతా కారణాల వల్ల ఈ సూచనను అమలు చేయలేము.",
      });
    }

    const privacyResult = redactSensitiveData(rawTranscript);

    const toolStart = performance.now();
    const result = await voiceOrchestrator(privacyResult.redactedText, {
      sessionId,
      language,
    });
    const toolMs = Math.round(performance.now() - toolStart);

    const spokenText = result.reply
      .replace(/\s*\([^)]*\)/g, "")
      .trim() || result.reply;

    let ttsResult = null;
    let audioBase64 = null;
    const ttsLang = result.detectedLanguage || (language.startsWith("en") ? "en" : language.startsWith("hi") ? "hi" : "te");
    try {
      ttsResult = await ttsRest(spokenText, {
        voice: "Yukti",
        model: "timbre-v2.5",
        language: ttsLang,
        speed: 1.0,
        container: "wav",
        timeoutMs: 12000,
        maxRetries: 1,
      });
      audioBase64 = ttsResult.audioBuffer.toString("base64");
    } catch (ttsErr) {
      console.warn("TTS generation skipped for text fallback:", ttsErr.message);
    }

    const totalMs = Math.round(performance.now() - overallStart);

    return res.json({
      success: true,
      transcript: rawTranscript,
      agent: result.agent,
      reply: result.reply,
      detectedLanguage: result.detectedLanguage || ttsLang,
      audioBase64,
      audioMimeType: "audio/wav",
      data: result.data || null,
      parsedFields: result.parsedFields || null,
      pendingConfirmation: result.pendingConfirmation || false,
      needsClarification: result.needsClarification || false,
      lastActivity: result.activeContext || null,
      latencies: {
        sttMs: 0,
        toolMs,
        ttsMs: ttsResult?.durationMs || 0,
        totalMs,
      },
      privacy: {
        enabled: true,
        redacted: privacyResult.isSensitive,
        findings: privacyResult.findings,
        findingsCount: privacyResult.findings.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Voice orchestration failed",
      error: error.message,
    });
  }
};