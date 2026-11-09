import { voiceOrchestrator } from "../agents/voiceOrchestrator.js";
import { getSession, resetSession } from "../memory/sessionStore.js";
import { redactSensitiveData } from "../services/privacyRedactor.js";

export const chat = async (req, res) => {
  try {
    const { message, sessionId = "default" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const privacyResult = redactSensitiveData(message);
    const safeMessage = privacyResult.redactedText;

    const result = await voiceOrchestrator(safeMessage, { sessionId });

    return res.json({
      success: true,
      agent: result.agent,
      reply: result.reply,
      data: result.data || null,
      parsedFields: result.parsedFields || null,
      pendingConfirmation: result.pendingConfirmation || false,
      lastActivity: result.activeContext || null,
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
      message: "Chat failed",
      error: error.message,
    });
  }
};

export const getChatMemory = (req, res) => {
  try {
    const sessionId = req.query?.sessionId || "default";
    const session = getSession(sessionId);

    return res.json({
      success: true,
      memory: session.profile,
      lastActivity: session.lastActivity || null,
      historyCount: session.conversationHistory?.length || 0,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get memory",
      error: error.message,
    });
  }
};

export const resetChatMemory = (req, res) => {
  try {
    const sessionId = req.body?.sessionId || req.query?.sessionId || "default";
    resetSession(sessionId);

    return res.json({
      success: true,
      message: "Memory reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reset memory",
      error: error.message,
    });
  }
};
