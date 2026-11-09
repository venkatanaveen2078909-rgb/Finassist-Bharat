import { execSync } from "child_process";

const PORTS = [5001, 5173];

for (const port of PORTS) {
  try {
    if (process.platform === "win32") {
      const output = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      const lines = output.trim().split("\n");
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(Number(pid)) && pid !== "0") {
          console.log(`[clean-ports] Stopping PID ${pid} holding port ${port}...`);
          execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
        }
      }
    } else {
      execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: "ignore" });
    }
  } catch {
    // Port is already free
  }
}

console.log("✅ Ports 5001 and 5173 are clean and ready.");
