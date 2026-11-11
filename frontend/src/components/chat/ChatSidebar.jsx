import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bot,
  LayoutDashboard,
  FileText,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Shield,
  Landmark,
  TrendingUp,
  PieChart,
  Brain,
  Sparkles,
  Headphones,
} from "lucide-react";

const SPECIALIST_AGENTS = [
  { id: "Loan Agent", name: "Loan Agent", icon: Landmark, color: "text-blue-400", bg: "bg-blue-500/10" },
  { id: "Investment Agent", name: "Investment Agent", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { id: "Budget Agent", name: "Budget Agent", icon: PieChart, color: "text-amber-400", bg: "bg-amber-500/10" },
  { id: "Memory Agent", name: "Memory Agent", icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10" },
  { id: "Security Guard", name: "Security Guard", icon: Shield, color: "text-rose-400", bg: "bg-rose-500/10" },
];

function ChatSidebar({ isOpen, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeAgent, setActiveAgent] = useState(null);

  useEffect(() => {
    const handleAgentActive = (e) => {
      const agentName = e.detail?.agent;
      if (agentName) {
        setActiveAgent(agentName);
      }
    };

    window.addEventListener("finassist:agent_active", handleAgentActive);
    return () => window.removeEventListener("finassist:agent_active", handleAgentActive);
  }, []);

  return (
    <aside
      className={`relative h-full flex flex-col justify-between border-r border-white/[0.08] bg-[#070b14] transition-all duration-300 z-30 shrink-0 ${
        isOpen ? "w-64 p-4" : "w-16 p-2 items-center"
      }`}
    >
      {/* Top Section */}
      <div className="space-y-4">
        {/* Brand Logo & Collapse Toggle */}
        <div className={`flex items-center ${isOpen ? "justify-between" : "justify-center"} pb-3 border-b border-white/[0.06]`}>
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
              <Bot className="w-4 h-4 text-white" />
            </div>
            {isOpen && (
              <div>
                <span className="font-bold text-sm tracking-wide text-white block">
                  FinAssist
                </span>
                <span className="text-[10px] text-blue-400 font-medium tracking-wider uppercase block">
                  Bharat Voice
                </span>
              </div>
            )}
          </div>

          {isOpen && (
            <button
              onClick={onToggle}
              title="Collapse sidebar"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => {
            localStorage.removeItem("finassist_session_id");
            window.location.reload();
          }}
          className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-blue-600/20 transition active:scale-95 ${
            isOpen ? "w-full py-2.5 px-3 text-xs" : "w-10 h-10 p-0"
          }`}
          title="Start fresh conversation"
        >
          <Plus className="w-4 h-4" />
          {isOpen && <span>New Session</span>}
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex items-center gap-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition ${
              isOpen ? "w-full px-3 py-2" : "w-10 h-10 justify-center p-0"
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
            {isOpen && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => navigate("/reports")}
            className={`flex items-center gap-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition ${
              isOpen ? "w-full px-3 py-2" : "w-10 h-10 justify-center p-0"
            }`}
            title="Reports"
          >
            <FileText className="w-4 h-4" />
            {isOpen && <span>Reports</span>}
          </button>
        </nav>

        {/* Specialist Multi-Agent Rail */}
        {isOpen && (
          <div className="pt-3 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Specialist Agents
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                5 Online
              </span>
            </div>

            <div className="space-y-1">
              {SPECIALIST_AGENTS.map((agent) => {
                const Icon = agent.icon;
                const isActive = activeAgent === agent.id;
                return (
                  <div
                    key={agent.id}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                      isActive
                        ? "bg-blue-500/10 border border-blue-500/30 text-white font-medium"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${agent.bg} ${agent.color}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="text-[11px] truncate">{agent.name}</span>
                    </div>

                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping inline-block" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-800 inline-block" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer / Collapse Expansion Toggle */}
      <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
        {!isOpen && (
          <button
            onClick={onToggle}
            title="Expand sidebar"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {isOpen && (
          <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500">
            <Headphones className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">Gnani.ai Prisma &amp; Timbre</span>
          </div>
        )}
      </div>
    </aside>
  );
}

export default ChatSidebar;
