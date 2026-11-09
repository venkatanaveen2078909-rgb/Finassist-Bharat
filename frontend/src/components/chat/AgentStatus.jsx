import MemoryPanel from "./MemoryPanel";

function AgentStatus({
  agent = "Waiting...",
  intent = "GENERAL",
  tool = "None",
  confidence = "98%",
  privacy = {
    enabled: false,
    risk: "NOT_SCANNED",
    findingsCount: 0,
  },
}) {
  return (
    <aside className="w-80 overflow-y-auto border-l border-slate-800 bg-slate-900 p-6">
      <h2 className="text-2xl font-bold text-cyan-400">🤖 Agent Status</h2>

      <div className="mt-8 space-y-6">
        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400">Active Agent</p>
          <h3 className="mt-2 text-xl font-bold text-white">{agent}</h3>
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400">Intent</p>
          <h3 className="mt-2 text-xl font-bold text-yellow-400">{intent}</h3>
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400">Tool Used</p>
          <h3 className="mt-2 text-xl font-bold text-green-400">{tool}</h3>
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400">UPLAI Privacy</p>
          <h3 className="mt-2 text-xl font-bold text-pink-400">
            {privacy.enabled ? privacy.risk : "UPLAI Off"}
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            Findings: {privacy.findingsCount}
          </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400">Confidence</p>
          <h3 className="mt-2 text-xl font-bold text-cyan-400">{confidence}</h3>
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400">Model</p>
          <h3 className="mt-2 text-xl font-bold text-purple-400">
            Gemini 2.5 Flash
          </h3>
        </div>

        <MemoryPanel />
      </div>
    </aside>
  );
}

export default AgentStatus;