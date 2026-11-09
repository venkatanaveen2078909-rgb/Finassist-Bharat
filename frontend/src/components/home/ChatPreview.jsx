import React from "react";
import { Mic, Volume2, Sparkles, CheckCircle2, TrendingUp, Landmark } from "lucide-react";
import { motion } from "framer-motion";

function ChatPreview() {
  return (
    <section className="px-6 py-20 relative">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Agent Voice Preview</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Seamless Indic Speech &amp; Deterministic Intelligence
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            See how FinAssist Bharat captures spoken numbers in Telugu, Hindi, and English to deliver exact mathematical breakdowns.
          </p>
        </div>

        {/* Live Conversation Simulation Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Header pill */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-slate-300">Live Orchestration Preview</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400 font-mono">
              Latency: 642ms
            </span>
          </div>

          {/* User Voice Bubble */}
          <div className="flex items-start justify-end gap-3">
            <div className="space-y-1 text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-semibold text-blue-400">
                <Mic className="w-3 h-3" />
                <span>Voice (Telugu / Indic Phonetic)</span>
              </div>
              <div className="rounded-2xl rounded-tr-sm bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-600/20">
                "నాకు aid lakshadu లోన్ 9.5% వడ్డీతో 5 సంవత్సరాలకి EMI ఎంత అవుతుంది?"
              </div>
            </div>
          </div>

          {/* Assistant Response Bubble with Card */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>

            <div className="space-y-3 max-w-lg w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">FinAssist Bharat</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Loan Specialist Agent
                </span>
              </div>

              <div className="rounded-2xl rounded-tl-sm bg-slate-950/80 border border-white/[0.08] p-5 space-y-4">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  5 లక్షల రుణంపై 9.5% వార్షిక వడ్డీతో 5 సంవత్సరాలకు (60 నెలలు) మీ నెలవారీ EMI:
                </p>

                {/* Structured EMI Mini-Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">నెలవారీ EMI (Monthly EMI)</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">₹10,501</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/[0.05]">
                    <div>
                      <span className="text-slate-500 block">మొత్తం వడ్డీ (Total Interest)</span>
                      <span className="font-bold text-slate-200">₹1,30,064</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">మొత్తం చెల్లింపు (Total Payment)</span>
                      <span className="font-bold text-slate-200">₹6,30,064</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Gnani Timbre Telugu Audio Ready</span>
                  </span>
                  <span>(ఆర్ధిక సలహా కాదు / Estimate)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ChatPreview;
