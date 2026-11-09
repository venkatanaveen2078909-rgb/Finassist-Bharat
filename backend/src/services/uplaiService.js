import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const scanWithUPLAI = async (text) => {
  try {
    if (!process.env.UPLAI_URL) {
      return {
        enabled: false,
        risk: "NOT_CONFIGURED",
        findings: [],
        safeText: text,
      };
    }

    const response = await axios.post(process.env.UPLAI_URL, {
      text,
      prompt: text,
      content: text,
    });

    return {
      enabled: true,
      risk: response.data?.risk || "SCANNED",
      findings: response.data?.findings || response.data?.regex_findings || [],
      safeText: response.data?.masked_text || response.data?.safe_text || text,
      raw: response.data,
    };
  } catch (error) {
    console.log("UPLAI scan failed. Continuing without blocking.");

    return {
      enabled: false,
      risk: "UPLAI_UNAVAILABLE",
      findings: [],
      safeText: text,
    };
  }
};