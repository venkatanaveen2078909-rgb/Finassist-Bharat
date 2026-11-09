import { useEffect, useState } from "react";

function SystemStatus() {
  const [backend, setBackend] = useState("Checking...");
  const [memory, setMemory] = useState("Checking...");

  useEffect(() => {
    fetch("http://localhost:5001")
      .then((res) => res.json())
      .then(() => setBackend("Online ✅"))
      .catch(() => setBackend("Offline ❌"));

    fetch("http://localhost:5001/api/chat/memory")
      .then((res) => res.json())
      .then((data) => setMemory(`${data.memory?.length || 0} messages ✅`))
      .catch(() => setMemory("Unavailable ❌"));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="text-4xl font-bold text-cyan-400">
        FinAssist AI System Status
      </h1>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-900 p-6">
          <h2 className="text-xl font-bold">Frontend</h2>
          <p className="mt-3 text-green-400">Online ✅</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-6">
          <h2 className="text-xl font-bold">Backend</h2>
          <p className="mt-3 text-green-400">{backend}</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-6">
          <h2 className="text-xl font-bold">Agent System</h2>
          <p className="mt-3 text-green-400">
            Orchestrator + Specialist Agents ✅
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-6">
          <h2 className="text-xl font-bold">Memory</h2>
          <p className="mt-3 text-green-400">{memory}</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-6">
          <h2 className="text-xl font-bold">Tools</h2>
          <p className="mt-3 text-green-400">
            EMI + Budget Analyzer ✅
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-6">
          <h2 className="text-xl font-bold">UPLAI Privacy</h2>
          <p className="mt-3 text-yellow-400">
            Depends on UPLAI server availability
          </p>
        </div>
      </div>
    </div>
  );
}

export default SystemStatus;