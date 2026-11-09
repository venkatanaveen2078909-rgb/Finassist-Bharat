import fs from "fs";
import path from "path";

export const writeAuditLog = (data) => {
  try {
    const logsDir = path.join(process.cwd(), "logs");

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const logFile = path.join(logsDir, "audit.log");
    const logLine = JSON.stringify(data) + "\n";

    fs.appendFileSync(logFile, logLine);
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};