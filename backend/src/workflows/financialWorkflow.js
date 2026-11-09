import { orchestratorAgent } from "../agents/orchestratorAgent.js";
import {
  saveMessage,
  getMemory,
} from "../memory/conversationMemory.js";
import { scanWithUPLAI } from "../services/uplaiService.js";

export const financialWorkflow = async (message) => {
  saveMessage("user", message);

  const privacyScan = await scanWithUPLAI(message);

  const agentResult = await orchestratorAgent(privacyScan.safeText);

  saveMessage("assistant", agentResult.reply);

  return {
    success: true,
    originalMessage: message,
    protectedMessage: privacyScan.safeText,
    privacy: {
      enabled: privacyScan.enabled,
      risk: privacyScan.risk,
      findingsCount: Array.isArray(privacyScan.findings)
        ? privacyScan.findings.length
        : privacyScan.findings || 0,
    },
    intent: agentResult.intent,
    agent: agentResult.selectedAgent,
    tool: agentResult.tool,
    reply: agentResult.reply,
    memoryCount: getMemory().length,
    workflow: [
      "User Message",
      "UPLAI Privacy Scan",
      "Orchestrator Agent",
      "Specialist Agent",
      "Tool Execution",
      "Planner Agent",
      "Memory Save",
      "Final Response",
    ],
  };
};