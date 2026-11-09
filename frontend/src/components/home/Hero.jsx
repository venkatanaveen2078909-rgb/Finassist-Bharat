import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic, ArrowRight, Sparkles, LayoutDashboard, Send, TrendingUp, Landmark, PieChart } from "lucide-react";

function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const text = query.trim();
    if (!text) {
      navigate("/chat");
      return;
    }
    navigate("/chat", { state: { initialQuery: text } });
  };

  const handleQuickPrompt = (promptText) => {
    navigate("/chat", { state: { initialQuery: promptText } });
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center px-6 pt-28 pb-16 overflow-hidden">
      {/* Dynamic glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-indigo-600/15 via-blue-600/15 to-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-5xl text-center space-y-7 relative z-10 w-full"
      >
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-semibold text-slate-300 shadow-xl backdrop-blur-xl">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>Sovereign Indic Voice Architecture</span>
          <span className="w-1 h-1 rounded-full bg-slate-500" />
          <span className="text-cyan-400">Gnani Prisma &amp; Timbre</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1]">
          FinAssist Bharat{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Voice AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
          Speak naturally in <strong>Telugu, Hindi, or English</strong>. Calculate reducing-balance EMI, evaluate RBI 50% FOIR debt capacity, compound monthly SIPs, and track savings velocity with 100% deterministic mathematical precision.
        </p>

        {/* Interactive Direct Voice & Query Bar */}
        <div className="max-w-2xl mx-auto w-full pt-1">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center rounded-2xl bg-slate-900/80 border border-white/[0.12] focus-within:border-indigo-500/80 shadow-2xl backdrop-blur-xl p-2 transition"
          >
            <button
              type="button"
              onClick={() => navigate("/chat")}
              title="Launch Live Voice Assistant"
              className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition shrink-0 group active:scale-95"
            >
              <Mic className="w-5 h-5 group-hover:scale-110 transition animate-pulse" />
            </button>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything: e.g. 5 lakh loan EMI, 5k monthly SIP, or Telugu query..."
              className="w-full bg-transparent px-4 py-2.5 text-sm sm:text-base text-white placeholder-slate-400 outline-none"
            />

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 hover:text-white transition shrink-0 active:scale-95"
            >
              <span>Ask AI</span>
              <Send className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </form>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {[
              {
                label: "💰 5 Lakh Loan (Tenglish)",
                query: "naaku 5 lakh loan kavali for 5 years at 9.5% interest",
              },
              {
                label: "📈 5000 SIP (Hinglish)",
                query: "5000 monthly SIP 10 saal ke liye 12 percent return pe kitna milega",
              },
              {
                label: "🇮🇳 5 లక్షల లోన్ (తెలుగు)",
                query: "5 లక్షల లోన్ కు 8.5% వడ్డీతో 3 సంవత్సరాలకు EMI ఎంత?",
              },
              {
                label: "🛡️ Salary & Kharch (Hinglish)",
                query: "meri salary 75000 hai aur kharcha 25000",
              },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(item.query)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition active:scale-95"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dual CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
          <button
            onClick={() => navigate("/chat")}
            className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-xl shadow-indigo-600/25 transition active:scale-95 group"
          >
            <Mic className="w-5 h-5 animate-pulse" />
            <span>Open Voice Assistant</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] px-8 py-3.5 text-sm sm:text-base font-semibold text-slate-200 hover:text-white transition active:scale-95"
          >
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            <span>Open Dynamic Dashboard</span>
          </button>
        </div>

        {/* Telemetry Highlights */}
        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto border-t border-white/[0.06]">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-xl font-black text-white">105 / 105</p>
            <p className="text-xs text-slate-400">Deterministic Engine Tests</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-xl font-black text-cyan-400">3 Indic</p>
            <p className="text-xs text-slate-400">Telugu • Hindi • English</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-xl font-black text-emerald-400">50% FOIR</p>
            <p className="text-xs text-slate-400">RBI Underwriting Standard</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-xl font-black text-indigo-400">&lt; 2.5s</p>
            <p className="text-xs text-slate-400">Cloud Timbre Synthesis</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default Hero;
