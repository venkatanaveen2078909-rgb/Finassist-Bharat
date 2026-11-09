import { scanWithUPLAI } from "../services/uplaiService.js";

export const testPrivacy = async (req, res) => {
  try {
    const { message } = req.body;

    const before = {
      stage: "Before UPLAI",
      text: message,
      protected: false,
    };

    const scan = await scanWithUPLAI(message);

    const after = {
      stage: "After UPLAI",
      text: scan.safeText,
      protected: scan.enabled,
      risk: scan.risk,
      findingsCount: Array.isArray(scan.findings)
        ? scan.findings.length
        : scan.findings || 0,
    };

    res.json({
      success: true,
      before,
      after,
      raw: scan.raw || null,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Privacy test failed",
    });
  }
};