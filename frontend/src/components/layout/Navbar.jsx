import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, Sparkles, LayoutDashboard, FileText, ArrowRight } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-2xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-indigo-300 transition">
                FinAssist Bharat
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Sovereign Indic Financial Voice Assistant
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center gap-2 text-sm font-semibold">
          <button
            onClick={() => navigate("/dashboard")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              location.pathname === "/dashboard"
                ? "bg-white/[0.08] text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => navigate("/reports")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              location.pathname === "/reports"
                ? "bg-white/[0.08] text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Reports</span>
          </button>

          <button
            onClick={() => navigate("/chat")}
            className="ml-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition active:scale-95 group"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span>Voice Assistant</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </button>
        </div>

        {/* Mobile View CTA */}
        <div className="flex md:hidden">
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md"
          >
            <Mic className="w-4 h-4" />
            <span>Voice Chat</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
