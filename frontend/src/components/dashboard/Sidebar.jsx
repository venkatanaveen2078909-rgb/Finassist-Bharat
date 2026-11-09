import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Mic,
  FileText,
  Settings,
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Radio,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Voice Assistant", path: "/chat", icon: Mic, badge: "Live AI" },
    { label: "Financial Reports", path: "/reports", icon: FileText },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#070b14] border-r border-white/[0.06] p-5 flex flex-col justify-between shrink-0 z-30">
      <div className="space-y-6">
        {/* Brand */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide">
              FinAssist
            </h1>
            <p className="text-[10px] text-blue-400 font-medium tracking-wider uppercase">
              Bharat Voice AI
            </p>
          </div>
        </div>

        {/* Quick Launch Voice AI Pill */}
        <button
          onClick={() => navigate("/chat")}
          className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 flex items-center justify-between transition group active:scale-95"
        >
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-bold tracking-wide">Speak to Assistant</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
        </button>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white/[0.08] text-white border border-white/[0.1] shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-medium border border-blue-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Speech Engine Live Status Box */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              Speech Pipeline
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Online</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>STT Engine:</span>
              <span className="text-slate-300 font-medium">Gnani Prisma</span>
            </div>
            <div className="flex justify-between">
              <span>TTS Voice:</span>
              <span className="text-slate-300 font-medium">Yukti (v2.5)</span>
            </div>
            <div className="flex justify-between">
              <span>Languages:</span>
              <span className="text-slate-300 font-medium">TE / HI / EN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Shield */}
      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Security Guard Active</span>
        </div>
        <span className="text-[10px] font-mono text-slate-600">v2.0</span>
      </div>
    </aside>
  );
}

export default Sidebar;
