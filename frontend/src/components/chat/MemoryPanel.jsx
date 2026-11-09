import React, { useEffect, useState } from "react";
import { getChatMemory, resetChatMemory } from "../../services/chatService";
import { Brain, RefreshCw, Trash2, CheckCircle, Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

function MemoryPanel() {
  const [memory, setMemory] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  const loadMemory = async () => {
    setIsRefreshing(true);
    try {
      const res = await getChatMemory();
      if (res && res.memory) {
        setMemory(res.memory);
        setLastSynced(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Memory fetch failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearMemory = async () => {
    await resetChatMemory();
    await loadMemory();
  };

  useEffect(() => {
    loadMemory();

    // Auto-refresh memory when confirmed in VoiceAssistant
    const handleMemoryUpdated = () => {
      loadMemory();
    };

    window.addEventListener("finassist:memory_updated", handleMemoryUpdated);
    return () => window.removeEventListener("finassist:memory_updated", handleMemoryUpdated);
  }, []);

  const formatINR = (val) => {
    if (!val || isNaN(val)) return "₹0";
    return `₹${Number(val).toLocaleString("en-IN")}`;
  };

  const hasData = memory && (memory.income || memory.expenses || memory.emi || memory.goal);
  const netSavings = (memory?.income || 0) - (memory?.expenses || 0) - (memory?.emi || 0);

  return (
    <aside className="w-80 border-l border-slate-800 bg-slate-950 p-5 text-white flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Memory Agent
              </h2>
              <p className="text-[10px] text-slate-500">Per-Session Isolated Context</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Synced
          </span>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-inner space-y-3">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Confirmed Financial Profile
          </span>

          {!hasData ? (
            <div className="py-6 text-center text-slate-500 space-y-2">
              <p className="text-xs">No profile memory saved yet.</p>
              <p className="text-[11px] text-slate-600">
                Speak: <em>"My income is 50000"</em> and confirm with <em>"Yes"</em> to store.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              {/* Income */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Monthly Income
                </span>
                <span className="font-bold text-emerald-300">
                  {formatINR(memory.income)}
                </span>
              </div>

              {/* Expenses */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <ArrowDownCircle className="w-3.5 h-3.5 text-rose-400" />
                  Monthly Expenses
                </span>
                <span className="font-bold text-rose-300">
                  {formatINR(memory.expenses)}
                </span>
              </div>

              {/* Obligations / EMI */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Wallet className="w-3.5 h-3.5 text-amber-400" />
                  Existing EMI
                </span>
                <span className="font-bold text-amber-300">
                  {formatINR(memory.emi)}
                </span>
              </div>

              {/* Net Surplus */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-semibold">
                <span className="text-slate-400 text-[11px]">Est. Monthly Surplus</span>
                <span className={`text-xs ${netSavings >= 0 ? "text-cyan-300" : "text-rose-400"}`}>
                  {formatINR(netSavings)}
                </span>
              </div>

              {memory.goal && (
                <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[11px]">
                  <span className="text-indigo-400 block font-semibold">Primary Goal:</span>
                  <span className="text-slate-200">{memory.goal}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sync Status Timestamp */}
        {lastSynced && (
          <p className="text-[10px] text-slate-500 text-right mt-2 font-mono">
            Last synced: {lastSynced}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t border-slate-800">
        <button
          onClick={loadMemory}
          disabled={isRefreshing}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-semibold text-slate-200 transition active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Refresh Memory</span>
        </button>

        <button
          onClick={clearMemory}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 py-2.5 text-xs font-semibold text-rose-300 transition active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset Session Memory</span>
        </button>
      </div>
    </aside>
  );
}

export default MemoryPanel;
