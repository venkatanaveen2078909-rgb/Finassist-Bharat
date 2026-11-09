import React from "react";
import { Mic, FileText, Sparkles, ArrowRight, Shield, Globe2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function WelcomeCard({ profile }) {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/30 p-8 shadow-2xl backdrop-blur-xl">
      {/* Background glow orbs */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sovereign Indic Voice Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Welcome to FinAssist Bharat 🇮🇳
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Your personal financial voice assistant powered by <strong>Gnani.ai Prisma &amp; Timbre</strong>. Compute reducing-balance EMI, check 50% FOIR loan eligibility, plan compounding SIP &amp; FD, and analyze monthly budgets in Telugu, Hindi, and English.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              Telugu • Hindi • English
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Prompt Injection &amp; PII Protected
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition active:scale-95 group"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span>Start Voice Assistant</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={() => navigate("/reports")}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white transition"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Financial Planning Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeCard;
